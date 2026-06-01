/* =========================================================
   PRINTQUOTE — calculator.js
   =========================================================
   Sections:
     1. Calculator
     2. GCode Reader
        – Smart file reading (first + last 30 KB)
        – Slicer detection: PrusaSlicer, OrcaSlicer,
          BambuStudio, SuperSlicer, Cura, IdeaMaker, Simplify3D
        – Per-slicer parsers (filament g, print hours, material)
        – Field flash animation on auto-fill
   ========================================================= */


/* =========================================================
   1. CALCULATOR
   ========================================================= */

function v(id) {
    return Number(document.getElementById(id).value) || 0;
}

function cur() {
    return document.getElementById("currency").value;
}

function mat() {
    return document.getElementById("material").value;
}

function setDisplay(id, val) {
    document.getElementById(id).innerText = cur() + " " + val.toFixed(2);
}

function calc() {
    const material    = (v("filamentUsed") / (v("spoolWeight") || 1)) * v("spoolPrice") * v("quantity");
    const electricity = (v("wattage") / 1000) * v("printHours") * v("electricity");
    const wear        = v("wear") * v("printHours");
    const subtotal    = material + electricity + wear + v("labor");
    const failure     = subtotal * (v("failure") / 100);
    const final       = (subtotal + failure) * (1 + v("profit") / 100);

    setDisplay("matCost",    material);
    setDisplay("elecCost",   electricity);
    setDisplay("wearCost",   wear);
    setDisplay("failCost",   failure);
    setDisplay("subtotal",   subtotal);
    setDisplay("finalPrice", final);

    document.getElementById("matLabel").innerText = "MATERIAL: " + mat();
}

// Attach listeners to all inputs/selects
document.querySelectorAll("input, select").forEach(el => el.addEventListener("input", calc));
calc();


/* =========================================================
   2. GCODE READER
   ========================================================= */

const gcodeInput = document.getElementById("gcodeFile");
if (gcodeInput) {
    gcodeInput.addEventListener("change", handleGcodeUpload);
}

/* ─── Entry point ─────────────────────────────────────── */
function handleGcodeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setStatus("Reading file…", "loading");

    const HEAD = 30 * 1024;  // 30 KB
    const TAIL = 30 * 1024;  // 30 KB

    if (file.size <= HEAD + TAIL) {
        // Small file — read all at once
        readBlob(file, text => processGcode(text, file.name));
    } else {
        // Large file — read head (Cura/IdeaMaker metadata) +
        //              tail (PrusaSlicer/Orca/Bambu metadata)
        readBlob(file.slice(0, HEAD), headText => {
            readBlob(file.slice(file.size - TAIL), tailText => {
                processGcode(headText + "\n" + tailText, file.name);
            });
        });
    }
}

function readBlob(blob, callback) {
    const reader = new FileReader();
    reader.onload  = e  => callback(e.target.result);
    reader.onerror = () => setStatus("Could not read file.", "error");
    reader.readAsText(blob);
}

/* ─── Slicer detection ────────────────────────────────── */
function detectSlicer(text) {
    if (text.includes("OrcaSlicer"))                                   return "orca";
    if (text.includes("BambuStudio"))                                  return "bambu";
    if (text.includes("PrusaSlicer"))                                  return "prusa";
    if (text.includes("SuperSlicer"))                                  return "superslicer";
    if (text.includes("Cura_SteamEngine"))                             return "cura";
    if (text.includes("ideaMaker") || text.includes("IdeaMaker"))      return "ideamaker";
    if (text.includes("Simplify3D"))                                   return "simplify3d";
    return "unknown";
}

/* ─── Main processor ──────────────────────────────────── */
function processGcode(text, filename) {
    const slicer = detectSlicer(text);

    if (slicer === "unknown") {
        setStatus("⚠  Slicer not recognised — fill in values manually.", "warning");
        return;
    }

    const data = parseGcode(text, slicer);
    applyGcodeData(data);

    // Build a summary line for the status bar
    const short  = filename.length > 30 ? filename.slice(0, 27) + "…" : filename;
    const parts  = [];
    if (data.filamentUsed > 0) parts.push(data.filamentUsed.toFixed(1) + " g");
    if (data.printHours   > 0) parts.push(hoursToLabel(data.printHours));
    if (data.material)         parts.push(data.material);

    setStatus(
        "✓  " + slicer.charAt(0).toUpperCase() + slicer.slice(1) +
        " · " + short +
        (parts.length ? " · " + parts.join(", ") : ""),
        "success"
    );
}

/* ─── Per-slicer parsers ──────────────────────────────── */
function parseGcode(text, slicer) {
    let filamentUsed = 0;
    let printHours   = 0;
    let material     = "";

    /* PrusaSlicer / OrcaSlicer / BambuStudio / SuperSlicer
       – Metadata is at the END of the file (inside the tail chunk).
       – All four share the same comment format.                        */
    if (["prusa", "orca", "bambu", "superslicer"].includes(slicer)) {

        const mGrams = text.match(/;\s*filament used \[g\]\s*=\s*([\d.]+)/i);
        if (mGrams) filamentUsed = parseFloat(mGrams[1]);

        const mType = text.match(/;\s*filament_type\s*=\s*([^\n;]+)/i);
        if (mType) material = mType[1].trim().toUpperCase();

        // Format example: "14h 20m 15s"  or  "1d 2h 3m"
        const mTime = text.match(/;\s*estimated printing time[^=]*=\s*([^\n]+)/i);
        if (mTime) printHours = parseTimeString(mTime[1].trim());
    }

    /* Cura
       – Metadata is at the TOP of the file (inside the head chunk).
       – Time is raw seconds: ";TIME:50400"
       – Filament is in metres: ";Filament used: 2.34m"
         → convert to grams using 1.75 mm filament @ 1.2 g/cm³
           (π × 0.0875² cm² × 100 cm/m × 1.2 g/cm³ ≈ 2.89 g/m)      */
    if (slicer === "cura") {

        const mSecs = text.match(/^;TIME:(\d+)/m);
        if (mSecs) printHours = parseInt(mSecs[1]) / 3600;

        const mMetres = text.match(/^;Filament used:\s*([\d.]+)m/m);
        if (mMetres) filamentUsed = parseFloat((parseFloat(mMetres[1]) * 2.89).toFixed(1));

        const mMat = text.match(/^;Material:\s*(.+)/im);
        if (mMat) material = mMat[1].trim().toUpperCase();
    }

    /* IdeaMaker
       – All metadata at the TOP of the file.
       – Time in seconds: ";Print Time: 5400"
       – Weight in grams: ";Filament weight: 45.67 (g)"               */
    if (slicer === "ideamaker") {

        const mSecs = text.match(/;Print Time:\s*(\d+)/i);
        if (mSecs) printHours = parseInt(mSecs[1]) / 3600;

        const mGrams = text.match(/;Filament weight:\s*([\d.]+)\s*\(g\)/i);
        if (mGrams) filamentUsed = parseFloat(mGrams[1]);
    }

    /* Simplify3D
       – Detection string at TOP; time + weight at BOTTOM.
       – "Build time: 14 hours 20 minutes"
       – "Material used: 12345.67mm (45.87g)"                         */
    if (slicer === "simplify3d") {

        const mTime = text.match(/;\s*Build time:\s*([^\n]+)/i);
        if (mTime) printHours = parseTimeString(mTime[1].trim());

        const mGrams = text.match(/;\s*Material used:.*?\(([\d.]+)g\)/i);
        if (mGrams) filamentUsed = parseFloat(mGrams[1]);
    }

    return { filamentUsed, printHours, material };
}

/* ─── Time string → decimal hours ─────────────────────── */
function parseTimeString(str) {
    let h = 0;
    const d = str.match(/(\d+)\s*d/i);
    const hr= str.match(/(\d+)\s*h/i);
    const m = str.match(/(\d+)\s*m(?!s)/i);
    const s = str.match(/(\d+)\s*s/i);
    if (d)  h += parseInt(d[1])  * 24;
    if (hr) h += parseInt(hr[1]);
    if (m)  h += parseInt(m[1])  / 60;
    if (s)  h += parseInt(s[1])  / 3600;
    // Bare number (raw seconds fallback)
    if (!d && !hr && !m && !s && /^\d+$/.test(str.trim())) {
        h = parseInt(str) / 3600;
    }
    return parseFloat(h.toFixed(4));
}

/* ─── Decimal hours → "14h 20m" label ────────────────── */
function hoursToLabel(h) {
    const hrs  = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    if (hrs === 0) return mins + "m";
    if (mins === 0) return hrs + "h";
    return hrs + "h " + mins + "m";
}

/* ─── Apply extracted data to the form ───────────────── */
function applyGcodeData(data) {

    if (data.filamentUsed > 0) {
        const el = document.getElementById("filamentUsed");
        el.value = data.filamentUsed.toFixed(1);
        flashField(el);
    }

    if (data.printHours > 0) {
        const el = document.getElementById("printHours");
        el.value = data.printHours.toFixed(2);
        flashField(el);
    }

    if (data.material) {
        const sel = document.getElementById("material");
        // Match exact value or prefix (e.g. "PLA_CF" → "PLA")
        const hit = [...sel.options].find(o =>
            o.value === data.material || data.material.startsWith(o.value)
        );
        if (hit) {
            sel.value = hit.value;
            flashField(sel);
        }
    }

    calc(); // ← Was incorrectly called as calculate() — that function doesn't exist.
}

/* ─── Green flash on auto-filled fields ──────────────── */
function flashField(el) {
    el.classList.remove("field-filled");
    void el.offsetWidth; // force reflow to restart animation
    el.classList.add("field-filled");
    el.addEventListener("animationend", () => el.classList.remove("field-filled"), { once: true });
}

/* ─── Status bar ─────────────────────────────────────── */
function setStatus(msg, type) {
    const el = document.getElementById("gcodeStatus");
    if (!el) return;
    el.textContent = msg;
    el.className   = "gcode-status" + (type ? " " + type : "");
}

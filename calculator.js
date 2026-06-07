/* =========================================================
   PRINT OBS — calculator.js
   =========================================================
   1. Calculator  — live cost calculation
   2. GCode Reader — universal parser (any slicer)
      · Reads first + last 40 KB (catches end-of-file metadata)
      · Detects: PrusaSlicer, OrcaSlicer, BambuStudio,
        SuperSlicer, Cura, IdeaMaker, Simplify3D, KISSlicer,
        Slic3r, Repetier, CraftWare, MatterControl, Unknown
      · Extracts filament (g / cm³ / mm / m), time, material
      · Multi-material: sums all extruder values
   3. Invoice system
   ========================================================= */

const MATERIAL_DENSITY   = { PLA:1.24, PETG:1.27, ABS:1.04, ASA:1.07, PC:1.20, TPU:1.21, NYLON:1.13 };
const FILAMENT_DIAMETER_MM = 1.75;


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
    const preTax      = (subtotal + failure) * (1 + v("profit") / 100);
    const tax         = preTax * (v("tax") / 100);
    const final       = preTax + tax;

    setDisplay("matCost",    material);
    setDisplay("elecCost",   electricity);
    setDisplay("wearCost",   wear);
    setDisplay("failCost",   failure);
    setDisplay("subtotal",   subtotal);
    setDisplay("taxCost",    tax);
    setDisplay("finalPrice", final);
}

// Attach listeners to all inputs/selects
document.querySelectorAll("input, select").forEach(el => el.addEventListener("input", calc));
calc();


/* =========================================================
   2. GCODE READER — Universal parser
   ─────────────────────────────────────────────────────────
   Does NOT branch on slicer type. Tries every known pattern
   from every slicer on every file, so any G-code works.
   Reads first + last 40 KB to catch metadata written at
   the end of file (PrusaSlicer / OrcaSlicer / BambuStudio).
   ========================================================= */

const gcodeInput = document.getElementById("gcodeFile");
if (gcodeInput) {
    gcodeInput.addEventListener("change", handleGcodeUpload);
}

/* ─── File reading ────────────────────────────────────────*/
function handleGcodeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setStatus("Reading file…", "loading");

    const CHUNK = 40 * 1024; // 40 KB each end

    if (file.size <= CHUNK * 2) {
        readBlob(file, text => processGcode(text, file.name));
    } else {
        readBlob(file.slice(0, CHUNK), head => {
            readBlob(file.slice(-CHUNK), tail => {
                processGcode(head + "\n" + tail, file.name);
            });
        });
    }
}

function readBlob(blob, cb) {
    const r = new FileReader();
    r.onload  = e => cb(e.target.result);
    r.onerror = () => setStatus("Could not read file.", "error");
    r.readAsText(blob);
}

/* ─── Slicer detection (for display only) ────────────────
   Parsing is universal — slicer name is only shown in the
   status bar so the user knows what was detected.           */
function detectSlicer(text) {
    const h = text.substring(0, 2000);
    if (/OrcaSlicer/i.test(h))                return "OrcaSlicer";
    if (/BambuStudio/i.test(h))               return "BambuStudio";
    if (/SuperSlicer/i.test(h))               return "SuperSlicer";
    if (/PrusaSlicer/i.test(h))               return "PrusaSlicer";
    if (/Cura_SteamEngine/i.test(h))          return "Cura";
    if (/ideaMaker|IdeaMaker/i.test(h))       return "IdeaMaker";
    if (/Simplify3D/i.test(h))                return "Simplify3D";
    if (/KISSlicer/i.test(h))                 return "KISSlicer";
    if (/Slic3r/i.test(h))                    return "Slic3r";
    if (/Repetier/i.test(h))                  return "Repetier";
    if (/CraftWare/i.test(h))                 return "CraftWare";
    if (/MatterControl|MatterSlice/i.test(h)) return "MatterControl";
    return "Unknown Slicer";
}

/* ─── Main processor ──────────────────────────────────────*/
function processGcode(text, filename) {
    const slicer = detectSlicer(text);
    const data   = parseGCode(text);

    applyGcodeData(data);

    const short = filename.length > 30 ? filename.slice(0, 27) + "…" : filename;
    const parts = [];
    if (data.filamentG  !== null) parts.push(data.filamentG.toFixed(1) + "g" + (data.isEstimated ? " ~est" : ""));
    if (data.printHours !== null) parts.push(hoursToLabel(data.printHours));
    if (data.material)            parts.push(data.material);

    const found = data.filamentG !== null || data.printHours !== null || data.material;

    setStatus(
        found
            ? `✓  ${slicer} · ${short}` + (parts.length ? "  ·  " + parts.join(", ") : "")
            : `⚠  ${slicer} — no metadata found. Fill values manually.`,
        found ? "success" : "warning"
    );
}

/* ─── Universal GCode parser ──────────────────────────────
   Tries every known comment pattern from every slicer.
   Priority: grams > cm³ > mm > metres (for filament).
   For each field the first matching pattern wins.
   Multi-material values (";  = 45.2; 12.3") are summed.    */
function parseGCode(text) {
    let filamentG   = null;
    let isEstimated = false;
    let printHours  = null;
    let material    = null;

    /* ── Filament — grams (direct, highest confidence) ─── */
    const gramsPats = [
        /;\s*(?:total )?filament used \[g\]\s*=\s*(.+)/i,      // PrusaSlicer / Orca / Bambu / Super
        /;Filament weight:\s*([\d.]+)\s*\(g\)/i,               // IdeaMaker
        /;\s*Filament weight:\s*([\d.]+)\s*g/i,                // Simplify3D / generic
        /;\s*Material used:.*?\(([\d.]+)g\)/i,                 // Simplify3D inline
        /;\s*filament used\s*=\s*[\d.]+\s*mm\s*\(([\d.]+)g\)/i,// Slic3r
        /;\s*Filament used\s*=.*?=\s*([\d.]+)\s*g/i,           // KISSlicer
        /;\s*filament_weight\s*[=:]\s*([\d.]+)/i,              // generic
        /;\s*plastic weight\s*=\s*([\d.]+)\s*g/i,              // generic
    ];

    for (const pat of gramsPats) {
        const m = text.match(pat);
        if (m) {
            const vals = m[1].split(/[;,]/).map(Number).filter(n => !isNaN(n) && n > 0);
            if (vals.length) { filamentG = vals.reduce((a, b) => a + b, 0); break; }
        }
    }

    /* ── Filament — cm³ → grams (PrusaSlicer fallback) ── */
    if (filamentG === null) {
        const cm3Pats = [
            /;\s*(?:total )?filament used \[cm3\]\s*=\s*(.+)/i,
        ];
        for (const pat of cm3Pats) {
            const m = text.match(pat);
            if (m) {
                const vals = m[1].split(/[;,]/).map(Number).filter(n => !isNaN(n) && n > 0);
                if (vals.length) {
                    const cm3 = vals.reduce((a, b) => a + b, 0);
                    filamentG   = +(cm3 * 1.24).toFixed(2); // PLA density default
                    isEstimated = true;
                    break;
                }
            }
        }
    }

    /* ── Filament — mm → grams ────────────────────────── */
    if (filamentG === null) {
        const mmPats = [
            /;\s*filament used \[mm\]\s*=\s*(.+)/i,            // PrusaSlicer
            /;Filament length:\s*([\d.]+)\s*\(mm\)/i,          // IdeaMaker
            /;\s*Material used:\s*([\d.]+)\s*mm/i,             // Simplify3D
            /;\s*filament used\s*=\s*([\d.]+)\s*mm/i,          // Slic3r
            /;\s*Filament used\s*=\s*([\d.]+)\s*mm/i,          // KISSlicer
            /;\s*plastic length\s*=\s*([\d.]+)\s*mm/i,         // generic
        ];
        for (const pat of mmPats) {
            const m = text.match(pat);
            if (m) {
                const vals = m[1].split(/[;,]/).map(Number).filter(n => !isNaN(n) && n > 0);
                if (vals.length) {
                    filamentG   = lengthToWeight(vals.reduce((a, b) => a + b, 0), "PLA");
                    isEstimated = true;
                    break;
                }
            }
        }
    }

    /* ── Filament — metres → grams (Cura) ────────────── */
    if (filamentG === null) {
        const mPat = /^;Filament used:\s*(.+?)m(?:\s|$)/m;
        const m = text.match(mPat);
        if (m) {
            const vals = m[1].split(/[,;]/).map(s => parseFloat(s)).filter(n => !isNaN(n) && n > 0);
            if (vals.length) {
                filamentG   = lengthToWeight(vals.reduce((a, b) => a + b, 0) * 1000, "PLA");
                isEstimated = true;
            }
        }
    }

    /* ── Print time — human-readable string ───────────── */
    const timeStrPats = [
        /;\s*estimated printing time \(normal mode\)\s*=\s*([^\n]+)/i, // PrusaSlicer family
        /;\s*estimated printing time\s*=\s*([^\n]+)/i,                 // Slic3r
        /;\s*Estimated print time:\s*([^\n]+)/i,                       // Simplify3D
        /;\s*Build time:\s*([^\n]+)/i,                                  // Simplify3D alt
        /;\s*Estimated Build Time:\s*([^\n]+)/i,                        // KISSlicer
        /;\s*total print time[:\s=]+([^\n]+)/i,                        // generic
        /;\s*print(?:ing)? time[:\s=]+([^\n]+)/i,                      // generic
    ];
    for (const pat of timeStrPats) {
        const m = text.match(pat);
        if (m) {
            const h = parseTimeString(m[1].trim());
            if (h > 0) { printHours = h; break; }
        }
    }

    /* ── Print time — raw seconds (Cura / IdeaMaker) ──── */
    if (printHours === null) {
        const timeSecPats = [
            /^;TIME:(\d+)/m,             // Cura
            /^;Print Time:\s*(\d+)$/im,  // IdeaMaker
        ];
        for (const pat of timeSecPats) {
            const m = text.match(pat);
            if (m) {
                const secs = parseInt(m[1]);
                if (secs > 0) { printHours = secs / 3600; break; }
            }
        }
    }

    /* ── Material type ────────────────────────────────── */
    const matPats = [
        /;\s*filament_type\s*=\s*([^\n;]+)/i,          // PrusaSlicer family
        /;\s*Filament name:\s*([^\n]+)/i,               // Simplify3D
        /;\s*(?:material|filament)\s*=\s*([^\n;]+)/i,  // generic
    ];
    for (const pat of matPats) {
        const m = text.match(pat);
        if (m && m[1].trim()) { material = m[1].trim(); break; }
    }

    /* ── Normalize + return ───────────────────────────── */
    return {
        filamentG:   filamentG  !== null ? +filamentG.toFixed(2)  : null,
        printHours:  printHours !== null ? +printHours.toFixed(2) : null,
        material:    normalizeMaterial(material),
        isEstimated,
    };
}

/* ─── Time string → decimal hours ────────────────────────
   Handles all known formats:
   "14h 20m 15s"  "14 hours 20 minutes"  "1d 2h 3m"
   "14:20:15"  "14.34 hour(s)"  "50400" (raw seconds)      */
function parseTimeString(str) {
    if (!str) return 0;
    str = str.trim();

    // "14.34 hour(s)" — KISSlicer decimal format
    const decH = str.match(/^([\d.]+)\s*hours?\b/i);
    if (decH) return parseFloat(decH[1]);

    // "14:20:15" colon-separated
    const hms = str.match(/^(\d+):(\d{2}):(\d{2})$/);
    if (hms) return +hms[1] + +hms[2] / 60 + +hms[3] / 3600;

    // Component-based: days, hours, minutes, seconds
    let total = 0;
    const d  = str.match(/(\d+)\s*d(?:ays?)?/i);
    const h  = str.match(/(\d+)\s*h(?:ours?|rs?)?/i);
    const m  = str.match(/(\d+)\s*m(?:in(?:utes?)?)?(?!\s*s|\d)/i);
    const s  = str.match(/(\d+)\s*s(?:ec(?:onds?)?)?/i);

    if (d) total += parseInt(d[1]) * 24;
    if (h) total += parseInt(h[1]);
    if (m) total += parseInt(m[1]) / 60;
    if (s) total += parseInt(s[1]) / 3600;

    // Fallback: bare integer treated as raw seconds
    if (!d && !h && !m && !s && /^\d+$/.test(str)) {
        total = parseInt(str) / 3600;
    }

    return parseFloat(total.toFixed(4));
}

/* ─── Decimal hours → readable label ─────────────────────*/
function hoursToLabel(h) {
    const hrs  = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    if (hrs === 0) return mins + "m";
    if (mins === 0) return hrs + "h";
    return hrs + "h " + mins + "m";
}

/* ─── Filament length (mm) → weight (g) ──────────────────*/
function lengthToWeight(mm, matKey) {
    const density = MATERIAL_DENSITY[matKey] || 1.24;
    const r       = FILAMENT_DIAMETER_MM / 2;
    return +((mm * Math.PI * r * r / 1000) * density).toFixed(2);
}

/* ─── Material name → dropdown value ─────────────────────*/
function normalizeMaterial(raw) {
    if (!raw) return null;
    // Take first value in multi-material strings e.g. "PLA;PLA" or "PLA,PETG"
    const s = raw.split(/[;,]/)[0].trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    // Check longest keys first to avoid "PLA" matching inside "PETG"
    for (const key of ["PETG", "ASA", "ABS", "PLA", "PC"]) {
        if (s === key || s.startsWith(key) || s.includes(key)) return key;
    }
    return null;
}

/* ─── Apply extracted data to the form ───────────────────*/
function applyGcodeData(data) {
    if (data.filamentG !== null) {
        const el = document.getElementById("filamentUsed");
        el.value = data.filamentG.toFixed(1);
        flashField(el);
    }
    if (data.printHours !== null) {
        const el = document.getElementById("printHours");
        el.value = data.printHours.toFixed(2);
        flashField(el);
    }
    if (data.material) {
        const sel = document.getElementById("material");
        const hit = [...sel.options].find(o => o.value === data.material);
        if (hit) { sel.value = hit.value; flashField(sel); }
    }
    calc();
}

/* ─── Green flash on auto-filled fields ──────────────────*/
function flashField(el) {
    el.classList.remove("field-filled");
    void el.offsetWidth;
    el.classList.add("field-filled");
    el.addEventListener("animationend", () => el.classList.remove("field-filled"), { once: true });
}

/* ─── Status bar ──────────────────────────────────────────*/
function setStatus(msg, type) {
    const el = document.getElementById("gcodeStatus");
    if (!el) return;
    el.textContent = msg;
    el.className   = "gcode-status" + (type ? " " + type : "");
}


/* =========================================================
   INVOICE SYSTEM
   ========================================================= */

let invoiceItems = [];

/* ─── localStorage keys ───────────────────────────────── */
const STORE = {
    name:       "printobs_company_name",
    logo:       "printobs_logo",
    includeTax: "printobs_include_tax",
};

/* ─── Settings — save / load ──────────────────────────── */
function saveSettings() {
    localStorage.setItem(STORE.name,       document.getElementById("companyName").value);
    localStorage.setItem(STORE.includeTax, document.getElementById("includeTax").checked);
}

function loadSettings() {
    const name = localStorage.getItem(STORE.name);
    const logo = localStorage.getItem(STORE.logo);
    const tax  = localStorage.getItem(STORE.includeTax);
    if (name) document.getElementById("companyName").value = name;
    if (logo) showLogoPreview(logo);
    if (tax !== null) document.getElementById("includeTax").checked = (tax === "true");
}

/* ─── Logo upload ─────────────────────────────────────── */
function setupLogoUpload() {
    const input = document.getElementById("logoUpload");
    if (!input) return;
    input.addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            localStorage.setItem(STORE.logo, e.target.result);
            showLogoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

function showLogoPreview(dataUrl) {
    document.getElementById("logoArea").innerHTML = `
        <div class="logo-preview-wrap">
            <img src="${dataUrl}" alt="Logo preview">
            <button class="logo-remove-btn" onclick="removeLogo()">Remove</button>
        </div>`;
}

function removeLogo() {
    localStorage.removeItem(STORE.logo);
    document.getElementById("logoArea").innerHTML = `
        <input type="file" id="logoUpload" accept="image/*" style="display:none;">
        <label for="logoUpload" class="gcode-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
            Upload logo image
        </label>`;
    setupLogoUpload();
}

/* ─── Add current calculation to invoice ─────────────── */
function addToInvoice() {
    const spoolW          = v("spoolWeight") || 1;
    const materialCost    = (v("filamentUsed") / spoolW) * v("spoolPrice") * v("quantity");
    const electricityCost = (v("wattage") / 1000) * v("printHours") * v("electricity");
    const wearCost        = v("wear") * v("printHours");
    const subtotal        = materialCost + electricityCost + wearCost + v("labor");
    const failureCost     = subtotal * (v("failure") / 100);
    const preTax          = (subtotal + failureCost) * (1 + v("profit") / 100);
    const taxAmount       = preTax * (v("tax") / 100);
    const finalPrice      = preTax + taxAmount;

    invoiceItems.push({
        id:            Date.now(),
        description:   mat() + " Part",
        currency:      cur(),
        material:      mat(),
        quantity:      v("quantity"),
        printHours:    v("printHours"),
        materialCost,
        electricityCost,
        wearCost,
        failureCost,
        subtotal,
        taxAmount,
        preTax,
        finalPrice,
    });

    renderInvoice();

    // Button feedback
    const btn = document.getElementById("addToInvoiceBtn");
    btn.innerHTML  = "✓ Added";
    btn.classList.add("add-invoice-btn--added");
    setTimeout(() => {
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add to Invoice`;
        btn.classList.remove("add-invoice-btn--added");
    }, 1400);
}

/* ─── Remove item ─────────────────────────────────────── */
function removeInvoiceItem(id) {
    invoiceItems = invoiceItems.filter(i => i.id !== id);
    renderInvoice();
}

/* ─── Update item description ─────────────────────────── */
function updateDescription(id, value) {
    const item = invoiceItems.find(i => i.id === id);
    if (item) item.description = value;
}

/* ─── Clear all items ─────────────────────────────────── */
function clearInvoice() {
    if (invoiceItems.length === 0) return;
    if (!confirm("Clear all invoice items?")) return;
    invoiceItems = [];
    renderInvoice();
}

/* ─── Render invoice list in the sidebar ─────────────── */
function renderInvoice() {
    const listEl   = document.getElementById("invoiceItems");
    const totalsEl = document.getElementById("invoiceTotals");

    if (invoiceItems.length === 0) {
        listEl.innerHTML = `<p class="invoice-empty">No items yet — calculate a price and click <strong>Add to Invoice</strong>.</p>`;
        totalsEl.style.display = "none";
        return;
    }

    listEl.innerHTML = invoiceItems.map((item, idx) => `
        <div class="invoice-item">
            <span class="invoice-item-num">${idx + 1}</span>
            <input
                class="invoice-item-desc"
                value="${escHtml(item.description)}"
                onchange="updateDescription(${item.id}, this.value)"
                placeholder="Description">
            <span class="invoice-item-price">${item.currency} ${item.finalPrice.toFixed(2)}</span>
            <button class="invoice-item-remove" onclick="removeInvoiceItem(${item.id})" title="Remove">×</button>
        </div>`
    ).join("");

    const showTax    = document.getElementById("includeTax").checked;
    const preTaxSum  = invoiceItems.reduce((s, i) => s + i.preTax, 0);
    const taxSum     = invoiceItems.reduce((s, i) => s + i.taxAmount, 0);
    const grandTotal = invoiceItems.reduce((s, i) => s + i.finalPrice, 0);
    const c          = invoiceItems[0].currency;

    document.getElementById("invPreTax").textContent = c + " " + preTaxSum.toFixed(2);
    document.getElementById("invTax").textContent    = c + " " + taxSum.toFixed(2);
    document.getElementById("invTotal").textContent  = c + " " + (showTax ? grandTotal : preTaxSum).toFixed(2);
    document.getElementById("invTaxRow").style.display = showTax ? "" : "none";

    totalsEl.style.display = "";
}

/* ─── HTML escape helper ──────────────────────────────── */
function escHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/* ─── Print / save as PDF ─────────────────────────────── */
function printInvoice() {
    if (invoiceItems.length === 0) {
        alert("Add at least one item to the invoice before printing.");
        return;
    }

    const companyName = document.getElementById("companyName").value.trim() || "PRINT OBS";
    const logoDataUrl = localStorage.getItem(STORE.logo);
    const showTax     = document.getElementById("includeTax").checked;
    const c           = invoiceItems[0].currency;

    const date   = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const invNum = "INV-" + Date.now().toString().slice(-6);

    const preTaxSum  = invoiceItems.reduce((s, i) => s + i.preTax, 0);
    const taxSum     = invoiceItems.reduce((s, i) => s + i.taxAmount, 0);
    const grandTotal = invoiceItems.reduce((s, i) => s + i.finalPrice, 0);
    const finalTotal = showTax ? grandTotal : preTaxSum;

    const logoHtml = logoDataUrl
        ? `<img src="${logoDataUrl}" alt="Logo" style="height:48px;max-width:160px;object-fit:contain;display:block;margin-bottom:6px;">`
        : "";

    const taxColHeaders = showTax ? "<th>Pre-tax</th><th>Tax</th>" : "";

    const rows = invoiceItems.map((item, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${escHtml(item.description)}</strong></td>
            <td>${item.material}</td>
            <td>${item.printHours.toFixed(1)} h</td>
            <td style="text-align:center;">${item.quantity}</td>
            ${showTax
                ? `<td style="text-align:right;">${c} ${item.preTax.toFixed(2)}</td>
                   <td style="text-align:right;">${c} ${item.taxAmount.toFixed(2)}</td>`
                : ""}
            <td style="text-align:right;font-weight:700;">${c} ${(showTax ? item.finalPrice : item.preTax).toFixed(2)}</td>
        </tr>`
    ).join("");

    const taxTotalRows = showTax ? `
        <tr>
            <td colspan="${showTax ? 6 : 5}" style="text-align:right;color:#666;padding:6px 10px;">Pre-tax Total</td>
            <td style="text-align:right;padding:6px 10px;">${c} ${preTaxSum.toFixed(2)}</td>
        </tr>
        <tr>
            <td colspan="${showTax ? 6 : 5}" style="text-align:right;color:#666;padding:6px 10px;">Tax</td>
            <td style="text-align:right;padding:6px 10px;">${c} ${taxSum.toFixed(2)}</td>
        </tr>` : "";

    const colCount = showTax ? 7 : 6;

    document.getElementById("invoice-print-view").innerHTML = `
        <style>
            #invoice-print-view * { box-sizing:border-box; margin:0; padding:0; font-family:Arial,sans-serif; }
            #invoice-print-view { padding: 40px; background: white; color: #111; }
            .inv-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:36px; padding-bottom:24px; border-bottom:2px solid #e4e4e7; }
            .inv-company-name { font-size:20px; font-weight:900; letter-spacing:-0.3px; margin-top:4px; }
            .inv-right { text-align:right; }
            .inv-right h1 { font-size:30px; font-weight:900; letter-spacing:3px; color:#111; margin-bottom:10px; }
            .inv-right p { color:#555; font-size:13px; margin-bottom:3px; }
            table { width:100%; border-collapse:collapse; margin-bottom:20px; font-size:13px; }
            th { background:#f4f4f5; color:#555; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; padding:10px 12px; text-align:left; border-bottom:2px solid #e4e4e7; }
            td { padding:10px 12px; border-bottom:1px solid #f0f0f0; color:#222; vertical-align:middle; }
            .inv-grand td { font-size:15px; font-weight:900; border-top:2px solid #111; border-bottom:none; padding-top:14px; }
            .inv-footer { margin-top:48px; padding-top:14px; border-top:1px solid #e4e4e7; text-align:center; color:#bbb; font-size:11px; }
        </style>
        <div class="inv-top">
            <div>
                ${logoHtml}
                <div class="inv-company-name">${escHtml(companyName)}</div>
            </div>
            <div class="inv-right">
                <h1>INVOICE</h1>
                <p><strong>Invoice #:</strong> ${invNum}</p>
                <p><strong>Date:</strong> ${date}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th style="width:30px;">#</th>
                    <th>Description</th>
                    <th>Material</th>
                    <th>Hours</th>
                    <th style="text-align:center;">Qty</th>
                    ${taxColHeaders}
                    <th style="text-align:right;">Amount</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>

        <table style="width:280px;margin-left:auto;">
            ${taxTotalRows}
            <tr class="inv-grand">
                <td>TOTAL</td>
                <td style="text-align:right;">${c} ${finalTotal.toFixed(2)}</td>
            </tr>
        </table>

        <div class="inv-footer">
            Generated by PRINT OBS &nbsp;·&nbsp; printobs.com
        </div>`;

    window.print();
}

/* ─── Init ────────────────────────────────────────────── */
loadSettings();
setupLogoUpload();

document.getElementById("companyName").addEventListener("input",  saveSettings);
document.getElementById("includeTax").addEventListener("change", function () {
    saveSettings();
    renderInvoice();
});

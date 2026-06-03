/* =========================================================
   PRINTOBS — calculator.js
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

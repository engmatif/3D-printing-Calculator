/* =========================================================
   PRINTQUOTE — posts.js
   All blog post data and content.
   Loaded by post.html and blog.html.
   ========================================================= */

const POSTS = [

  /* ─────────────────────────────────────────────────────── */
  {
    id:          "how-to-price-3d-prints",
    title:       "How To Price 3D Prints Professionally",
    tag:         "Featured Guide",
    date:        "June 2026",
    description: "Most makers lose money — not because they charge too little for material, but because they forget everything else. A professional quote is built from five distinct cost layers.",
    toc: [
      "The five cost layers",
      "Material cost",
      "Electricity",
      "Machine wear",
      "Labor",
      "Failure reserve",
      "Applying profit correctly",
      "Why order matters",
    ],
    content: `
<h3>The Five Cost Layers</h3>
<p>Every 3D printing quote has five components that must be calculated before profit is applied. Skipping any one of them means your profitable-looking jobs are quietly losing money.</p>

<h3>1. Material Cost</h3>
<p>This is the one most makers get right. The formula is straightforward:</p>
<div class="callout"><p><strong>Material cost = (filament used ÷ spool weight) × spool price × quantity</strong><br>Example: 185g from a 1kg spool at $20 → (185 ÷ 1000) × 20 = <strong>$3.70</strong></p></div>
<p>Where makers go wrong is forgetting to account for quantity correctly, or using a spool price that doesn't include shipping. Always price the filament landed — what you actually paid to have it in your hands.</p>

<h3>2. Electricity</h3>
<p>A 350W printer running for 14 hours uses 4.9 kWh. At $0.12 per kWh, that's $0.59. It feels small per job, but across 20 jobs per day it's nearly $12 — and in regions with higher electricity rates it climbs fast.</p>
<div class="callout"><p><strong>Electricity cost = (wattage ÷ 1000) × print hours × price per kWh</strong></p></div>
<p>Use the actual sustained printing wattage, not the nameplate peak. A watt meter (Kill-A-Watt or similar) gives you the real number for your specific printer.</p>

<h3>3. Machine Wear</h3>
<p>Every hour of printing degrades components. Nozzles wear — especially with abrasive filaments like carbon fiber or glow-in-the-dark. PTFE liners degrade. Belts stretch. Bearings wear. A wear rate of <strong>$0.30–$0.60 per hour</strong> builds a maintenance fund that pays for nozzle replacements, new belts, and hotend rebuilds before they become emergencies.</p>
<p>On a 14-hour print at $0.40/hour, that's $5.60 in machine wear. Not charging for it means your printer is slowly destroying itself on your behalf.</p>

<h3>4. Labor</h3>
<p>Setup time, first-layer monitoring, part removal, bed cleaning, and any post-processing (support removal, sanding, priming) all have real time costs. Even at a flat $5 per job on simple prints, labor adds up across a production run. For complex support-heavy parts that need 45 minutes of cleanup, the number is much higher.</p>
<p>Many first-time print businesses never put a labor figure in their calculator at all. This is why they feel busy and unprofitable at the same time.</p>

<h3>5. Failure Reserve</h3>
<p>Not every print succeeds. Even on a well-tuned machine, a 5–10% failure rate is realistic. Every failed print consumes material, electricity, and machine time that produced nothing sellable.</p>
<div class="callout"><p><strong>Failure reserve = (material + electricity + wear + labor) × failure rate %</strong><br>At 10% on a $10 subtotal, that's $1.00 — added to every job so your successful prints don't subsidize your failures.</p></div>

<h3>Applying Profit Correctly</h3>
<p>Profit margin is applied <em>after</em> all five cost layers are summed, not on top of material alone. A 25% margin means:</p>
<div class="callout"><p><strong>Final price = (subtotal + failure reserve) × (1 + profit % ÷ 100)</strong></p></div>
<p>If your subtotal is $11.00 and failure reserve is $1.10, your true cost is $12.10. At 25% profit: $12.10 × 1.25 = <strong>$15.13</strong>.</p>

<h3>Why the Order Matters</h3>
<p>Many makers apply profit to material only, then mentally add the rest. This consistently underprices every job. On a job with $3.70 in material and $8.40 in everything else, applying 25% profit to material only gives $0.93 profit on a $12.10 job — a 7.7% actual margin, not 25%.</p>
<p>The correct flow: <strong>Material → Electricity → Wear → Labor → Subtotal → Failure Reserve → True Cost → × Profit Multiplier → Quote.</strong></p>
<p>The PrintQuote calculator follows this formula exactly. You can also import a .gcode file to auto-fill filament weight and print time — then just add your machine's rates.</p>
`
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id:          "pla-vs-petg",
    title:       "PLA vs PETG: Full Cost Comparison",
    tag:         "Pricing",
    date:        "May 2026",
    description: "PLA and PETG are the two most commonly used FDM materials. The cost difference is smaller than most people think — but it shows up in unexpected places.",
    toc: [
      "Material cost per print",
      "Properties at a glance",
      "Where the real cost gap is",
      "Failure rate differences",
      "When to use PLA",
      "When to use PETG",
      "Pricing the upgrade",
    ],
    content: `
<h3>Material Cost Per Print</h3>
<p>For a typical 185g functional part from a 1kg spool:</p>
<table class="post-table">
  <thead><tr><th>Material</th><th>Spool Price</th><th>Cost for 185g</th></tr></thead>
  <tbody>
    <tr><td class="cell-name">PLA</td><td>$20–25</td><td>$3.70–4.63</td></tr>
    <tr><td class="cell-name">PETG</td><td>$23–30</td><td>$4.26–5.55</td></tr>
  </tbody>
</table>
<p>The difference per print is roughly <strong>$0.50–$1.00</strong>. Over 100 parts that's $50–$100 — real money, but not the dominant cost factor most people assume it is.</p>

<h3>Properties at a Glance</h3>
<table class="post-table">
  <thead><tr><th>Property</th><th>PLA</th><th>PETG</th></tr></thead>
  <tbody>
    <tr><td>Print temperature</td><td>195–215°C</td><td>225–245°C</td></tr>
    <tr><td>Bed temperature</td><td>50–60°C</td><td>70–85°C</td></tr>
    <tr><td>Heat resistance</td><td class="cell-bad">~60°C</td><td class="cell-ok">~80°C</td></tr>
    <tr><td>Impact resistance</td><td class="cell-ok">Moderate</td><td class="cell-good">Good</td></tr>
    <tr><td>Layer adhesion</td><td class="cell-ok">Good</td><td class="cell-good">Excellent</td></tr>
    <tr><td>Ease of printing</td><td class="cell-good">Excellent</td><td class="cell-ok">Good</td></tr>
    <tr><td>Stringing tendency</td><td class="cell-good">Low</td><td class="cell-bad">Higher</td></tr>
    <tr><td>Moisture sensitivity</td><td class="cell-good">Low</td><td class="cell-ok">Medium</td></tr>
  </tbody>
</table>

<h3>Where the Real Cost Gap Is</h3>
<p>The material price difference is minor. The hidden costs of PETG over PLA are:</p>
<ul>
  <li><strong>Higher bed temperature</strong> — 70–85°C vs 50–60°C. This increases electricity draw slightly, and significantly shortens the heatup phase when printing in batches.</li>
  <li><strong>Stringing and oozing</strong> — PETG strings more, often requiring post-processing (heat gun or trimming). Add 5–10 min labor per part if surface quality matters.</li>
  <li><strong>Filament drying</strong> — PETG is hygroscopic. Wet PETG produces popping sounds, poor layer adhesion, and ugly surfaces. Factor in a filament dryer ($30–80 one-time cost) if running PETG regularly.</li>
  <li><strong>Build plate adhesion</strong> — PETG on textured PEI can bond too aggressively and damage the surface if you're not careful. A ruined PEI sheet costs $20–60.</li>
</ul>

<h3>Failure Rate Differences</h3>
<p>PLA is more forgiving. It sticks easily, warps minimally at normal part sizes, and behaves predictably. For beginners or for parts with tight tolerances, PLA produces more consistent first-time results.</p>
<p>PETG has a higher failure rate for new operators — particularly from over-adhesion causing print removal damage, or moisture-induced surface defects. Budget an extra 3–5% failure reserve for PETG jobs until your process is fully dialled in.</p>

<h3>When to Use PLA</h3>
<ul>
  <li>Prototypes and display models</li>
  <li>Indoor decorative parts</li>
  <li>Parts with no thermal or mechanical load</li>
  <li>Clients who want the lowest possible cost</li>
  <li>High-speed iteration where failure cost is low</li>
</ul>

<h3>When to Use PETG</h3>
<ul>
  <li>Parts exposed to moderate heat (car interiors, summer outdoor conditions)</li>
  <li>Enclosures, brackets, and mechanical assemblies</li>
  <li>Parts requiring impact resistance or some flex</li>
  <li>Food-contact applications (check filament certification)</li>
  <li>Anything that needs real-world durability over appearance</li>
</ul>

<h3>Pricing the Upgrade</h3>
<p>When a client requests PETG, a 10–15% surcharge over the PLA quote is standard and widely accepted. Frame it as: <em>"PETG adds durability and heat resistance — I apply a small material and process premium for that."</em> Most clients accept this immediately when the reason is explained clearly.</p>
<p>Build the surcharge into your calculator as a material multiplier per type, not as a flat dollar add-on.</p>
`
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id:          "printer-electricity-cost",
    title:       "How Much Electricity Does A 3D Printer Use?",
    tag:         "Electricity",
    date:        "May 2026",
    description: "Electricity is the most consistently underestimated cost in 3D printing. Here's how to measure it accurately and build it into every quote.",
    toc: [
      "Typical printer wattages",
      "The formula",
      "Real examples by region",
      "Heatup vs printing phase",
      "Enclosures and seasonal effects",
      "Measuring your actual draw",
      "Reducing electricity costs",
    ],
    content: `
<h3>Typical Printer Wattages</h3>
<p>Power draw varies significantly between printer types and even between phases of the same print. The number that matters for pricing is the <strong>sustained printing wattage</strong> — not the nameplate peak.</p>
<table class="post-table">
  <thead><tr><th>Printer</th><th>Sustained Printing</th><th>Heatup Peak</th></tr></thead>
  <tbody>
    <tr><td class="cell-name">Bambu Lab X1C / P1S</td><td>~280W</td><td>~500W</td></tr>
    <tr><td class="cell-name">Prusa MK4</td><td>~200W</td><td>~380W</td></tr>
    <tr><td class="cell-name">Creality K1 / K1C</td><td>~300W</td><td>~500W</td></tr>
    <tr><td class="cell-name">Ender 3 (no enclosure)</td><td>~100W</td><td>~230W</td></tr>
    <tr><td class="cell-name">Ender 3 (with enclosure)</td><td>~130W</td><td>~260W</td></tr>
    <tr><td class="cell-name">Industrial FDM (Stratasys class)</td><td>~1200–2400W</td><td>Higher</td></tr>
  </tbody>
</table>
<p>These are representative figures. Your actual draw depends on bed temperature, ambient temperature, and print speed. Measure yours directly with a watt meter.</p>

<h3>The Formula</h3>
<div class="callout"><p><strong>Electricity cost = (wattage ÷ 1000) × print hours × price per kWh</strong></p></div>
<p>Example: 280W printer, 10-hour print, $0.12 per kWh:<br>
(280 ÷ 1000) × 10 × 0.12 = <strong>$0.34</strong></p>

<h3>Real Examples by Region</h3>
<table class="post-table">
  <thead><tr><th>Region</th><th>Rate (per kWh)</th><th>280W × 10hrs</th></tr></thead>
  <tbody>
    <tr><td class="cell-name">USA (avg.)</td><td>$0.12</td><td>$0.34</td></tr>
    <tr><td class="cell-name">Germany</td><td>$0.38</td><td>$1.06</td></tr>
    <tr><td class="cell-name">UK</td><td>$0.29</td><td>$0.81</td></tr>
    <tr><td class="cell-name">Egypt (mid-tier)</td><td>~EGP 1.10</td><td>~EGP 3.08</td></tr>
    <tr><td class="cell-name">Saudi Arabia</td><td>~SAR 0.18</td><td>~SAR 0.50</td></tr>
    <tr><td class="cell-name">Turkey</td><td>~TL 3.50</td><td>~TL 9.80</td></tr>
  </tbody>
</table>
<p>In Germany or the UK, electricity is a genuinely significant cost that can rival material cost on short prints. In Egypt or Saudi Arabia it's smaller, but still real across a production run.</p>

<h3>Heatup vs Printing Phase</h3>
<p>Most printers draw 2–3× their normal wattage during heatup (the 5–10 minutes while the bed and hotend reach temperature). For long prints, this spike represents less than 2% of total energy used and can largely be ignored.</p>
<p>For very short prints (under 30 minutes), the heatup phase is proportionally significant. A more accurate figure for sub-30-minute prints adds 15–25% to the calculated electricity cost.</p>

<h3>Enclosures and Seasonal Effects</h3>
<p>An enclosure traps heat, reducing the bed heater's duty cycle — meaning the printer uses less power to maintain temperature. In a cold environment (below 18°C), an unenclosed printer works significantly harder.</p>
<p>A practical rule of thumb: <strong>add 10–20% to your winter electricity costs</strong> for open-frame printers in cold climates. Enclosed printers are less affected.</p>

<h3>Measuring Your Actual Draw</h3>
<p>The most accurate approach is a plug-in watt meter (Kill-A-Watt in the US, similar devices elsewhere). Plug it between the wall and your printer, start a typical print, and note the average wattage during the print phase. This is the number to use in your calculator.</p>
<p>Printer specs on manufacturer pages typically list the <em>maximum</em> wattage, which occurs only during the brief heatup phase. Using this number will overestimate your electricity cost by 50–100%.</p>

<h3>Reducing Electricity Costs</h3>
<ul>
  <li><strong>Batch prints</strong> — the heatup cost is paid once per session, not per part. Running 3 parts back-to-back is more efficient than 3 separate sessions.</li>
  <li><strong>Lower bed temperature slightly</strong> — dropping bed temp by 5–10°C (using a better adhesion method like PEI or glue stick) reduces the sustained draw noticeably on heated-bed-heavy printers.</li>
  <li><strong>Time-of-use rates</strong> — if your utility offers cheaper overnight rates, schedule long prints to run off-peak.</li>
  <li><strong>Enclosures for ABS/ASA</strong> — they improve print quality AND reduce electricity consumption compared to fighting heat loss with an open frame.</li>
</ul>
`
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id:          "print-farm-profitability",
    title:       "Can A 3D Print Farm Make Money?",
    tag:         "Business",
    date:        "April 2026",
    description: "The honest breakdown of print farm economics — margins, overhead, labour, and what actually separates profitable operations from expensive hobbies.",
    toc: [
      "The basic revenue model",
      "Fixed and variable overhead",
      "The labour problem",
      "What profitable farms do differently",
      "Realistic timeline",
      "When to scale",
    ],
    content: `
<h3>The Basic Revenue Model</h3>
<p>A single FDM printer running efficiently can generate meaningful revenue — but the margin per hour is thinner than most people expect before they run the numbers.</p>
<table class="post-table">
  <thead><tr><th>Metric</th><th>Conservative</th><th>Optimistic</th></tr></thead>
  <tbody>
    <tr><td>Print hours per day</td><td>16</td><td>22</td></tr>
    <tr><td>Revenue per print hour (gross)</td><td>$1.50</td><td>$2.50</td></tr>
    <tr><td>Cost per print hour (material + elec + wear)</td><td>$0.90</td><td>$1.20</td></tr>
    <tr><td>Net contribution per hour</td><td>$0.60</td><td>$1.30</td></tr>
    <tr><td>Net per machine per month</td><td>$288</td><td>$858</td></tr>
  </tbody>
</table>
<p>With 10 machines at the conservative rate: <strong>$2,880/month gross contribution</strong>. That sounds viable — until fixed overhead is factored in.</p>

<h3>Fixed and Variable Overhead</h3>
<p>Costs that don't scale cleanly with the number of prints:</p>
<ul>
  <li><strong>Facility</strong> — if not home-based: $600–2,500/month depending on city</li>
  <li><strong>Business utilities beyond printing electricity</strong> — $100–300/month</li>
  <li><strong>Packaging and shipping</strong> — $0.50–2.00 per order, adds up fast at volume</li>
  <li><strong>Platform/marketplace fees</strong> — Etsy, Amazon Handmade, etc. take 6–15%</li>
  <li><strong>Machine depreciation</strong> — a $400 printer over 3 years is $11/month before any maintenance</li>
  <li><strong>Filament storage and drying</strong> — often overlooked, especially for PETG and nylons</li>
</ul>
<p>A realistic overhead figure for a home-based 10-machine operation is <strong>$800–1,500/month</strong>. For a commercial space, double it.</p>

<h3>The Labour Problem</h3>
<p>Print farms fail most often when the founder's time isn't priced in. Managing 10 printers requires:</p>
<ul>
  <li>File preparation, slicing, and job scheduling: 1–2 hours/day</li>
  <li>Customer communication, quoting, order management: 1–2 hours/day</li>
  <li>Bed removal, cleaning, and restarting: 30 min/day per 5 machines</li>
  <li>Maintenance and troubleshooting: 1–3 hours/week</li>
</ul>
<p>That's 3–5 hours per day. At a conservative $20/hour opportunity cost, that's <strong>$1,800–3,000/month</strong> of unpriced labour. Many "profitable" print farms are actually paying their owners below minimum wage.</p>

<h3>What Profitable Farms Do Differently</h3>
<p>The operations that genuinely profit share a few consistent characteristics:</p>
<ul>
  <li><strong>Specialisation</strong> — one niche (cosplay armour, architectural models, industrial fixtures, replacement parts). Specialisation enables faster slicing, better material knowledge, and premium pricing.</li>
  <li><strong>Recurring clients</strong> — one client ordering 200 units/month is vastly more profitable than 200 one-time $5 orders. Sales and fulfilment overhead collapses with repeat business.</li>
  <li><strong>Premium materials</strong> — running ASA, PETG-CF, or PC at $0.08–0.15/g material cost with $5–10/g sale price is more profitable per machine-hour than high-volume PLA at commodity prices.</li>
  <li><strong>Automation and consistency</strong> — the most profitable farms run the same 3–5 designs at volume, not bespoke one-offs. Designs are already proven and sliced; the workflow is a system, not a decision tree.</li>
  <li><strong>Accurate pricing</strong> — consistently using a proper cost model (not gut feel) prevents the slow bleed of underpriced jobs that look busy but drain cash.</li>
</ul>

<h3>Realistic Timeline</h3>
<table class="post-table">
  <thead><tr><th>Period</th><th>Milestone</th></tr></thead>
  <tbody>
    <tr><td>Month 1–2</td><td>Equipment costs covered if running 15+ hours/day at correct prices</td></tr>
    <tr><td>Month 3–4</td><td>Contribution positive if overhead is controlled and labour is priced</td></tr>
    <tr><td>Month 6–9</td><td>First signs of scalability if a niche and repeat client base have developed</td></tr>
    <tr><td>Month 12+</td><td>Sustainable business if client base is diversified and systems are in place</td></tr>
  </tbody>
</table>

<h3>When to Scale</h3>
<p>Add machines when — and only when — you have consistent demand that regularly exceeds current capacity. Buying machines speculatively increases overhead and maintenance load without a guaranteed revenue increase.</p>
<p>The right trigger: you are turning down orders, or your queue is regularly 5+ days. At that point, adding capacity is a straightforward business decision rather than a bet.</p>
`
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id:          "materials-for-functional-parts",
    title:       "Best Materials For Functional 3D Printed Parts",
    tag:         "Materials",
    date:        "April 2026",
    description: "PLA looks great in renders. It fails in the real world. Here's an honest comparison of the materials that actually hold up under load, heat, and outdoor exposure.",
    toc: [
      "What makes a part functional",
      "PLA — the prototype king",
      "PETG — the workhorse",
      "ABS — heat resistant but difficult",
      "ASA — the outdoor specialist",
      "PC — engineering grade",
      "Quick reference table",
    ],
    content: `
<h3>What Makes a Part "Functional"?</h3>
<p>A functional part is one that bears mechanical load, is exposed to elevated temperatures, sees repeated stress cycles, must survive UV exposure, or is used in any context where failure has real consequences. This definition rules out PLA for almost all such applications.</p>
<p>Choosing the right material is both a technical and a business decision — it affects your print settings, failure rate, pricing, and client trust if a part fails in service.</p>

<h3>PLA — The Prototype King</h3>
<p>PLA is easy to print, cheap, and produces excellent surface quality. It is the wrong choice for anything functional.</p>
<ul>
  <li><strong>Heat deflection: ~55–60°C.</strong> A PLA part left on a car dashboard in summer will deform. It softens before most dishwashers complete their cycle.</li>
  <li><strong>Impact resistance: poor.</strong> PLA is brittle under sudden load. It shatters rather than deforming.</li>
  <li><strong>UV stability: poor.</strong> PLA yellows and becomes brittle over months of outdoor exposure.</li>
</ul>
<div class="callout"><p>Use PLA for: prototypes, display models, jigs where no load is applied, parts that will live permanently indoors away from heat sources.</p></div>

<h3>PETG — The Workhorse</h3>
<p>PETG is the default choice for functional parts that don't need to survive extreme heat or outdoor UV exposure. It prints reliably, has excellent layer adhesion, and handles moderate impact well.</p>
<ul>
  <li><strong>Heat deflection: ~75–80°C.</strong> Survives car interiors in most climates, dishwasher lower racks, and most indoor industrial environments.</li>
  <li><strong>Impact resistance: good.</strong> Deforms rather than shatters under sudden load.</li>
  <li><strong>Chemical resistance: good.</strong> Handles water, mild acids, alcohols, and cleaning agents.</li>
  <li><strong>Printing difficulty: moderate.</strong> Strings more than PLA, requires drier filament storage.</li>
</ul>
<div class="callout"><p>Use PETG for: enclosures, brackets, mechanical assemblies, parts with moderate load in non-extreme environments, food-contact parts (with certified food-safe filament).</p></div>

<h3>ABS — Heat Resistant, But Difficult</h3>
<p>ABS has been the traditional engineering FDM material for years. It has legitimate strengths — but it requires a fully enclosed, heated-chamber printer to use reliably.</p>
<ul>
  <li><strong>Heat deflection: ~95–100°C.</strong> Handles automotive under-bonnet environments and sterilisation temperatures.</li>
  <li><strong>Warping: severe.</strong> ABS shrinks as it cools and will delaminate on open-frame printers. An enclosure and draft shield are non-negotiable.</li>
  <li><strong>Acetone smoothing:</strong> ABS can be vapour-smoothed with acetone, producing near-injection-moulded surface quality — a significant finishing advantage.</li>
  <li><strong>UV stability: poor.</strong> ABS yellows and embrittles outdoors; use ASA instead.</li>
</ul>
<div class="callout"><p>Use ABS for: automotive components, electrical enclosures (some grades are UL94-HB rated), parts requiring acetone finishing, high-heat indoor applications.</p></div>

<h3>ASA — The Outdoor Specialist</h3>
<p>ASA is essentially ABS reformulated for UV stability. It matches ABS in heat resistance and mechanical properties, but withstands outdoor exposure without yellowing or becoming brittle.</p>
<ul>
  <li><strong>UV resistance: excellent.</strong> ASA maintains its mechanical properties and colour after years of outdoor exposure — ABS does not.</li>
  <li><strong>Heat deflection: ~95–100°C.</strong> Same as ABS.</li>
  <li><strong>Printing: similar to ABS.</strong> Needs enclosure, prone to warping on open-frame machines.</li>
  <li><strong>Cost: ~20–30% premium over ABS.</strong> Justified for any outdoor application.</li>
</ul>
<div class="callout"><p>Use ASA for: garden fixtures, vehicle exterior mounts, architectural models, outdoor signage, any part that will see direct sunlight over time.</p></div>

<h3>PC — Engineering Grade</h3>
<p>Polycarbonate is the top of the FDM material pyramid for most users. It is used in bulletproof glass, protective equipment, and aerospace applications. Printing it well requires serious hardware and process control.</p>
<ul>
  <li><strong>Heat deflection: ~125–130°C.</strong> The highest of any common FDM material.</li>
  <li><strong>Impact resistance: exceptional.</strong> PC absorbs impact energy without fracturing.</li>
  <li><strong>Printing requirements: all-metal hotend, 260–300°C nozzle, 90–110°C bed, fully enclosed, dry filament.</strong></li>
  <li><strong>Cost: $35–70+/kg.</strong> And higher failure rates due to print difficulty mean the cost-per-successful-part is significantly higher.</li>
</ul>
<div class="callout"><p>Use PC for: jigs and fixtures, load-bearing structural parts, high-temperature applications, safety-critical components where ABS and ASA are insufficient.</p></div>

<h3>Quick Reference</h3>
<table class="post-table">
  <thead><tr><th>Material</th><th>Max Temp</th><th>Outdoors</th><th>Impact</th><th>Difficulty</th><th>Cost/kg</th></tr></thead>
  <tbody>
    <tr><td class="cell-name">PLA</td><td class="cell-bad">60°C</td><td class="cell-bad">No</td><td class="cell-bad">Poor</td><td class="cell-good">Easy</td><td>$18–25</td></tr>
    <tr><td class="cell-name">PETG</td><td class="cell-ok">80°C</td><td class="cell-ok">Limited</td><td class="cell-ok">Good</td><td class="cell-ok">Moderate</td><td>$22–30</td></tr>
    <tr><td class="cell-name">ABS</td><td class="cell-good">100°C</td><td class="cell-bad">No</td><td class="cell-ok">Good</td><td class="cell-bad">Hard</td><td>$20–28</td></tr>
    <tr><td class="cell-name">ASA</td><td class="cell-good">100°C</td><td class="cell-good">Yes</td><td class="cell-ok">Good</td><td class="cell-bad">Hard</td><td>$25–35</td></tr>
    <tr><td class="cell-name">PC</td><td class="cell-good">130°C</td><td class="cell-ok">With UV coat</td><td class="cell-good">Excellent</td><td class="cell-bad">Very hard</td><td>$40–70</td></tr>
  </tbody>
</table>
`
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id:          "pricing-mistakes",
    title:       "7 Common 3D Printing Pricing Mistakes",
    tag:         "Workflow",
    date:        "March 2026",
    description: "These mistakes are responsible for most of the lost revenue in small 3D printing businesses. Most are easy to fix once you know they exist.",
    toc: [
      "Mistake 1: Material-only pricing",
      "Mistake 2: Ignoring failures",
      "Mistake 3: Forgetting machine wear",
      "Mistake 4: Undervaluing setup time",
      "Mistake 5: Wrong profit application",
      "Mistake 6: Flat pricing across quantities",
      "Mistake 7: Same margin for all materials",
    ],
    content: `
<h3>Mistake 1: Pricing Only Material</h3>
<p>"My filament cost $3.70 so I'll charge $7.40." This is the most common mistake in new print businesses. A 100% material markup sounds reasonable until you realise it produces zero contribution toward the other $8+ in real costs on a 14-hour print.</p>
<p>Material is typically <strong>25–40% of total cost</strong> on a standard job. Pricing from material alone means every job is priced at 25–40% of its true cost, plus a markup — which still often results in a loss.</p>

<h3>Mistake 2: Not Accounting for Failures</h3>
<p>Every failed print consumes real material and real machine time. If your failure rate is 10%, then 1 in every 10 prints produces nothing sellable. If you don't build this into every successful print's price, your profitable jobs are silently subsidising your failed ones.</p>
<div class="callout"><p>Fix: Add a failure reserve line to every quote. If your subtotal is $12 and your failure rate is 10%, add $1.20. The customer is paying for the statistical likelihood that some prints fail.</p></div>

<h3>Mistake 3: Forgetting Machine Wear</h3>
<p>Printers degrade with use. Nozzles wear — especially with abrasive filaments. PTFE liners degrade at high temperatures. Belts stretch. Bearings wear. Build plates scratch and lose adhesion.</p>
<p>Not charging for wear means your business accumulates invisible debt. The machine will eventually need maintenance or replacement, and there's no fund for it. A <strong>$0.30–0.60 per print hour</strong> wear rate builds that fund automatically.</p>

<h3>Mistake 4: Undervaluing Setup Time</h3>
<p>Setup for a single job typically includes: checking and preparing the file, slicing (5–15 min), bed leveling or adhesion prep (5–10 min), first-layer monitoring (5–10 min), part removal and bed cleaning (5 min), basic quality inspection (5 min). That's 25–45 minutes of skilled attention per job.</p>
<p>For a one-off custom part, this setup cost should be charged explicitly. For batch orders of the same design, it amortises across all units — which is one reason batches justify lower per-unit prices.</p>

<h3>Mistake 5: Applying Profit to Material Only</h3>
<p>This is a subtle but devastating error. If your true cost is $12.10 (material + electricity + wear + labor + failure) and you apply 25% profit to only the $3.70 material component, your profit is $0.93 — a real margin of 7.7% on the job, not 25%.</p>
<div class="callout"><p>Fix: Profit margin must multiply the entire true cost, not just material. <strong>Final = True Cost × (1 + profit %)</strong>.</p></div>

<h3>Mistake 6: Flat Pricing Across Quantities</h3>
<p>Setup cost is fixed per job, not per part. A 30-minute setup process costs $5 on a one-part order and $0.50 per part on a 10-part order. Charging the same per-unit price for both means either overcharging for batches (losing clients) or undercharging for single units (losing margin).</p>
<p>Build a quantity field into your calculator. Let the per-part setup cost and labor dilute naturally across larger orders. Offer honest batch discounts — clients appreciate transparency and it builds long-term relationships.</p>

<h3>Mistake 7: Same Pricing Logic for All Materials</h3>
<p>PC at $55/kg running at 285°C with a 15% failure rate on an all-metal hotend is not the same job as PLA at $22/kg on a standard nozzle. The material cost ratio alone is 2.5×, but the true cost ratio is higher when failure rate, electricity, and setup complexity are included.</p>
<p>Material-specific parameters in your calculator should include different failure rates and a difficulty multiplier. ASA and ABS warping makes failure more likely. PETG adhesion issues have their own profile. Don't apply PLA failure rates to everything.</p>
`
  },

  /* ─────────────────────────────────────────────────────── */
  {
    id:          "gcode-parsing",
    title:       "Why G-code Parsing Changes Everything",
    tag:         "G-code",
    date:        "March 2026",
    description: "Inside every G-code file is a complete set of print statistics. Extracting them automatically eliminates manual data entry, transcription errors, and the most common source of quoting mistakes.",
    toc: [
      "What is a G-code file",
      "What data is inside",
      "The manual quoting problem",
      "How automatic parsing helps",
      "Why slicer differences matter",
      "How PrintQuote handles it",
      "What comes next",
    ],
    content: `
<h3>What Is a G-code File?</h3>
<p>A G-code file is the output of a slicer — the complete set of machine instructions for a 3D printer. It tells the printer exactly where to move, how fast, what temperature to hold, when to extrude material, and when to retract.</p>
<p>A 14-hour print might produce a G-code file with 3–8 million individual lines of instructions. Hidden inside, usually in comment lines at the top or bottom of the file, is the metadata that makes automatic quoting possible.</p>

<h3>What Data Is Inside</h3>
<p>The metadata embedded by slicers varies by software, but typically includes:</p>
<table class="post-table">
  <thead><tr><th>Slicer</th><th>Time format</th><th>Filament format</th><th>Location in file</th></tr></thead>
  <tbody>
    <tr><td class="cell-name">PrusaSlicer</td><td>14h 20m 15s</td><td>185.32 g</td><td>End of file</td></tr>
    <tr><td class="cell-name">OrcaSlicer</td><td>14h 20m 15s</td><td>185.32 g</td><td>End of file</td></tr>
    <tr><td class="cell-name">BambuStudio</td><td>14h 20m 15s</td><td>185.32 g</td><td>End of file</td></tr>
    <tr><td class="cell-name">Cura</td><td>50400 (raw seconds)</td><td>6.48 m (metres)</td><td>Start of file</td></tr>
    <tr><td class="cell-name">Simplify3D</td><td>14 hours 20 minutes</td><td>185.23 g</td><td>End of file</td></tr>
    <tr><td class="cell-name">IdeaMaker</td><td>50400 (raw seconds)</td><td>185.67 g</td><td>Start of file</td></tr>
  </tbody>
</table>
<p>Each slicer writes this data in a different format, in a different location, with different comment syntax. A parser that works for one slicer will silently fail on another.</p>

<h3>The Manual Quoting Problem</h3>
<p>Without parsing, every quote requires a maker to:</p>
<ol>
  <li>Open the slicer software</li>
  <li>Re-slice or re-open the file to find the print time estimate</li>
  <li>Note the filament weight (also in the slicer)</li>
  <li>Open the pricing calculator</li>
  <li>Type both values in manually</li>
</ol>
<p>Per job, that's 3–5 minutes. Across 15 quotes per day, that's 45–75 minutes of data entry — and manual entry introduces transcription errors. Typing 815g instead of 185g produces a quote that is 4× too high, which either loses the client immediately or, if unnoticed, severely damages trust.</p>

<h3>How Automatic Parsing Helps</h3>
<p>With G-code import, the workflow becomes:</p>
<ol>
  <li>Drop the .gcode file onto the calculator</li>
  <li>Print time and filament weight are filled automatically</li>
  <li>Enter your machine's electricity rate, wear rate, and business parameters</li>
  <li>Quote is ready</li>
</ol>
<p>The print time and filament weight — the two values that change with every new design — are handled without any manual input. The parameters that stay consistent across your machine (electricity rate, wear rate, profit margin) are set once.</p>

<h3>Why Slicer Differences Matter</h3>
<p>Naively reading only the first few lines of a G-code file works for Cura and IdeaMaker, which write their metadata at the top. But PrusaSlicer, OrcaSlicer, BambuStudio, and Simplify3D all write their print statistics at the <em>end</em> of the file — often after millions of lines of movement commands.</p>
<p>A parser that only reads the start of the file will produce empty results for PrusaSlicer jobs. A parser that only reads the end will miss Cura's time data. A large G-code file read in its entirety can be 50–150 MB — which causes real browser performance problems if loaded naively.</p>
<p>The correct approach reads both the first and last portion of the file (typically 20–30 KB each), detects which slicer produced it based on a signature string, and then applies the appropriate parsing rules for that slicer's specific format.</p>

<h3>How PrintQuote Handles It</h3>
<p>The G-code parser in PrintQuote follows this approach:</p>
<ul>
  <li>Files under ~60 KB are read in full</li>
  <li>Larger files are read in two chunks: first 30 KB and last 30 KB</li>
  <li>Slicer is detected from a signature string (e.g. "PrusaSlicer", "Cura_SteamEngine", "BambuStudio")</li>
  <li>Per-slicer patterns extract time, filament grams, and material type</li>
  <li>Cura's metre-based filament figure is converted to grams using filament diameter and density</li>
  <li>Time strings in any format (hours/minutes/seconds, raw seconds, "X hours Y minutes") are converted to decimal hours</li>
  <li>Matched fields are highlighted with a brief green flash so you can see exactly what was auto-filled</li>
</ul>

<h3>What Comes Next</h3>
<p>Future versions will extract additional metadata: layer count, infill percentage, support usage, print speed, and multi-material assignments. These fields will feed smarter difficulty multipliers — automatically increasing the failure reserve for complex support-heavy parts, or adjusting wear rates for high-speed printing modes.</p>
<p>The end goal is a quoting workflow where the only inputs a maker needs to provide are their own business parameters. Everything about the specific job comes from the file.</p>
`
  },

]; // end POSTS

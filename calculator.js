const inputs = document.querySelectorAll("input, select");

inputs.forEach(i => i.addEventListener("input", calc));

function v(id) {
    return Number(document.getElementById(id).value);
}

function cur() {
    return document.getElementById("currency").value;
}

function mat() {
    return document.getElementById("material").value;
}

function set(id, val) {
    document.getElementById(id).innerText =
        cur() + " " + val.toFixed(2);
}

function calc() {

    const material =
        (v("filamentUsed") / v("spoolWeight")) *
        v("spoolPrice") *
        v("quantity");

    const electricity =
        (v("wattage") / 1000) *
        v("printHours") *
        v("electricity");

    const wear =
        v("wear") * v("printHours");

    const subtotal =
        material +
        electricity +
        wear +
        v("labor");

    const failure =
        subtotal * (v("failure") / 100);

    const final =
        (subtotal + failure) *
        (1 + v("profit") / 100);

    set("matCost", material);
    set("elecCost", electricity);
    set("wearCost", wear);
    set("failCost", failure);
    set("subtotal", subtotal);
    set("finalPrice", final);

    document.getElementById("matLabel").innerText =
        "MATERIAL: " + mat();
}

calc();

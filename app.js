/* =========================
CONFIG
========================= */

const CATEGORY_CONFIG = [
{ key: "offer", label: "Offer", color: "#22c55e" },
{ key: "demand", label: "Demand", color: "#f59e0b" },
{ key: "donate", label: "Donate", color: "#a855f7" }
];

let DATA = {};
let CURRENT = "offer";

/* =========================
LOAD JSON
========================= */

async function loadAll(){

for(const cat of CATEGORY_CONFIG){
try{
const res = await fetch(`./${cat.key}.json`);
DATA[cat.key] = await res.json();
}catch{
DATA[cat.key] = [];
}
}

renderCategories();
renderItems("offer");
}

loadAll();

/* =========================
CATEGORIES
========================= */

function renderCategories(){

const el = document.getElementById("categories");

el.innerHTML = CATEGORY_CONFIG.map(cat => `     <div class="cat" data-key="${cat.key}" style="
      min-width:90px;
      text-align:center;
      cursor:pointer;
      opacity:${cat.key === "offer" ? 1 : 0.6};
    ">       <div style="
        width:70px;height:70px;
        border-radius:50%;
        background:${cat.color};
        display:flex;
        align-items:center;
        justify-content:center;
        font-weight:bold;
      ">
        ${cat.label[0]}       </div>       <div style="margin-top:6px;font-size:12px;">
        ${cat.label}       </div>     </div>
  `).join("");

document.querySelectorAll(".cat").forEach(btn=>{
btn.onclick = ()=>{
CURRENT = btn.dataset.key;

```
  document.querySelectorAll(".cat").forEach(c=>c.style.opacity=0.6);
  btn.style.opacity = 1;

  renderItems(CURRENT);
};
```

});

}

/* =========================
TOP ACTIONS (SEARCH + ADD)
========================= */

function renderTopBar(){

const container = document.getElementById("items");

const catColor = CATEGORY_CONFIG.find(c => c.key === CURRENT).color;

return ` <div class="card" style="margin-bottom:10px;display:flex;gap:10px;flex-wrap:wrap;">

```
  <input id="search" placeholder="Search..."
  style="flex:1;height:40px;border-radius:8px;border:none;padding:0 10px;">

  <button onclick="openAddModal()" style="
    background:${catColor};
    border:none;
    padding:10px 14px;
    border-radius:8px;
    color:white;
    font-weight:600;
  ">
    + Add Item
  </button>

  <button onclick="openDeleteModal()" style="
    background:#ef4444;
    border:none;
    padding:10px 14px;
    border-radius:8px;
    color:white;
    font-weight:600;
  ">
    Delete
  </button>

</div>
```

`;
}

/* =========================
ITEMS
========================= */

function renderItems(key){

const container = document.getElementById("items");
const items = DATA[key] || [];
const catColor = CATEGORY_CONFIG.find(c => c.key === key).color;

container.innerHTML = renderTopBar() + `

  <div class="grid">

```
${items.map((item,i)=>`

  <div class="card">

    <div style="aspect-ratio:1/1;background:#0f172a;border-radius:10px;overflow:hidden;">
      ${item.img ? `<img src="${item.img}" style="width:100%;height:100%;object-fit:cover;">` : ""}
    </div>

    <div style="margin-top:8px;font-weight:600;">
      ${item.name}
    </div>

    <div style="font-size:12px;color:#94a3b8;">
      ${item.quantity || ""}
    </div>

    <div style="margin-top:5px;">
      ₹${item.price || 0}
    </div>

    <div style="font-size:11px;color:#94a3b8;">
      By ${item.vendor || "User"}
    </div>

    <!-- QTY -->
    <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
      <button onclick="dec(${i})">−</button>
      <div id="qty_${i}">1</div>
      <button onclick="inc(${i})">+</button>
    </div>

    <button onclick="openOrder(${i})"
    style="
      margin-top:10px;
      width:100%;
      background:${catColor};
      padding:10px;
      border:none;
      border-radius:8px;
      color:white;
      font-weight:600;
    ">
      Order
    </button>

  </div>

`).join("")}
```

  </div>
  `;
}

/* =========================
SEARCH
========================= */

document.addEventListener("input", (e)=>{
if(e.target.id !== "search") return;

const q = e.target.value.toLowerCase();

const filtered = DATA[CURRENT].filter(item =>
item.name?.toLowerCase().includes(q)
);

renderItemsFiltered(filtered);
});

function renderItemsFiltered(items){

const container = document.getElementById("items");

container.innerHTML = `

  <div class="grid">
    ${items.map(item => `
      <div class="card">
        <div>${item.name}</div>
        <div>₹${item.price}</div>
      </div>
    `).join("")}
  </div>
  `;
}

/* =========================
QUANTITY
========================= */

function inc(i){
const el = document.getElementById("qty_"+i);
el.innerText = +el.innerText + 1;
}

function dec(i){
const el = document.getElementById("qty_"+i);
if(+el.innerText > 1){
el.innerText = +el.innerText - 1;
}
}

/* =========================
ORDER MODAL
========================= */

function openOrder(i){

const item = DATA[CURRENT][i];
const qty = document.getElementById("qty_"+i).innerText;

document.body.insertAdjacentHTML("beforeend", ` <div class="modal" id="orderModal">

```
  <div class="card">

    <h3>Order Summary</h3>

    <p>${item.name}</p>
    <p>Qty: ${qty}</p>
    <p>Total: ₹${item.price * qty}</p>

    <input id="userId" placeholder="Enter Unique ID"
    style="width:100%;margin-top:10px;height:40px;">

    <button onclick="submitOrder(${i})"
    style="margin-top:10px;width:100%;">
      Proceed
    </button>

    <button onclick="closeModal()">Cancel</button>

  </div>
</div>
```

`);
}

function submitOrder(i){
alert("Next step → Razorpay + backend");
}

/* =========================
ADD ITEM MODAL
========================= */

function openAddModal(){

document.body.insertAdjacentHTML("beforeend", ` <div class="modal">

```
  <div class="card">

    <h3>Add Item</h3>

    <input placeholder="Unique ID"><br>
    <input placeholder="Item Name"><br>
    <input placeholder="Price"><br>
    <input placeholder="Quantity"><br>
    <input placeholder="Total Available"><br>
    <input placeholder="Delivery Time"><br>

    <input type="file" multiple><br>

    <button onclick="alert('Next step → payment + backend')">
      Submit & Pay ₹1
    </button>

    <button onclick="closeModal()">Cancel</button>

  </div>
</div>
```

`);
}

/* =========================
DELETE MODAL
========================= */

function openDeleteModal(){

document.body.insertAdjacentHTML("beforeend", ` <div class="modal">

```
  <div class="card">

    <h3>Delete Item</h3>

    <input placeholder="Unique ID"><br>
    <input placeholder="Item ID"><br>

    <button onclick="alert('Next step → backend delete')">
      Delete
    </button>

    <button onclick="closeModal()">Cancel</button>

  </div>
</div>
```

`);
}

/* =========================
CLOSE MODAL
========================= */

function closeModal(){
document.querySelectorAll(".modal").forEach(m=>m.remove());
}

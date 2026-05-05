async function toBase64(file){
  return new Promise((resolve)=>{
    const reader = new FileReader();
    reader.onload = ()=>resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

async function compressImage(file){

  const img = await createImageBitmap(file);

  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 800;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, 800, 800);

  return canvas.toDataURL("image/webp", 0.7);
}



/* =========================
   CONFIG
========================= */

const API = "https://late-field-305a.propertiesgrouphyd.workers.dev";

const CATEGORY_CONFIG = [
  { key: "offer", label: "Offer", color: "#22c55e" },
  { key: "demand", label: "Demand", color: "#f59e0b" },
  { key: "donate", label: "Donate", color: "#a855f7" }
];

let DATA = {};
let CURRENT = "offer";

/* =========================
   LOAD
========================= */

async function loadAll() {
  for (const c of CATEGORY_CONFIG) {
    await loadCategory(c.key);
  }
  renderCategories();
  renderItems("offer");
}

async function loadCategory(key) {
  const res = await fetch(`./${key}.json?t=${Date.now()}`);
  DATA[key] = await res.json();
}

async function refreshCategory() {
  await loadCategory(CURRENT);
  renderItems(CURRENT);
}

loadAll();

/* =========================
   CATEGORIES
========================= */

function renderCategories() {
  const el = document.getElementById("categories");

  el.innerHTML = CATEGORY_CONFIG.map(c => `
    <div class="cat" data-key="${c.key}" style="
      min-width:90px;text-align:center;cursor:pointer;
      opacity:${c.key==="offer"?1:0.6};
    ">
      <div style="
        width:70px;height:70px;border-radius:50%;
        background:${c.color};
        display:flex;align-items:center;justify-content:center;
        font-weight:bold;color:white;
      ">
        ${c.label[0]}
      </div>
      <div style="margin-top:6px;font-size:12px;">
        ${c.label}
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".cat").forEach(btn => {
    btn.onclick = () => {
      CURRENT = btn.dataset.key;
      document.querySelectorAll(".cat").forEach(c => c.style.opacity = 0.6);
      btn.style.opacity = 1;
      renderItems(CURRENT);
    };
  });
}

/* =========================
   TOP BAR
========================= */

function topBar() {
  const color = CATEGORY_CONFIG.find(c => c.key === CURRENT).color;

  return `
    <div class="card" style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">

      <input id="search" placeholder="Search..."
      style="flex:1;height:40px;border-radius:8px;border:none;padding:0 10px;">

      <button onclick="openAdd()" style="
        background:${color};color:white;border:none;
        padding:10px;border-radius:8px;font-weight:600;">
        + Add
      </button>

      <button onclick="openDelete()" style="
        background:#ef4444;color:white;border:none;
        padding:10px;border-radius:8px;font-weight:600;">
        Delete
      </button>

    </div>
  `;
}

/* =========================
   ITEMS
========================= */

function renderItems(key) {

  const now = Date.now();

  const items = (DATA[key] || []).filter(i =>
    i.remaining > 0 && now < i.expires_at
  );

  const color = CATEGORY_CONFIG.find(c => c.key === key).color;

  const container = document.getElementById("items");

  container.innerHTML = topBar() + `
    <div class="grid">

      ${items.map((item, i) => `
        <div class="card">

          <div style="aspect-ratio:1/1;background:#0f172a;border-radius:10px;overflow:hidden;">
            ${item.images && item.images[0] ? `<img src="${item.images[0]}" style="width:100%;height:100%;object-fit:cover;">` : ""}
          </div>

          <div style="margin-top:8px;font-weight:600;">${item.name}</div>

          <div style="font-size:12px;color:#94a3b8;">${item.quantity}</div>

          <div>₹${item.price}</div>

          <div style="font-size:11px;color:#94a3b8;">By ${item.vendor_name}</div>

          <div style="font-size:11px;color:#94a3b8;">Stock: ${item.remaining}</div>

          <div style="font-size:11px;color:#94a3b8;">
            ${Math.max(0, Math.floor((item.expires_at - Date.now())/60000))} mins left
          </div>

          <div style="display:flex;gap:8px;justify-content:center;margin-top:8px;">
            <button onclick="dec(${i})">−</button>
            <div id="q_${i}">1</div>
            <button onclick="inc(${i})">+</button>
          </div>

          <button onclick="openOrder(${i})"
          style="margin-top:10px;width:100%;background:${color};
          color:white;padding:10px;border:none;border-radius:8px;">
            Order
          </button>

        </div>
      `).join("")}

    </div>
  `;
}

/* =========================
   SEARCH
========================= */

document.addEventListener("input", e => {
  if (e.target.id !== "search") return;

  const q = e.target.value.toLowerCase();

  const filtered = DATA[CURRENT].filter(i =>
    i.name.toLowerCase().includes(q)
  );

  renderFiltered(filtered);
});

function renderFiltered(items) {
  const container = document.getElementById("items");

  container.innerHTML = `
    <div class="grid">
      ${items.map(i => `
        <div class="card">
          <div>${i.name}</div>
          <div>₹${i.price}</div>
        </div>
      `).join("")}
    </div>
  `;
}

/* =========================
   QTY
========================= */

function inc(i) {
  const item = DATA[CURRENT][i];
  const el = document.getElementById("q_" + i);

  if (+el.innerText < item.remaining) {
    el.innerText++;
  }
}

function dec(i) {
  const el = document.getElementById("q_" + i);
  if (+el.innerText > 1) el.innerText--;
}

/* =========================
   ORDER
========================= */

function openOrder(i) {

  const item = DATA[CURRENT][i];
  const qty = document.getElementById("q_" + i).innerText;

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal">
      <div class="card">

        <h3>Order</h3>

        <p>${item.name}</p>
        <p>Qty: ${qty}</p>
        <p>Total: ₹${item.price * qty}</p>

        <input id="uid" placeholder="Your Unique ID">

        <button onclick="payOrder(${i},${qty})">Pay</button>
        <button onclick="closeModal()">Cancel</button>

      </div>
    </div>
  `);
}

async function payOrder(i, qty) {

  const item = DATA[CURRENT][i];
  const userId = document.getElementById("uid").value;

  if (!userId) {
    alert("Enter your ID");
    return;
  }

  alert("Processing payment...");

  const res = await fetch(API + "/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: item.price * qty })
  });

  if (!res.ok) {
    alert("Server error. Try again.");
    return;
  }

  const order = await res.json();

  const rzp = new Razorpay({
    key: "rzp_live_SO4F7YCOOnRVRZ", // 🔥 REPLACE THIS
    order_id: order.id,

    handler: async (resp) => {

      await fetch(API + "/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...resp,
          meta: {
            itemId: item.id,
            qty,
            userId,
            category: CURRENT
          }
        })
      });

      await refreshCategory();
      closeModal();
      alert("Order success");
    }
  });

  rzp.open();
}

/* =========================
   ADD
========================= */

function openAdd(){

  openModal(`
    <h3>Add Item</h3>

    <input id="aid" placeholder="Unique ID"><br>
    <input id="name" placeholder="Name"><br>
    <input id="price" placeholder="Price"><br>
    <input id="qty" placeholder="Unit"><br>
    <input id="total" placeholder="Total stock"><br>
    <input id="time" placeholder="Delivery time"><br>

    <input id="img" type="file" multiple><br>

    <button onclick="submitAdd()">Submit & Pay ₹1</button>
  `);
}

async function submitAdd() {

  const files = document.getElementById("img").files;

  if (files.length > 5) {
    alert("Max 5 images");
    return;
  }

  let imageUrls = [];

  for (let f of files) {
    try {
      const compressed = await compressImage(f);

      const res = await fetch(API + "/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: compressed })
      });

      if (!res.ok) {
        alert("Image upload failed");
        return;
      }

      const data = await res.json();
      imageUrls.push(data.url);

    } catch {
      alert("Image error");
      return;
    }
  }

  const payload = {
    userId: document.getElementById("aid").value,
    name: document.getElementById("name").value,
    price: +document.getElementById("price").value,
    quantity: document.getElementById("qty").value,
    total: +document.getElementById("total").value,
    time: +document.getElementById("time").value,
    images: imageUrls
  };

  if (!payload.userId || !payload.name || !payload.price) {
    alert("Fill all fields");
    return;
  }

  alert("Processing payment...");

  const res = await fetch(API + "/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: 1 })
  });

  if (!res.ok) {
    alert("Server error");
    return;
  }

  const order = await res.json();

  const rzp = new Razorpay({
    key: "rzp_live_SO4F7YCOOnRVRZ", // 🔥 REPLACE THIS
    order_id: order.id,

    handler: async (resp) => {

      await fetch(API + "/verify-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...resp,
          meta: { ...payload, category: CURRENT }
        })
      });

      await refreshCategory();
      closeModal();
      alert("Item added");
    }
  });

  rzp.open();
}
/* =========================
   DELETE
========================= */

function openDelete() {

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal">
      <div class="card">

        <h3>Delete</h3>

        <input id="did" placeholder="Your ID"><br>
        <input id="itemid" placeholder="Item ID"><br>

        <button onclick="submitDelete()">Delete</button>
        <button onclick="closeModal()">Cancel</button>

      </div>
    </div>
  `);
}

async function submitDelete() {

  await fetch(API + "/delete-item", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: document.getElementById("did").value,
      itemId: document.getElementById("itemid").value,
      category: CURRENT
    })
  });

  await refreshCategory();
  closeModal();
  alert("Deleted");
}

/* =========================
   MODAL
========================= */

function openModal(html){

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal" onclick="closeModal(event)">
      <div class="card" onclick="event.stopPropagation()">
        ${html}
        <button onclick="closeModal()">Close</button>
      </div>
    </div>
  `);
}

function closeModal(e){
  if(!e || e.target.classList.contains("modal")){
    document.querySelectorAll(".modal").forEach(m=>m.remove());
  }
}

/* =========================
   AUTO REFRESH
========================= */

setInterval(refreshCategory, 15000);

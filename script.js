let temples = [];
let selectedTemple = null;
let cart = [];

// TEMPLE SEARCH
async function searchTemples() {
  let search = document.getElementById("search").value.trim().toLowerCase();

  if (!search) {
    alert("Enter temple name or city");
    return;
  }

  let url =
    "https://commons.wikimedia.org/w/api.php?action=query" +
    "&generator=search&gsrsearch=" +
    encodeURIComponent(search + " temple India") +
    "&gsrnamespace=6&gsrlimit=8&prop=imageinfo" +
    "&iiprop=url&iiurlwidth=600&format=json&origin=*";

  try {
    let res = await fetch(url);
    let data = await res.json();

    if (!data.query) {
      document.getElementById("templeList").innerHTML = `
        <div class="empty-state">
          <div>🛕</div>
          <h3>No Temples Found</h3>
          <p>Try another temple name or city</p>
        </div>`;
      return;
    }

    let results = Object.values(data.query.pages);

    temples = results.filter(t => {
      let name = t.title
        .replace("File:", "")
        .replace(/\.[^/.]+$/, "")
        .toLowerCase();

      return (
        name.includes("temple") ||
        name.includes("mandir") ||
        name.includes("kovil") ||
        name.includes("devasthan") ||
        name.includes("shrine")
      );
    });

    if (!temples.length) {
      document.getElementById("templeList").innerHTML = `
        <div class="empty-state">
          <div>🛕</div>
          <h3>No Temples Found</h3>
          <p>Search with a temple name or city</p>
        </div>`;
      return;
    }

    document.getElementById("templeList").innerHTML =
      temples.map((t, i) => {
        let name = t.title
          .replace("File:", "")
          .replace(/\.[^/.]+$/, "");

        return `
          <div class="temple-card">
            <img src="${t.imageinfo[0].thumburl}" alt="${name}">
            <div class="temple-info">
              <h3>${name}</h3>
              <p>Temple • India</p>
              <button onclick="selectTemple(${i})">
                Book Darshan →
              </button>
            </div>
          </div>
        `;
      }).join("");
  } catch {
    alert("Unable to load temples");
  }
}

// SELECT TEMPLE
function selectTemple(i) {
  selectedTemple = temples[i].title
    .replace("File:", "")
    .replace(/\.[^/.]+$/, "");
  document.getElementById("selectedTemple").innerHTML = `
    <div class="temple-icon">🛕</div>
    <div>
      <small>SELECTED TEMPLE</small>
      <strong>${selectedTemple}</strong>
    </div>
  `;
  updateBill();
  document.getElementById("booking")
    .scrollIntoView({ behavior: "smooth" });
}

// PRASADAM
let prasadam = [
  {
    id: 1,
    name: "Temple Laddu",
    price: 100,
    image: "images/laddu.jpg"
  },
  {
    id: 2,
    name: "Panchamirtham",
    price: 120,
    image: "images/panchamrutam.jpg"
  },
  {
    id: 3,
    name: "Puliyodarai",
    price: 80,
    image: "images/rice.jpg"
  },

  {
    id: 4,
    name: "Sweet Pongal",
    price: 100,
    image: "images/pongal.jpg"
  }
];

function showPrasadam() {
  document.getElementById("prasadamList").innerHTML =
    prasadam.map(p => `
      <div class="prasadam-card">
        <img src="${p.image}" alt="${p.name}">
        <div class="prasadam-info">
          <h3>${p.name}</h3>
          <p class="price">₹${p.price}</p>
          <button class="add"
            onclick="addPrasadam(${p.id})">
             Add Prasadam
          </button>
        </div>
      </div>

    `).join("");
}

// ADD PRASADAM
function addPrasadam(id) {
  let item = prasadam.find(p => p.id == id);
  let old = cart.find(p => p.id == id);
  if (old) {
    old.qty++;
  } else {
    cart.push({
      ...item,
      qty: 1
    });
  }
  showCart();
  updateBill();
}

// SHOW CART
function showCart() {
  let list = document.getElementById("cartList");
  if (!cart.length) {
    list.innerHTML = `
      <div class="empty-cart">
        <span>🛍️</span>
        <p>No prasadam selected</p>
      </div>
    `;
    document.getElementById("cartCount").innerText = "0 items";
    return;
  }
  let count = cart.reduce(
    (total, item) => total + item.qty,
    0
  );

  document.getElementById("cartCount").innerText =
    count + " items";
  list.innerHTML = cart.map(p => `
    <div class="cart-item">
      <div>
        <b>${p.name}</b>
        <p>₹${p.price} each</p>
      </div>
      <div class="quantity">
        <button onclick="changeQty(${p.id}, -1)">
          −
        </button>
        <span>${p.qty}</span>
        <button onclick="changeQty(${p.id}, 1)">
          +
        </button>
        <button
          class="remove"
          onclick="removePrasadam(${p.id})">
          Remove
        </button>
      </div>
    </div>
  `).join("") +

  `<div class="cart-total">
    Prasadam Total: ₹${getPrasadamTotal()}
  </div>`;
}

// QUANTITY
function changeQty(id, value) {
  let item = cart.find(p => p.id == id);
  item.qty += value;
  if (item.qty <= 0) {
    removePrasadam(id);
  } else {
    showCart();
    updateBill();
  }
}

// REMOVE PRASADAM
function removePrasadam(id) {
  cart = cart.filter(p => p.id != id);
  showCart();
  updateBill();
}

// PRASADAM TOTAL
function getPrasadamTotal() {
  return cart.reduce(
    (total, p) => total + p.price * p.qty,
    0
  );
}

// UPDATE BILL
function updateBill() {
  let darshan = document.querySelector(
    'input[name="darshan"]:checked'
  );
  let darshanPrice =
    darshan ? Number(darshan.dataset.price) : 0;
  let prasadamPrice = getPrasadamTotal();
  let total = darshanPrice + prasadamPrice;
  document.getElementById("bill").innerHTML = `
    <div class="summary-row">
      <span>Temple</span>
      <b>${selectedTemple || "Not selected"}</b>
    </div>
    <div class="summary-row">
      <span>Darshan</span>
      <b>${darshan ? darshan.value : "Not selected"}</b>
    </div>
    <div class="summary-row">
      <span>Prasadam</span>
      <b>₹${prasadamPrice}</b>
    </div>
    <div class="summary-total">
      <span>Total</span>
      <strong>₹${total}</strong>
    </div>
  `;
}

// BOOKING
function book() {
  let name = document.getElementById("name").value.trim();
  let mobile = document.getElementById("mobile").value.trim();
  let date = document.getElementById("date").value;
  let slot = document.getElementById("slot").value;
  let darshan = document.querySelector(
      'input[name="darshan"]:checked'
    );

  if (
    !selectedTemple ||
    !name ||
    !mobile ||
    !date ||
    !slot ||
    !darshan
  ) {
    alert("Please complete all booking details");
    return;
  }
  let booking = {
    temple: selectedTemple,
    name: name,
    mobile: mobile,
    date: date,
    slot: slot,
    darshan: darshan.value,
    total:
      Number(darshan.dataset.price) +
      getPrasadamTotal()
  };

  let history = JSON.parse(
    localStorage.getItem("bookings") || "[]"
  );
  history.push(booking);
  localStorage.setItem(
    "bookings",
    JSON.stringify(history)
  );

  // CLEAR FORM
  document.getElementById("name").value = "";
  document.getElementById("mobile").value = "";
  document.getElementById("date").value = "";
  document.getElementById("slot").value = "";

  // CLEAR DARSHAN
  document.querySelectorAll(
    'input[name="darshan"]'
  ).forEach(x => {
    x.checked = false;
  });

  // CLEAR TEMPLE
  selectedTemple = null;
  document.getElementById("selectedTemple").innerHTML = `
    <div class="temple-icon">🛕</div>
    <div>
      <small>SELECTED TEMPLE</small>
      <strong>No temple selected</strong>
    </div>
  `;

  // CLEAR CART
  cart = [];
  showCart();
  updateBill();
  showHistory();
  alert("Booking Confirmed Successfully!");

  // RETURN TO HISTORY
  document.getElementById("history")
    .scrollIntoView({
      behavior: "smooth"
    });
}

// BOOKING HISTORY
function showHistory() {
  let history = JSON.parse(
    localStorage.getItem("bookings") || "[]"
  );
  let list =
    document.getElementById("historyList");
  if (!history.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div>📖</div>
        <h3>No Bookings Yet</h3>
        <p>Your bookings will appear here</p>
      </div>
    `;
    return;
  }
  list.innerHTML = history.map((b, i) => `
    <div class="history-card">
      <button
        class="delete-booking"
        onclick="deleteBooking(${i})">
        Remove
      </button>
      <h3>${b.temple}</h3>
      <p>
        <b>Name:</b> ${b.name}
      </p>
      <p>
        <b>Date:</b> ${b.date}
      </p>
      <p>
        <b>Time:</b> ${b.slot}
      </p>
      <p>
        <b>Darshan:</b> ${b.darshan}
      </p>
      <p>
        <b>Total:</b> ₹${b.total}
      </p>
    </div>

  `).join("");
}

// DELETE BOOKING
function deleteBooking(i) {
  let history = JSON.parse(
    localStorage.getItem("bookings") || "[]"
  );
  history.splice(i, 1);
  localStorage.setItem(
    "bookings",
    JSON.stringify(history)
  );
  showHistory();
}

// DARSHAN CHANGE
document.querySelectorAll(
  'input[name="darshan"]'
).forEach(input => {
  input.addEventListener(
    "change",
    updateBill
  );
});

// SEARCH USING ENTER
document.getElementById("search")
  .addEventListener("keydown", e => {
    if (e.key === "Enter") {
      searchTemples();
    }
  });

// EXPLORE TEMPLES
function goTemples() {
  document.getElementById("temples")
    .scrollIntoView({
      behavior: "smooth"
    });
}

// START
showPrasadam();
showHistory();
showCart();
updateBill();
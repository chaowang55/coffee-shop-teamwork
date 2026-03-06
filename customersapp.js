const OPENING_HOURS = {
  0: { open: null, close: null }, 
  1: { open: "06:30", close: "19:00" }, 
  2: { open: "06:30", close: "19:00" }, 
  3: { open: "06:30", close: "19:00" }, 
  4: { open: "06:30", close: "19:00" }, 
  5: { open: "06:30", close: "19:00" }, 
  6: { open: "07:00", close: "18:00" } 
};
const coffeeMenu = [
  { name: "Americano", regular: 1.50, large: 2.00 },
  { name: "Americano with milk", regular: 2.00, large: 2.50 },
  { name: "Latte", regular: 2.50, large: 3.00 },
  { name: "Cappuccino", regular: 2.50, large: 3.00 },
  { name: "Hot Chocolate", regular: 2.00, large: 2.50 },
  { name: "Mocha", regular: 2.50, large: 3.00 }
];


let cart = [];


document.addEventListener('DOMContentLoaded', function() {
  renderMenu();
  document.getElementById('submit-order').addEventListener('click', submitOrder);
});

// 
function renderMenu() {
  const menuList = document.getElementById('menu-list');
  menuList.innerHTML = '';

  coffeeMenu.forEach((item, index) => {
    const menuCard = document.createElement('div');
    menuCard.className = 'menu-item';
    menuCard.innerHTML = `
      <h3>${item.name}</h3>
      <div class="price-row">
        <span class="price-label">Regular:</span>
        <span class="price-value">£${item.regular.toFixed(2)}</span>
      </div>
      <div class="price-row">
        <span class="price-label">Large:</span>
        <span class="price-value">£${item.large.toFixed(2)}</span>
      </div>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
        <button onclick="addToCart(${index}, 'regular')" class="btn-primary">Add Regular</button>
        <button onclick="addToCart(${index}, 'large')" class="btn-primary">Add Large</button>
      </div>
    `;
    menuList.appendChild(menuCard);
  });
}

function addToCart(index, size) {
  const item = { ...coffeeMenu[index], size: size, price: coffeeMenu[index][size] };
  cart.push(item);
  renderCart();
}


function renderCart() {
  const cartEl = document.getElementById('cart-items');
  if (cart.length === 0) {
    cartEl.innerHTML = '<p style="color: #6f4e37; text-align: center; padding: 1rem;">Your order is empty ☕</p>';
    return;
  }
  cartEl.innerHTML = cart.map((item, i) => `
    <div style="display: flex; justify-content: space-between; padding: 0.8rem; border-bottom: 1px solid #e6d5c3;">
      <div>
        <span>${i+1}. ${item.name}</span>
        <span style="font-size: 0.8rem; color: #6f4e37;"> (${item.size})</span>
      </div>
      <span>£${item.price.toFixed(2)}</span>
    </div>
  `).join("");
}


function submitOrder() {
  const pickupTime = document.getElementById('pickup-time').value;
  const orderStatusEl = document.getElementById('order-status');
  const submitBtn = document.getElementById('submit-order');

  
  if (!pickupTime || cart.length === 0) {
    alert("Please select items and a valid pick-up time!");
    return;
  }

  if (!isPickupTimeValid(pickupTime)) {
  return; 
}

  submitBtn.disabled = true;
  submitBtn.textContent = "Processing...";
  orderStatusEl.style.display = "block";
  orderStatusEl.className = "status-box";
  orderStatusEl.innerText = "Submitting order...";

  const order = {
    items: cart,
    pick_up_time: pickupTime, 
    status: "Accepted"
  };

  fetch("http://localhost:3001/api/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    orderStatusEl.className = "status-box success";
    orderStatusEl.innerText = `Order #${data.orderId} submitted successfully!`;
    alert(data.message);

  
    cart = [];
    renderCart();
  })
  .catch(err => {
    orderStatusEl.className = "status-box error";
    orderStatusEl.innerText = `Order failed: ${err.message}`;
    console.error(err);
  })
  .finally(() => {
    // 恢复按钮状态
    submitBtn.disabled = false;
    submitBtn.textContent = "Place Order";
  });
}

function checkOrderStatus() {
  const orderId = document.getElementById('order-id-input').value.trim();
  const statusResultEl = document.getElementById('status-result');

  if (!orderId) {
    alert("Please enter an Order ID!");
    return;
  }

  // 加载状态
  statusResultEl.style.display = "block";
  statusResultEl.className = "status-box";
  statusResultEl.innerText = "Checking status...";

  fetch("http://localhost:3001/api/orders")
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    return res.json();
  })
  .then(orders => {
    const order = orders.find(o => o.id == orderId);
    if (order) {
      statusResultEl.className = "status-box success";
      statusResultEl.innerText = `Order #${order.id} | Status: ${order.status}`;
    } else {
      statusResultEl.className = "status-box error";
      statusResultEl.innerText = "Order not found";
    }
  })
  .catch(err => {
    statusResultEl.className = "status-box error";
    statusResultEl.innerText = `Failed to load order: ${err.message}`;
    console.error(err);
  });
}

function isPickupTimeValid(pickupTimeStr) {
  const pickupTime = new Date(pickupTimeStr);
  const dayOfWeek = pickupTime.getDay(); 
  const hoursConfig = OPENING_HOURS[dayOfWeek];


  if (dayOfWeek === 0) {
    alert("Sorry! We are closed on Sundays.");
    return false;
  }


  const [openHour, openMin] = hoursConfig.open.split(":").map(Number);
  const [closeHour, closeMin] = hoursConfig.close.split(":").map(Number);
  const openTotalMin = openHour * 60 + openMin;
  const closeTotalMin = closeHour * 60 + closeMin;

 
  const pickupHour = pickupTime.getHours();
  const pickupMin = pickupTime.getMinutes();
  const pickupTotalMin = pickupHour * 60 + pickupMin;

  if (pickupTotalMin < openTotalMin || pickupTotalMin > closeTotalMin) {
    alert(`Sorry! We are only open ${hoursConfig.open}-${hoursConfig.close} on ${getDayName(dayOfWeek)}.`);
    return false;
  }

  return true;
}


function getDayName(dayOfWeek) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayOfWeek];
}
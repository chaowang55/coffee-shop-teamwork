const OPENING_HOURS = {
  0: { open: null, close: null }, 
  1: { open: "06:30", close: "19:00" }, 
  2: { open: "06:30", close: "19:00" },
  3: { open: "06:30", close: "19:00" }, 
  4: { open: "06:30", close: "19:00" }, 
  5: { open: "06:30", close: "19:00" }, 
  6: { open: "07:00", close: "18:00" }  
};

window.onload = loadOrders;
function loadOrders() {
    fetchWithTimeout('http://localhost:3001/api/orders')
    .then(res => {
        if (!res.ok) throw new Error('request fail');
        return res.json();
    })
    .then(allOrders => {
        const activeOrders = allOrders.filter(order => 
            !["Completed", "Cancelled"].includes(order.status)
        );
        const archivedOrders = allOrders.filter(order => 
            ["Completed", "Cancelled"].includes(order.status)
        );
        
        renderOrders(activeOrders, "active-orders");
        renderOrders(archivedOrders, "archived-orders");
        autoCancelLateOrders(activeOrders);
    })
    .catch(err => {
        const activeOrders = [];
        const archivedOrders = [];
        renderOrders(activeOrders, "active-orders");
        renderOrders(archivedOrders, "archived-orders");
        console.error('拉取订单失败，使用本地数据：', err);
    });
}

function renderOrders(orders, elementId) {
    const el = document.getElementById(elementId);
    if (orders.length === 0) {
        el.innerHTML = "<p style='text-align: center; color: #666; padding: 2rem;'>No orders to display.</p>";
        return;
    }
    
    el.innerHTML = orders.map(order => {
        const coffeeList = order.items.map(item => `<li>${item.name}</li>`).join("");
        const isArchived = ["Completed", "Cancelled"].includes(order.status);
        return `
            <div class="order-card">
                <h4>Order #${order.id}</h4>
                <p>Pick-up: ${new Date(order.pick_up_time).toLocaleString()}</p>
                <p><strong>Items:</strong></p>
                <ul class="coffee-list">${coffeeList}</ul>
                <span class="status status-${order.status.toLowerCase().replace(' ', '')}">${order.status}</span>
                
                ${!isArchived ? `
                <div class="btn-group process-btns">
                    <button onclick="updateStatus(${order.id}, 'Accepted')" class="btn-small">Accept</button>
                    <button onclick="updateStatus(${order.id}, 'In Progress')" class="btn-small">Process</button>
                    <button onclick="updateStatus(${order.id}, 'Ready')" class="btn-small">Ready</button>
                    <button onclick="updateStatus(${order.id}, 'Collected')" class="btn-small">Collect</button>
                </div>
                
                <div class="btn-group action-btns">
                    <button onclick="updateStatus(${order.id}, 'Completed')" class="btn-complete">Complete Order</button>
                    <button onclick="updateStatus(${order.id}, 'Cancelled')" class="btn-cancel">Cancel</button>
                    <button onclick="cancelForOutOfStock(${order.id})" class="btn-cancel" style="background: #ff6b6b;">Cancel (Out of Stock)</button>
                </div>
                ` : ''} 
            </div> 
        `;
    }).join("");
}


function updateStatus(orderId, newStatus) {
   fetchWithTimeout('http://localhost:3001/api/update-status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: orderId, status: newStatus }),
    })
    .then(res => {
        if (!res.ok) throw new Error('update order, statement is failure');
        return res.json();
    })
    .then(updatedOrder => {
      loadOrders();
    })
    .catch(err => {
        alert('update order, statement is failure：' + err.message);
        console.error(err);
    });
}

function cancelForOutOfStock(orderId) {
  if (confirm("Confirm cancel this order due to out of stock?")) {
    fetchWithTimeout('http://localhost:3001/api/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: orderId, 
        status: "Cancelled",
        cancelReason: "Out of stock" 
      }),
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to cancel order');
      return res.json();
    })
    .then(() => {
      loadOrders();
      alert("Order cancelled (out of stock)");
    })
    .catch(err => {
      alert('Cancel failed: ' + err.message);
      console.error(err);
    });
  }
}

function autoCancelLateOrders(orders) {
  const now = new Date();
  orders.forEach(order => {

    const pickupTime = new Date(order.pick_up_time);
    if (isNaN(pickupTime.getTime())) {
      console.warn(`Order #${order.id} has invalid pickup time, skip auto-cancel`);
      return;
    }
    const pickupPlus15 = new Date(pickupTime);
    pickupPlus15.setMinutes(pickupTime.getMinutes() + 15);
    const is15MinsLate = pickupPlus15 < now;
    const isActive = !["Completed", "Cancelled", "Collected"].includes(order.status);

    if (is15MinsLate && isActive) {
      updateStatus(order.id, "Cancelled");
      console.log(`Order #${order.id} auto-cancelled: customer did not turn up 15 mins after pickup time`);
    }
  });
}
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('请求超时,请检查后端服务')), timeout)
    )
  ]);
}

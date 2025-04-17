// admin.js - Handles admin panel for StudentCart

const ADMIN_CREDENTIALS = { username: "admin", password: "sra1ni" };

function getProducts() {
  return JSON.parse(localStorage.getItem('products')) || [];
}
function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}
function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function getSalesStats() {
  // For demo: sales = total items ever added to cart
  let stats = JSON.parse(localStorage.getItem('salesStats')) || { sold: 0, revenue: 0 };
  return stats;
}
function saveSalesStats(stats) {
  localStorage.setItem('salesStats', JSON.stringify(stats));
}

// Admin Login
if (document.getElementById('adminLoginForm')) {
  document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    const msg = document.getElementById('adminLoginMessage');
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      msg.style.color = '#43a047';
      msg.textContent = 'Login successful!';
      setTimeout(() => {
        document.getElementById('admin-login-section').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        renderAdminDashboard();
      }, 700);
    } else {
      msg.textContent = 'Invalid admin credentials.';
    }
  });
}

function renderAdminDashboard() {
  renderAnalytics();
  renderProductList();
  renderUserList();
}

// Product Management
if (document.getElementById('addProductForm')) {
  // Add image field logic
  const imgFieldsDiv = document.getElementById('productImgFields');
  const addImgFieldBtn = document.getElementById('addImgFieldBtn');
  if (addImgFieldBtn) {
    addImgFieldBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'productImgInput';
      input.placeholder = 'Image URL';
      imgFieldsDiv.appendChild(input);
    });
  }
  document.getElementById('addProductForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('productName').value.trim();
    const desc = document.getElementById('productDesc').value.trim();
    const price = parseInt(document.getElementById('productPrice').value);
    const imgInputs = imgFieldsDiv.querySelectorAll('.productImgInput');
    const imgs = Array.from(imgInputs).map(input => input.value.trim()).filter(Boolean);
    if (!name || !desc || !price || imgs.length === 0) return;
    let products = getProducts();
    const id = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id, name, desc, price, imgs });
    saveProducts(products);
    renderProductList();
    document.getElementById('addProductForm').reset();
    // Reset to one image field
    imgFieldsDiv.innerHTML = '';
    const firstInput = document.createElement('input');
    firstInput.type = 'text';
    firstInput.className = 'productImgInput';
    firstInput.placeholder = 'Image URL';
    imgFieldsDiv.appendChild(firstInput);
  });
}


function renderProductList() {
  const list = document.getElementById('productList');
  if (!list) return;
  const products = getProducts();
  list.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'admin-product';
    let imgsHtml = '';
    if (product.imgs && Array.isArray(product.imgs)) {
      imgsHtml = product.imgs.map(url => `<img src="${url}" alt="${product.name}" style="width:40px;height:40px;margin-right:5px;object-fit:cover;border-radius:4px;">`).join('');
    } else if (product.img) {
      imgsHtml = `<img src="${product.img}" alt="${product.name}" style="width:40px;height:40px;margin-right:5px;object-fit:cover;border-radius:4px;">`;
    }
    div.innerHTML = `
      <div style="display:flex;align-items:center;">${imgsHtml}</div>
      <div>
        <strong>${product.name}</strong><br>
        ₹${product.price}<br>
        <span style='font-size:0.95em;'>${product.desc}</span>
      </div>
      <div class="admin-actions">
        <button class="update" onclick="updateProductPrompt(${product.id})">Update</button>
        <button onclick="deleteProduct(${product.id})">Delete</button>
        <button onclick="hideProduct(${product.id})">${product.hidden ? 'Unhide' : 'Hide'}</button>
      </div>
    `;
    list.appendChild(div);
  });
}


window.updateProductPrompt = function(id) {
  const products = getProducts();
  const product = products.find(p => p.id === id);
  if (!product) return;
  const name = prompt('Product Name:', product.name);
  const desc = prompt('Description:', product.desc);
  const price = prompt('Price:', product.price);
  let imgs = product.imgs && Array.isArray(product.imgs) ? product.imgs.join(',') : (product.img || '');
  imgs = prompt('Image URLs (comma-separated):', imgs);
  if (!name || !desc || !price || !imgs) return;
  product.name = name;
  product.desc = desc;
  product.price = parseInt(price);
  product.imgs = imgs.split(',').map(s => s.trim()).filter(Boolean);
  delete product.img;
  saveProducts(products);
  renderProductList();
};

window.deleteProduct = function(id) {
  let products = getProducts();
  products = products.filter(p => p.id !== id);
  saveProducts(products);
  renderProductList();
};

window.hideProduct = function(id) {
  let products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return;
  products[idx].hidden = !products[idx].hidden;
  saveProducts(products);
  renderProductList();
};

// User Management
function renderUserList() {
  const list = document.getElementById('userList');
  if (!list) return;
  const users = getUsers();
  list.innerHTML = '';
  users.forEach(user => {
    const div = document.createElement('div');
    div.className = 'admin-user';
    div.innerHTML = `
      <span>Name: ${user.name ? user.name : '-'}</span>
      <span>Mobile: ${user.mobile ? user.mobile : '-'}</span>
      <span>Roll No.: ${user.rollno ? user.rollno : '-'}</span>
      <span>Class: ${user.class ? user.class : '-'}</span>
      <span>Section: ${user.section ? user.section : '-'}</span>
      <span>Status: ${user.blocked ? 'Blocked' : 'Active'}</span>
      <button onclick="blockUser('${user.username}')">${user.blocked ? 'Unblock' : 'Block'}</button>
      <button onclick="deleteUser('${user.username}')">Delete</button>
    `;
    list.appendChild(div);
  });
}

// Render orders placed by users
function renderOrderList() {
  const orderListDiv = document.getElementById('orderList');
  if (!orderListDiv) return;
  let orders = JSON.parse(localStorage.getItem('orders') || '[]');
  if (orders.length === 0) {
    orderListDiv.innerHTML = '<div style="color:#888;">No orders placed yet.</div>';
    return;
  }
  orderListDiv.innerHTML = '';
  orders.forEach((order, idx) => {
    const div = document.createElement('div');
    div.className = 'admin-order';
    div.innerHTML = `
      <div><strong>Order #${idx+1}</strong> <span style="font-size:0.95em;color:#888;">(${new Date(order.date).toLocaleString()})</span></div>
      <div><strong>User Info:</strong> Name: ${order.user.name}, Mobile: ${order.user.mobile}, Roll No.: ${order.user.rollno}, Class: ${order.user.class}, Section: ${order.user.section}</div>
      <div><strong>Products:</strong><ul style="margin:0.5em 0 0.5em 1.5em;">
        ${order.products.map(p => `<li>${p.name} (x${p.quantity}) - ₹${p.price}</li>`).join('')}
      </ul></div>
      <div><strong>Status:</strong> <span style="color:${order.status==='Delivered'?'#43a047':order.status==='Cancelled'?'#e53935':'#888'};font-weight:600;">${order.status||'Pending'}</span></div>
      ${order.status==='Cancelled'?`<div><strong>Cancel Reason:</strong> <span style='color:#e53935;'>${order.cancelReason||''}</span></div>`:''}
      ${order.status==='Cancelled'&&order.cancelledBy==='Admin'?`<div style='color:#e53935;font-weight:600;'>Product cancelled by Admin</div>`:''}
      <div style="margin:0.6em 0;">
        <button onclick="updateOrderStatus(${idx}, 'Delivered')" style="background:#43a047;color:#fff;padding:0.3em 0.8em;border-radius:6px;border:none;margin-right:0.5em;cursor:pointer;">Mark Delivered</button>
        <button onclick="updateOrderStatus(${idx}, 'Cancelled')" style="background:#e53935;color:#fff;padding:0.3em 0.8em;border-radius:6px;border:none;cursor:pointer;">Cancel Order</button>
      </div>
    `;
    orderListDiv.appendChild(div);
  });
}

// Call this after rendering user list
renderOrderList();

window.updateOrderStatus = function(idx, status) {
  let orders = JSON.parse(localStorage.getItem('orders') || '[]');
  if (!orders[idx]) return;
  if (status === 'Delivered') {
    orders[idx].status = 'Delivered';
    delete orders[idx].cancelReason;
    delete orders[idx].cancelledBy;
  } else if (status === 'Cancelled') {
    const reason = prompt('Enter reason for cancellation:');
    if (!reason) return;
    orders[idx].status = 'Cancelled';
    orders[idx].cancelReason = reason;
    orders[idx].cancelledBy = 'Admin';
  }
  localStorage.setItem('orders', JSON.stringify(orders));
  renderOrderList();
};

window.toggleBlockUser = function(idx) {
  let users = getUsers();
  users[idx].blocked = !users[idx].blocked;
  saveUsers(users);
  renderUserList();
};

window.deleteUser = function(idx) {
  let users = getUsers();
  users.splice(idx, 1);
  saveUsers(users);
  renderUserList();
};

// Analytics
function renderAnalytics() {
  const el = document.getElementById('analytics');
  if (!el) return;
  const products = getProducts();
  const users = getUsers();
  const stats = getSalesStats();
  el.innerHTML = `
    <h4>Analytics</h4>
    <div><strong>Total Products:</strong> ${products.length}</div>
    <div><strong>Registered Users:</strong> ${users.length}</div>
    <div><strong>Total Sold (Demo):</strong> ${stats.sold}</div>
    <div><strong>Total Revenue (Demo):</strong> ₹${stats.revenue}</div>
  `;
}

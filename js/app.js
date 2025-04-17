// app.js - HunterHUB Main JS

// Sample products (for demo)
const demoProducts = [
  {
    id: 1,
    name: "Casio Scientific Calculator",
    desc: "Ideal for students, 2-line display.",
    price: 799,
    img: "assets/calculator.jpg"
  },
  {
    id: 2,
    name: "Classmate Spiral Notebook",
    desc: "200 pages, ruled, A4 size.",
    price: 120,
    img: "assets/notebook.jpg"
  },
  {
    id: 3,
    name: "Parker Ball Pen",
    desc: "Smooth writing, blue ink.",
    price: 60,
    img: "assets/pen.jpg"
  },
  {
    id: 4,
    name: "Backpack",
    desc: "Lightweight, water-resistant, 20L.",
    price: 899,
    img: "assets/bag.jpg"
  }
];

function getProducts() {
  let products = JSON.parse(localStorage.getItem('products'));
  if (!products || !products.length) {
    localStorage.setItem('products', JSON.stringify(demoProducts));
    return demoProducts;
  }
  return products;
}

function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderProducts(filter = "") {
  const gallery = document.getElementById('product-gallery');
  if (!gallery) return;
  let products = getProducts();
  // Hide products with hidden===true
  products = products.filter(p => !p.hidden);
  if (filter && filter.trim() !== "") {
    const q = filter.trim().toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) || (p.desc && p.desc.toLowerCase().includes(q))
    );
  }
  gallery.innerHTML = '';
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    // Support multiple images: show thumbnails
    let imgs = [];
    if (product.imgs && Array.isArray(product.imgs) && product.imgs.length > 0) {
      imgs = product.imgs;
    } else if (product.img) {
      imgs = [product.img];
    }
    let thumbs = imgs.map((url, idx) => `<img src="${url}" class="product-thumb" data-pid="${product.id}" data-idx="${idx}" alt="${product.name} image ${idx+1}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;margin:0 3px;cursor:pointer;border:2px solid #eee;">`).join('');
    card.innerHTML = `
      <div class="product-img-main" style="text-align:center;">
        <img src="${imgs[0]}" class="product-main-img" data-pid="${product.id}" data-idx="0" alt="${product.name}" style="width:110px;height:110px;object-fit:contain;border-radius:10px;box-shadow:0 1px 8px #a17fe022;cursor:pointer;">
      </div>
      <div class="product-thumbs" style="margin:0.4rem 0 0.7rem 0;text-align:center;">${thumbs}</div>
      <h4>${product.name}</h4>
      <div class="price">₹${product.price}</div>
      <p>${product.desc}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    gallery.appendChild(card);
  });
}

// --- My Orders Modal Logic ---
function renderMyOrdersModal() {
  const modal = document.getElementById('my-orders-modal');
  const modalBody = document.getElementById('my-orders-modal-body');
  if (!modal || !modalBody) return;
  const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (!user) {
    modalBody.innerHTML = '<div style="color:#e53935;">Please log in to see your orders.</div>';
    return;
  }
  let orders = JSON.parse(localStorage.getItem('orders') || '[]');
  // Show only orders placed by this user (by mobile)
  orders = orders.filter(o => o.user && o.user.mobile === user.mobile);
  if (!orders.length) {
    modalBody.innerHTML = '<div style="color:#888;">No orders found.</div>';
    return;
  }
  modalBody.innerHTML = orders.map((order, idx) => `
    <div class="my-order-item" style="border-bottom:1px solid #eee;padding:0.7em 0;">
      <div><strong>Order Date:</strong> ${new Date(order.date).toLocaleString()}</div>
      <div><strong>Status:</strong> <span style="color:${order.status==='Delivered'?'#43a047':order.status==='Cancelled'?'#e53935':'#888'};font-weight:600;">${order.status||'Pending'}</span></div>
      ${order.status==='Cancelled'?`<div><strong>Cancel Reason:</strong> <span style='color:#e53935;'>${order.cancelReason||''}</span></div>`:''}
      ${order.status==='Cancelled'&&order.cancelledBy==='Admin'?`<div style='color:#e53935;font-weight:600;'>Product cancelled by Admin</div>`:''}
      <div><strong>Products:</strong><ul style="margin:0.3em 0 0.3em 1.3em;">
        ${order.products.map(p => `<li>${p.name} (x${p.quantity}) - ₹${p.price}</li>`).join('')}
      </ul></div>
      ${order.status!=='Delivered'&&order.status!=='Cancelled'?`<button class="cancel-my-order-btn btn" data-order-idx="${idx}" style="background:#e53935;color:#fff;padding:0.25em 0.8em;border-radius:6px;border:none;cursor:pointer;">Cancel Order</button>`:''}
    </div>
  `).join('');
}
// Open/close modal and handle cancel
window.addEventListener('DOMContentLoaded', () => {
  // Show My Orders button for logged-in users
  const myOrdersBtn = document.getElementById('my-orders-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if (myOrdersBtn) myOrdersBtn.style.display = currentUser ? '' : 'none';

  // Open modal
  if (myOrdersBtn) {
    myOrdersBtn.addEventListener('click', function() {
      document.getElementById('my-orders-modal').style.display = 'flex';
      renderMyOrdersModal();
    });
  }
  // Close modal
  const myOrdersModalClose = document.getElementById('my-orders-modal-close');
  if (myOrdersModalClose) {
    myOrdersModalClose.addEventListener('click', function() {
      document.getElementById('my-orders-modal').style.display = 'none';
    });
  }
  // Hide modal on outside click
  document.getElementById('my-orders-modal').addEventListener('click', function(e) {
    if (e.target.id === 'my-orders-modal') {
      document.getElementById('my-orders-modal').style.display = 'none';
    }
  });
  // Cancel my order logic (delegate)
  document.getElementById('my-orders-modal-body').addEventListener('click', function(e) {
    if (e.target.classList.contains('cancel-my-order-btn')) {
      const idx = parseInt(e.target.getAttribute('data-order-idx'));
      let orders = JSON.parse(localStorage.getItem('orders') || '[]');
      // Find user's orders
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      const userOrdersIdx = orders.reduce((arr, o, i) => {
        if (o.user && user && o.user.mobile === user.mobile) arr.push(i);
        return arr;
      }, []);
      const realIdx = userOrdersIdx[idx];
      if (orders[realIdx].status === 'Delivered' || orders[realIdx].status === 'Cancelled') return;
      const reason = prompt('Enter reason for cancellation:');
      if (!reason) return;
      orders[realIdx].status = 'Cancelled';
      orders[realIdx].cancelReason = reason;
      localStorage.setItem('orders', JSON.stringify(orders));
      renderMyOrdersModal();
    }
  });
  const searchForm = document.querySelector('.search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const val = document.getElementById('search-bar').value;
      renderProducts(val);
    });
    // Optional: live search as you type
    document.getElementById('search-bar').addEventListener('input', function(e) {
      renderProducts(e.target.value);
    });
  }

  // Inject modal HTML if not present
  if (!document.getElementById('img-modal')) {
    const modal = document.createElement('div');
    modal.id = 'img-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div id="img-modal-backdrop" style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#222c;z-index:9999;display:flex;justify-content:center;align-items:center;">
        <div id="img-modal-content" style="background:#fff;padding:1.2rem 1.2rem 0.7rem 1.2rem;border-radius:12px;box-shadow:0 8px 32px #0004;max-width:98vw;max-height:94vh;display:flex;flex-direction:column;align-items:center;position:relative;">
          <span id="img-modal-close" style="position:absolute;top:7px;right:13px;font-size:2rem;cursor:pointer;color:#a17fe0;">&times;</span>
          <img id="img-modal-img" src="" alt="Product Image" style="max-width:70vw;max-height:60vh;border-radius:10px;box-shadow:0 2px 16px #a17fe033;">
          <div id="img-modal-thumbs" style="margin-top:1rem;text-align:center;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Helper to open modal
  function openImgModal(imgs, idx) {
    const modal = document.getElementById('img-modal');
    const modalImg = document.getElementById('img-modal-img');
    const thumbsDiv = document.getElementById('img-modal-thumbs');
    modal.style.display = 'block';
    modalImg.src = imgs[idx];
    modalImg.setAttribute('data-idx', idx);
    // Thumbnails in modal
    thumbsDiv.innerHTML = imgs.map((url, i) => `<img src="${url}" data-modal-idx="${i}" style="width:54px;height:54px;object-fit:cover;border-radius:6px;margin:0 3px;cursor:pointer;border:2px solid ${i==idx?'#a17fe0':'#eee'};">`).join('');
    // Thumb click
    Array.from(thumbsDiv.querySelectorAll('img')).forEach(thumb => {
      thumb.onclick = function() {
        openImgModal(imgs, parseInt(this.getAttribute('data-modal-idx')));
      };
    });
  }

  // Click listeners for gallery (delegate)
  document.body.addEventListener('click', function(e) {
    // Main image click
    if (e.target.classList.contains('product-main-img')) {
      const pid = e.target.getAttribute('data-pid');
      const idx = parseInt(e.target.getAttribute('data-idx'));
      const products = getProducts().filter(p => !p.hidden);
      const prod = products.find(p => p.id == pid);
      let imgs = [];
      if (prod.imgs && Array.isArray(prod.imgs) && prod.imgs.length > 0) imgs = prod.imgs;
      else if (prod.img) imgs = [prod.img];
      openImgModal(imgs, idx);
    }
    // Thumbnail click in gallery
    if (e.target.classList.contains('product-thumb')) {
      const pid = e.target.getAttribute('data-pid');
      const idx = parseInt(e.target.getAttribute('data-idx'));
      const products = getProducts().filter(p => !p.hidden);
      const prod = products.find(p => p.id == pid);
      let imgs = [];
      if (prod.imgs && Array.isArray(prod.imgs) && prod.imgs.length > 0) imgs = prod.imgs;
      else if (prod.img) imgs = [prod.img];
      openImgModal(imgs, idx);
    }
    // Modal close
    if (e.target.id === 'img-modal-close' || e.target.id === 'img-modal-backdrop') {
      document.getElementById('img-modal').style.display = 'none';
    }
  });
});

function addToCart(productId) {
  const products = getProducts();
  const cart = getCart();
  const product = products.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  showCartSummary();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  updateCartCount();
  showCartSummary();
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const el = document.getElementById('cart-count');
  if (el) el.textContent = count;
}

function showCartSummary() {
  const cartSummary = document.getElementById('cart-summary');
  if (!cartSummary) return;
  const cart = getCart();
  if (cart.length === 0) {
    cartSummary.style.display = 'none';
    return;
  }
  cartSummary.style.display = 'block';
  const cartItems = document.getElementById('cart-items');
  cartItems.innerHTML = '';
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-details">
        <strong>${item.name}</strong><br>
        Qty: ${item.qty} × ₹${item.price}
      </div>
      <span class="cart-item-remove" onclick="removeFromCart(${item.id})">&times;</span>
    `;
    cartItems.appendChild(div);
  });
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  document.getElementById('cart-total').innerHTML = `<strong>Total: ₹${total}</strong>`;
}

document.addEventListener('DOMContentLoaded', function() {
  // Show/hide login and register links based on user login
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const logoutBtn = document.getElementById('logout-btn');
  const currentUser = localStorage.getItem('currentUser');
  const accountBtn = document.getElementById('account-btn');
  if (currentUser) {
    if (loginLink) loginLink.style.display = 'none';
    if (registerLink) registerLink.style.display = 'none';
    if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
      logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
      });
    }
    if (accountBtn) {
      accountBtn.style.display = 'inline-block';
      accountBtn.addEventListener('click', function() {
        let user = JSON.parse(localStorage.getItem('currentUser'));
        // Build account info HTML (no password)
        let infoHtml = `<div class='account-info-modal-content'>` +
          `<span class='account-info-modal-close' id='account-info-modal-close'>&times;</span>` +
          `<h3>Your Account Information</h3>` +
          `<div class='account-info-list'>` +
          `<strong>Name:</strong> ${user.name || '-'}<br>` +
          `<strong>Mobile:</strong> ${user.mobile || '-'}<br>` +
          `<strong>Roll No.:</strong> ${user.rollno || '-'}<br>` +
          `<strong>Class:</strong> ${user.class || '-'}<br>` +
          `<strong>Section:</strong> ${user.section || '-'}<br>` +
          `</div></div>`;
        let modal = document.getElementById('account-info-modal');
        if (!modal) {
          modal = document.createElement('div');
          modal.id = 'account-info-modal';
          modal.className = 'account-info-modal';
          document.body.appendChild(modal);
        }
        modal.innerHTML = infoHtml;
        modal.style.display = 'flex';
        document.getElementById('account-info-modal-close').onclick = function() {
          modal.style.display = 'none';
        };
      });
    }
  } else {
    if (loginLink) loginLink.style.display = '';
    if (registerLink) registerLink.style.display = '';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (accountBtn) accountBtn.style.display = 'none';
  }

  renderProducts();
  updateCartCount();
  showCartSummary();
  const cartLink = document.getElementById('cart-link');
  if (cartLink) {
    cartLink.addEventListener('click', function(e) {
      e.preventDefault();
      showCartSummary();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      const currentUser = localStorage.getItem('currentUser');
      if (!currentUser) {
        showLoginPopup();
        return;
      }
      if (confirm('Proceed with Cash-On-Delivery (COD) order?')) {
        // Save order to localStorage for admin
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        let user = JSON.parse(localStorage.getItem('currentUser'));
        let cart = getCart();
        orders.push({
          user: {
            name: user.name || '-',
            mobile: user.mobile || '-',
            rollno: user.rollno || '-',
            class: user.class || '-',
            section: user.section || '-'
          },
          products: cart,
          date: new Date().toISOString()
        });
        localStorage.setItem('orders', JSON.stringify(orders));
        alert('Order placed successfully! Your items will be delivered with Cash-On-Delivery.');
        saveCart([]); // Clear the cart
        showCartSummary();
        updateCartCount();
      }
    });
  }

  // Add popup HTML to body
  if (!document.getElementById('login-popup')) {
    const popup = document.createElement('div');
    popup.id = 'login-popup';
    popup.innerHTML = `
      <div class="login-popup-content">
        <span class="login-popup-close" id="login-popup-close">&times;</span>
        <div class="login-popup-msg">Please Login/Register Account For Checkout.</div>
        <div style="text-align:center;margin-top:1rem;">
          <a href="login.html" class="login-popup-btn">Login</a>
          <a href="register.html" class="login-popup-btn">Register</a>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('login-popup-close').onclick = function() {
      popup.style.display = 'none';
    };
    popup.style.display = 'none';
  }
});

function showLoginPopup() {
  const popup = document.getElementById('login-popup');
  if (popup) popup.style.display = 'flex';
}

// Floating emoji button animation
// (Moved inside DOMContentLoaded below)

// Emoji burst/confetti animation
function showEmojiBurst() {
  const emojiList = ['🎉','🎊','✨','🥳','😃','💥','🛒','📚','🎒','⭐','🚀','🦄'];
  for (let i = 0; i < 18; i++) {
    const emoji = document.createElement('span');
    emoji.textContent = emojiList[Math.floor(Math.random()*emojiList.length)];
    emoji.style.position = 'fixed';
    emoji.style.left = (window.innerWidth/2 + (Math.random()-0.5)*180) + 'px';
    emoji.style.top = (window.innerHeight-80) + 'px';
    emoji.style.fontSize = (Math.random()*1.8+1.2) + 'rem';
    emoji.style.pointerEvents = 'none';
    emoji.style.zIndex = 2000;
    emoji.style.transition = 'transform 1.1s cubic-bezier(.23,1.03,.64,1), opacity 1.1s';
    document.body.appendChild(emoji);
    setTimeout(() => {
      emoji.style.transform = `translateY(-${Math.random()*280+120}px) translateX(${(Math.random()-0.5)*200}px) scale(${Math.random()*0.7+0.8}) rotate(${Math.random()*80-40}deg)`;
      emoji.style.opacity = 0;
    }, 20);
    setTimeout(() => { emoji.remove(); }, 1300);
  }
}

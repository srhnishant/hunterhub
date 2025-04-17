// auth.js - Handles registration and login for StudentCart

function validateMobile(mobile) {
  return /^\d{10}$/.test(mobile);
}

function validatePassword(password) {
  // At least 8 chars, 1 letter, 1 number
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/.test(password);
}

function getUsers() {
  return JSON.parse(localStorage.getItem('users')) || [];
}

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// Registration Logic
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const classVal = document.getElementById('regClass').value;
    const section = document.getElementById('regSection').value;
    const roll = document.getElementById('regRoll').value.trim();
    const mobile = document.getElementById('regMobile').value.trim();
    const password = document.getElementById('regPassword').value;
    const msg = document.getElementById('registerMessage');
    if (!name || !classVal || !section || !roll || !mobile || !password) {
      msg.textContent = 'All fields are required.';
      return;
    }
    if (!validateMobile(mobile)) {
      msg.textContent = 'Enter a valid 10-digit mobile number.';
      return;
    }
    if (!validatePassword(password)) {
      msg.textContent = 'Password must be at least 8 characters (letters and numbers).';
      return;
    }
    const users = getUsers();
    if (users.find(u => u.mobile === mobile)) {
      msg.textContent = 'Mobile number already registered.';
      return;
    }
    users.push({ name, classVal, section, roll, mobile, password, blocked: false });
    saveUsers(users);
    msg.style.color = '#43a047';
    msg.textContent = 'Registration successful! Redirecting to login...';
    setTimeout(() => window.location.href = 'login.html', 1200);
  });
}

// Login Logic
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('loginName').value.trim();
    const mobile = document.getElementById('loginMobile').value.trim();
    const password = document.getElementById('loginPassword').value;
    const msg = document.getElementById('loginMessage');
    if (!mobile || !password) {
      msg.textContent = 'Mobile and password required.';
      return;
    }
    const users = getUsers();
    const user = users.find(u => u.mobile === mobile && u.password === password);
    if (!user) {
      msg.textContent = 'Invalid credentials.';
      return;
    }
    if (user.blocked) {
      msg.textContent = 'Your account is blocked.';
      return;
    }
    localStorage.setItem('currentUser', JSON.stringify(user));
    msg.style.color = '#43a047';
    msg.textContent = 'Login successful! Redirecting...';
    setTimeout(() => window.location.href = 'index.html', 1000);
  });
}

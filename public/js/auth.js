 // Redirect if already logged in
if (localStorage.getItem('token')) {
  window.location.href = '/applications.html';
}

// ── Element References ────────────────────────────────────────
const loginTab      = document.getElementById('loginTab');
const registerTab   = document.getElementById('registerTab');
const loginForm     = document.getElementById('loginForm');
const registerForm  = document.getElementById('registerForm');
const errorMsg      = document.getElementById('errorMsg');
const successMsg    = document.getElementById('successMsg');

// ── Tab Switching ─────────────────────────────────────────────
loginTab.addEventListener('click', () => {
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  loginTab.classList.add('bg-indigo-600', 'text-white');
  loginTab.classList.remove('text-gray-400');
  registerTab.classList.remove('bg-indigo-600', 'text-white');
  registerTab.classList.add('text-gray-400');
  hideMessages();
});

registerTab.addEventListener('click', () => {
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
  registerTab.classList.add('bg-indigo-600', 'text-white');
  registerTab.classList.remove('text-gray-400');
  loginTab.classList.remove('bg-indigo-600', 'text-white');
  loginTab.classList.add('text-gray-400');
  hideMessages();
});

// ── Helper Functions ──────────────────────────────────────────
const showError = (msg) => {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
  successMsg.classList.add('hidden');
};

const showSuccess = (msg) => {
  successMsg.textContent = msg;
  successMsg.classList.remove('hidden');
  errorMsg.classList.add('hidden');
};

const hideMessages = () => {
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');
};

const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// ── Login Form Submit ─────────────────────────────────────────
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('form submitted, default prevented');
  hideMessages();

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showError('Please fill in all fields.');
    return;
  }

  try {
    const res = await api.post('/auth/login', { email, password });
    saveAuth(res.data.token, res.data.user);
    window.location.href = '/applications.html';
  } catch (err) {
    showError(err.message || 'Login failed. Please try again.');
  }
});

// ── Register Form Submit ──────────────────────────────────────
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideMessages();

  const name     = document.getElementById('registerName').value.trim();
  const email    = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!name || !email || !password) {
    showError('Please fill in all fields.');
    return;
  }

  try {
    const res = await api.post('/auth/register', { name, email, password });
    saveAuth(res.data.token, res.data.user);
    window.location.href = '/applications.html';
  } catch (err) {
    if (err.details && err.details.length > 0) {
      showError(err.details.map(d => d.message).join(', '));
    } else {
      showError(err.message || 'Registration failed. Please try again.');
    }
  }
});


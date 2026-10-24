const accountKey = 'glbajaj-demo-users';
const sessionKey = 'glbajaj-demo-session';

function readAccounts() {
  try { return JSON.parse(localStorage.getItem(accountKey) || '{}'); }
  catch { return {}; }
}

function showMessage(id, message, kind) {
  const element = document.getElementById(id);
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${kind || ''}`;
}

async function passwordDigest(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

const registerForm = document.getElementById('register-form');
if (registerForm) {
  const password = registerForm.elements.password;
  const confirmation = registerForm.elements.confirmPassword;
  confirmation.addEventListener('input', () => {
    confirmation.setCustomValidity(confirmation.value && confirmation.value !== password.value ? 'Passwords do not match.' : '');
  });
  password.addEventListener('input', () => {
    confirmation.setCustomValidity(confirmation.value && confirmation.value !== password.value ? 'Passwords do not match.' : '');
  });
  registerForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!registerForm.reportValidity()) return;
    const values = new FormData(registerForm);
    const email = values.get('email').trim().toLowerCase();
    const accounts = readAccounts();
    if (accounts[email]) {
      showMessage('register-message', 'An account with that email already exists. Try logging in.', 'error');
      return;
    }
    if (!crypto.subtle || !crypto.getRandomValues) {
      showMessage('register-message', 'Secure browser storage is unavailable. Open this site over HTTPS and try again.', 'error');
      return;
    }
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
    try {
      accounts[email] = { name: values.get('name').trim(), mobile: values.get('mobile').trim(), salt, passwordHash: await passwordDigest(values.get('password'), salt) };
      localStorage.setItem(accountKey, JSON.stringify(accounts));
      registerForm.reset();
      showMessage('register-message', 'Registration complete. You can now log in with your email and password.', 'success');
    } catch {
      showMessage('register-message', 'Could not save your demo account in this browser. Check storage settings and try again.', 'error');
    }
  });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!loginForm.reportValidity()) return;
    const values = new FormData(loginForm);
    const email = values.get('email').trim().toLowerCase();
    const account = readAccounts()[email];
    if (!account) {
      showMessage('login-message', 'No demo account found for that email. Register first.', 'error');
      return;
    }
    try {
      if (await passwordDigest(values.get('password'), account.salt) !== account.passwordHash) {
        showMessage('login-message', 'The password is incorrect. Please try again.', 'error');
        return;
      }
      sessionStorage.setItem(sessionKey, JSON.stringify({ email, name: account.name }));
      showMessage('login-message', `Welcome, ${account.name}! You are signed in for this browser session.`, 'success');
      loginForm.reset();
    } catch {
      showMessage('login-message', 'Could not verify this demo account. Please try again.', 'error');
    }
  });
}

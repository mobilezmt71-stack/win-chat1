// State Management
let currentUser = null;
let isSignUpMode = false;

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const chatDashboard = document.getElementById('chat-dashboard');
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const authBtn = document.getElementById('auth-btn');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const authToggleText = document.getElementById('auth-toggle-text');
const logoutBtn = document.getElementById('logout-btn');
const currentUserName = document.getElementById('current-user-name');
const currentUserAvatar = document.getElementById('current-user-avatar');

// Toggle between Sign In and Sign Up modes
authToggleBtn.addEventListener('click', (e) => {
  e.preventDefault();
  isSignUpMode = !isSignUpMode;

  if (isSignUpMode) {
    authBtn.textContent = 'Create Account';
    authToggleText.textContent = 'Already have an account?';
    authToggleBtn.textContent = 'Sign In';
  } else {
    authBtn.textContent = 'Sign In';
    authToggleText.textContent = "Don't have an account?";
    authToggleBtn.textContent = 'Sign Up';
  }
});

// Handle Authentication Form Submission
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) return;

  authBtn.disabled = true;
  authBtn.textContent = 'Processing...';

  try {
    if (isSignUpMode) {
      // Sign Up Logic
      const { data, error } = await _supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      alert('Registration successful! Please sign in with your credentials.');
      authToggleBtn.click(); // Switch back to Sign In mode
    } else {
      // Sign In Logic
      const { data, error } = await _supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setupUserSession(data.user);
    }
  } catch (error) {
    alert(error.message || 'Authentication failed!');
  } finally {
    authBtn.disabled = false;
    authBtn.textContent = isSignUpMode ? 'Create Account' : 'Sign In';
  }
});

// Setup User Session UI
function setupUserSession(user) {
  currentUser = user;
  const displayName = user.email.split('@')[0];
  
  currentUserName.textContent = displayName;
  currentUserAvatar.textContent = displayName.charAt(0).toUpperCase();

  authScreen.classList.add('hidden');
  chatDashboard.classList.remove('hidden');
}

// Logout Logic
logoutBtn.addEventListener('click', async () => {
  await _supabase.auth.signOut();
  currentUser = null;
  authScreen.classList.remove('hidden');
  chatDashboard.classList.add('hidden');
  emailInput.value = '';
  passwordInput.value = '';
});

// Check Active Session on Page Load
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session && session.user) {
    setupUserSession(session.user);
  }
});
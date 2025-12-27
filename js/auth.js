// js/auth.js
import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

function setStatus(el, msg, isError = false) {
  el.textContent = msg;
  el.style.color = isError ? "#ffb3b3" : "#d9d9d9";
}

function disable(el, disabled) {
  if (!el) return;
  if (disabled) {
    el.classList.add("disabled");
    el.setAttribute("aria-disabled", "true");
  } else {
    el.classList.remove("disabled");
    el.removeAttribute("aria-disabled");
  }
}

export function wireAuthUI() {
  const statusEl = document.getElementById("authStatus");
  const emailEl = document.getElementById("email");
  const passEl = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const registerBtn = document.getElementById("registerBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!statusEl || !emailEl || !passEl || !loginBtn || !registerBtn || !logoutBtn) {
    console.warn("Auth UI elements not found.");
    return;
  }

  // Prevent the <a href="#"> from scrolling to top
  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  async function doLogin(e) {
    stop(e);
    disable(loginBtn, true);
    disable(registerBtn, true);
    setStatus(statusEl, "Logging in...");

    const email = emailEl.value.trim();
    const password = passEl.value;

    if (!email || !password) {
      setStatus(statusEl, "Enter email + password.", true);
      disable(loginBtn, false);
      disable(registerBtn, false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      passEl.value = "";
      // onAuthStateChanged will update status
    } catch (err) {
      setStatus(statusEl, friendlyAuthError(err), true);
    } finally {
      disable(loginBtn, false);
      disable(registerBtn, false);
    }
  }

  async function doRegister(e) {
    stop(e);
    disable(loginBtn, true);
    disable(registerBtn, true);
    setStatus(statusEl, "Creating account...");

    const email = emailEl.value.trim();
    const password = passEl.value;

    if (!email || !password) {
      setStatus(statusEl, "Enter email + password.", true);
      disable(loginBtn, false);
      disable(registerBtn, false);
      return;
    }

    if (password.length < 6) {
      setStatus(statusEl, "Password must be 6+ characters.", true);
      disable(loginBtn, false);
      disable(registerBtn, false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      passEl.value = "";
      // onAuthStateChanged will update status
    } catch (err) {
      setStatus(statusEl, friendlyAuthError(err), true);
    } finally {
      disable(loginBtn, false);
      disable(registerBtn, false);
    }
  }

  async function doLogout(e) {
    stop(e);
    try {
      await signOut(auth);
    } catch (err) {
      setStatus(statusEl, "Logout failed. Try again.", true);
    }
  }

  loginBtn.addEventListener("click", doLogin);
  registerBtn.addEventListener("click", doRegister);
  logoutBtn.addEventListener("click", doLogout);

  // Enter key submits login
  passEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin(e);
  });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setStatus(statusEl, `Logged in as: ${user.email || "Account"}`);
      logoutBtn.style.display = "inline";
      emailEl.disabled = true;
      passEl.disabled = true;
      disable(loginBtn, true);
      disable(registerBtn, true);
    } else {
      setStatus(statusEl, "Not logged in.");
      logoutBtn.style.display = "none";
      emailEl.disabled = false;
      passEl.disabled = false;
      disable(loginBtn, false);
      disable(registerBtn, false);
    }
  });
}

function friendlyAuthError(err) {
  const code = (err && err.code) ? String(err.code) : "";
  switch (code) {
    case "auth/invalid-email": return "That email looks wrong.";
    case "auth/missing-password": return "Type a password.";
    case "auth/invalid-credential": return "Wrong email or password.";
    case "auth/user-not-found": return "No account with that email.";
    case "auth/wrong-password": return "Wrong password.";
    case "auth/email-already-in-use": return "That email is already registered.";
    case "auth/weak-password": return "Password is too weak (use 6+ chars).";
    case "auth/network-request-failed": return "Network error. Check your internet.";
    case "auth/operation-not-allowed": return "Email/Password sign-in is disabled in Firebase.";
    case "auth/unauthorized-domain": return "Authorized domains is missing your GitHub Pages domain.";
    default:
      return (err && err.message) ? String(err.message).replace(/^Firebase:\s*/,"") : "Auth error.";
  }
}

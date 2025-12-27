// js/auth.js
import { auth } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

function $(id) { return document.getElementById(id); }

export function wireAuthUI() {
  const loginBtn = $("loginBtn");
  const registerBtn = $("registerBtn");
  const logoutBtn = $("logoutBtn");
  const emailEl = $("email");
  const passEl = $("password");
  const statusEl = $("authStatus");

  async function doLogin() {
    statusEl.textContent = "Signing in...";
    try {
      await signInWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value);
      statusEl.textContent = "Signed in!";
    } catch (e) {
      statusEl.textContent = e.message;
    }
  }

  async function doRegister() {
    statusEl.textContent = "Creating account...";
    try {
      await createUserWithEmailAndPassword(auth, emailEl.value.trim(), passEl.value);
      statusEl.textContent = "Account created!";
    } catch (e) {
      statusEl.textContent = e.message;
    }
  }

  async function doLogout() {
    await signOut(auth);
  }

  loginBtn?.addEventListener("click", (ev) => { ev.preventDefault(); doLogin(); });
  registerBtn?.addEventListener("click", (ev) => { ev.preventDefault(); doRegister(); });
  logoutBtn?.addEventListener("click", (ev) => { ev.preventDefault(); doLogout(); });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      statusEl.textContent = `Logged in as ${user.email}`;
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
      statusEl.textContent = "Not logged in.";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  });
}

// auth.js (ESM)
import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  RecaptchaVerifier,
  linkWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { doc, serverTimestamp, runTransaction } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export function normUsername(u) {
  return (u || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_\.]/g, "");
}

export function prettyError(err) {
  const code = err?.code || "";
  if (code.includes("auth/invalid-email")) return "That email looks wrong.";
  if (code.includes("auth/email-already-in-use")) return "That email is already used.";
  if (code.includes("auth/weak-password")) return "Password is too weak (use 6+ characters).";
  if (code.includes("auth/wrong-password")) return "Wrong password.";
  if (code.includes("auth/user-not-found")) return "Account not found.";
  if (code.includes("auth/too-many-requests")) return "Too many attempts—try again later.";
  if (code.includes("auth/requires-recent-login")) return "Please re-enter your password to do that.";
  if (code.includes("auth/invalid-verification-code")) return "That SMS code is wrong.";
  if (code.includes("auth/missing-verification-code")) return "Enter the SMS code.";
  if (code.includes("username/taken")) return "That username is taken.";
  return err?.message || "Something went wrong.";
}

async function claimUsername(uid, username, email, profileData) {
  const u = normUsername(username);
  if (!u || u.length < 3) {
    const e = new Error("Username must be at least 3 characters.");
    e.code = "username/invalid";
    throw e;
  }

  const unameRef = doc(db, "usernames", u);
  const userRef = doc(db, "users", uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(unameRef);
    if (snap.exists()) {
      const e = new Error("Username is taken.");
      e.code = "username/taken";
      throw e;
    }
    tx.set(unameRef, { uid, createdAt: serverTimestamp() });
    tx.set(userRef, {
      username: u,
      email,
      ...profileData,
      createdAt: serverTimestamp()
    }, { merge: true });
  });

  return u;
}

export async function register({ username, email, password, birthMonth, birthYear, gender, avatar }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  try {
    const claimed = await claimUsername(user.uid, username, email, {
      birthMonth: birthMonth || null,
      birthYear: birthYear || null,
      gender: gender || null,
      avatar: avatar || null
    });
    await updateProfile(user, { displayName: claimed });
  } catch (e) {
    try { await user.delete(); } catch {}
    throw e;
  }

  await sendEmailVerification(user);
  return user;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() { await signOut(auth); }

export async function resendVerification() {
  if (!auth.currentUser) throw new Error("Not signed in.");
  await sendEmailVerification(auth.currentUser);
}

export async function resetPassword(email) { await sendPasswordResetEmail(auth, email); }

export async function changeEmail(newEmail, currentPasswordIfNeeded) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in.");

  try {
    await updateEmail(user, newEmail);
  } catch (e) {
    if ((e?.code || "").includes("auth/requires-recent-login")) {
      if (!currentPasswordIfNeeded) throw e;
      const cred = EmailAuthProvider.credential(user.email, currentPasswordIfNeeded);
      await reauthenticateWithCredential(user, cred);
      await updateEmail(user, newEmail);
    } else throw e;
  }

  await sendEmailVerification(user);
}

// SMS verification (link phone number)
export function setupRecaptcha(containerId="recaptcha") {
  if (window.__recaptchaVerifier) return window.__recaptchaVerifier;
  const verifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  window.__recaptchaVerifier = verifier;
  return verifier;
}

export async function linkPhoneNumber(phoneNumber) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in.");
  const verifier = setupRecaptcha("recaptcha");
  const confirmation = await linkWithPhoneNumber(user, phoneNumber, verifier);
  window.__phoneConfirmation = confirmation;
  return true;
}

export async function confirmPhoneCode(code) {
  const confirmation = window.__phoneConfirmation;
  if (!confirmation) throw new Error("Start SMS verification first.");
  const result = await confirmation.confirm(code);
  window.__phoneConfirmation = null;
  return result.user;
}

export function watchAuth(cb) { return onAuthStateChanged(auth, cb); }

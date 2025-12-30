// firebase.js (2DWORLD)
// Safe to commit. Your project is protected by Auth + Firestore rules.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAexuq5Q8KV6xMC0AKVk7H0dnMFsjyPWes",
  authDomain: "dworld-b10ea.firebaseapp.com",
  projectId: "dworld-b10ea",
  storageBucket: "dworld-b10ea.firebasestorage.app",
  messagingSenderId: "893085470416",
  appId: "1:893085470416:web:fe733dc6ca67380f70d8d5",
  measurementId: "G-DVC13ZYNS1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

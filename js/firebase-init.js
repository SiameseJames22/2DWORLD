// js/firebase-init.js
// Firebase v10+ modular SDK (CDN). Safe to publish.
// IMPORTANT: In Firebase Console -> Authentication -> Settings -> Authorized domains
// add: siamesejames22.github.io  (NO https, NO /2DWORLD)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Your Firebase config (from your screenshot)
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

// Keep user logged in between refreshes
await setPersistence(auth, browserLocalPersistence);

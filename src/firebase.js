// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// ✅ Correct Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC91um9oqN4dE83CBjAxdBPUL231-jIoXw",
  authDomain: "pr-stationers-9d23b.firebaseapp.com",
  projectId: "pr-stationers-9d23b",
  storageBucket: "pr-stationers-9d23b.firebasestorage.app",
  messagingSenderId: "13876144423",
  appId: "1:13876144423:web:82ec7278b34ad8eabb2102"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ✅ Google Auth Provider (for Google Login)
export const googleProvider = new GoogleAuthProvider();

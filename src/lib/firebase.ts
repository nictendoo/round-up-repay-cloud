import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// This is safe to include in client-side code as it only contains public API keys
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA7nZ_Ui7SLOiAEzrVJ5FMZulcGUW1OPAs",
  authDomain: "microrepay-app.firebaseapp.com",
  projectId: "microrepay-app",
  storageBucket: "microrepay-app.appspot.com",
  messagingSenderId: "891532123456",
  appId: "1:891532123456:web:f2c3a4d34d8754fd12a3bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable auth persistence to keep user logged in
auth.setPersistence('local'); 
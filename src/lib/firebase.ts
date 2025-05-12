import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// This is safe to include in client-side code as it only contains public API keys
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "microrepay-app.firebaseapp.com",
  projectId: "microrepay-app",
  storageBucket: "microrepay-app.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app); 
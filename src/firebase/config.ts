// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANQTbVPA4tmoHL9optEbVDJQhmanpsvoo",
  authDomain: "showmyfit-d1162.firebaseapp.com",
  projectId: "showmyfit-d1162",
  storageBucket: "showmyfit-d1162.firebasestorage.app",
  messagingSenderId: "482238306032",
  appId: "1:482238306032:web:55285d58a68b444835d435",
  measurementId: "G-0LBQMJKP2D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment and if available)
let analytics: any = null;
if (typeof window !== 'undefined') {
  try {
    // Only initialize analytics if measurementId is present and valid
    if (firebaseConfig.measurementId && firebaseConfig.measurementId !== '') {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    // Silently fail if analytics can't be initialized
    // This prevents 404 errors from breaking the app
    console.warn('Firebase Analytics initialization failed (this is OK):', error);
    analytics = null;
  }
}
export { analytics };

export default app;
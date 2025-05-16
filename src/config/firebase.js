// Firebase configuration for authentication
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
// Replace with your actual Firebase config when implementing
const firebaseConfig = {
  apiKey: "AIzaSyDHjkB9XX8tHc1GSeYofMgg9ckqeMtgZmg",
  authDomain: "leadlines-portal.firebaseapp.com",
  projectId: "leadlines-portal",
  storageBucket: "leadlines-portal.firebasestorage.app",
  messagingSenderId: "966858129098",
  appId: "1:966858129098:web:96ee31a034cccb1a8bbe33",
  measurementId: "G-05EYVQS5E8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics }; 
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBa5hsgwMhsOgCQcjrl5w5tcgjqY1v56lE",
  authDomain: "food-delivery--app-6358b.firebaseapp.com",
  projectId: "food-delivery--app-6358b",
  storageBucket: "food-delivery--app-6358b.firebasestorage.app",
  messagingSenderId: "1036835573933",
  appId: "1:1036835573933:web:c98fec89db666aaa45b624",
  measurementId: "G-7W5ZMQSPK2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;

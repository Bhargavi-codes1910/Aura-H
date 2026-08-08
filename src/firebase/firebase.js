import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKoUhR6a6FQlHZMZgzJH0e0XzYFtIsjqc",
  authDomain: "aura-h1010.firebaseapp.com",
  projectId: "aura-h1010",
  storageBucket: "aura-h1010.firebasestorage.app",
  messagingSenderId: "661984337930",
  appId: "1:661984337930:web:d8b896f3d90af1bf18fff3",
  measurementId: "G-MQPP1NEPK3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
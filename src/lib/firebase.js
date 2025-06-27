import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDridMNZ30H1xBskl_8pGlN0GUmM2EqDQk",
  authDomain: "waitnomore-9a5f0.firebaseapp.com",
  projectId: "waitnomore-9a5f0",
  storageBucket: "waitnomore-9a5f0.firebasestorage.app",
  messagingSenderId: "77221992789",
  appId: "1:77221992789:web:fa8bf3eb308b27fe8677dc",
  measurementId: "G-Y68GN4LFCG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQFjkHAmxP0pwxKFdqoKnD1d5UqC1kymU",
  authDomain: "cartera-aseguradoras.firebaseapp.com",
  projectId: "cartera-aseguradoras",
  storageBucket: "cartera-aseguradoras.appspot.com",
  messagingSenderId: "659340338485",
  appId: "1:659340338485:web:2f4d8969abf50d959dd87c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔥 FIRESTORE OFFLINE REAL
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

export { auth, db };
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZnDe159gDCrauoqZSvyRKKUkhpW7LQdU",
  authDomain: "diversioninfinita-11d1d.firebaseapp.com",
  projectId: "diversioninfinita-11d1d",
  storageBucket: "diversioninfinita-11d1d.appspot.com",
  messagingSenderId: "156979414149",
  appId: "1:156979414149:web:196d0e28f123a9a517d5ec",
  measurementId: "G-MF8W741ECL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

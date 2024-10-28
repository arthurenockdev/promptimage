// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAjUGhab8UYP-p-FS8cQOewiDCrkW0nibg",
  authDomain: "promptimage-44ead.firebaseapp.com",
  projectId: "promptimage-44ead",
  storageBucket: "promptimage-44ead.appspot.com",
  messagingSenderId: "708595459367",
  appId: "1:708595459367:web:734ca811348c96b2913502",
  measurementId: "G-H32XTXRD4Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth= getAuth(app);
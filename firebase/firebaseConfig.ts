// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBMfv3xTvg0wf-npRsHSj0XOk4TnIshpB4",
  authDomain: "voluntech-18f11.firebaseapp.com",
  projectId: "voluntech-18f11",
  storageBucket: "voluntech-18f11.appspot.com",
  messagingSenderId: "217499561785",
  appId: "1:217499561785:web:9064e41f89bd73093fc2e8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
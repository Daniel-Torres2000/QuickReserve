// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4HkyxEYHfQa5wBskh1FnBzsseZOzLeqs",
  authDomain: "quickreserve2025.firebaseapp.com",
  projectId: "quickreserve2025",
  storageBucket: "quickreserve2025.firebasestorage.app",
  messagingSenderId: "246484256447",
  appId: "1:246484256447:web:f064a2cdf8c459c54e680a"
};

// Initialize Firebase
const appFireBase = initializeApp(firebaseConfig);
export default appFireBase;
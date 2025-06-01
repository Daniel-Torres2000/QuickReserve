// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Tu configuración Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD4HkyxEYHfQa5wBskh1FnBzsseZOzLeqs",
  authDomain: "quickreserve2025.firebaseapp.com",
  projectId: "quickreserve2025",
  storageBucket: "quickreserve2025.firebasestorage.app",
  messagingSenderId: "246484256447",
  appId: "1:246484256447:web:f064a2cdf8c459c54e680a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth
const auth = getAuth(app);

// Inicializar Firestore
const db = getFirestore(app);

// Exportar auth y db para usar en otros archivos
export { auth, db };
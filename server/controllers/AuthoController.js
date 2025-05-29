const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { firebaseApp } = require('../firebase');

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Crear el usuario en Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Guardar datos adicionales en Firestore
    await setDoc(doc(db, 'usuarios', user.uid), {
      name,
      email,
      role,
      uid: user.uid
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', uid: user.uid });
  } catch (error) {
    console.error('Error en el registro:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser };

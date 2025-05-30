// server/controllers/AuthController.js
const { admin, db } = require('../firebase/firebaseAdmin');

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Crear el usuario con Firebase Admin
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Guardar datos adicionales en Firestore
    await db.collection('usuarios').doc(userRecord.uid).set({
      name,
      email,
      role,
      uid: userRecord.uid,
    });

    res.status(201).json({ message: 'Usuario registrado exitosamente', uid: userRecord.uid });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { registerUser };

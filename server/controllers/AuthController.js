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

//loginUser
const loginUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const idToken = authHeader.split(' ')[1];

  try {
    // Verificar el token enviado desde el frontend
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Obtener datos del usuario desde Firestore
    const userDoc = await db.collection('usuarios').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado en Firestore' });
    }

    const userData = userDoc.data();

    res.status(200).json({
      uid,
      email: decodedToken.email,
      role: userData.role,
      name: userData.name,
    });

  } catch (error) {
    console.error('Error al verificar token:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = { 
  registerUser,
  loginUser,
};

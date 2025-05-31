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
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const idToken = authHeader.split(' ')[1];

    // Verificar token con Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Intentar obtener datos de Firestore
    try {
      const userDoc = await db.collection('usuarios').doc(uid).get();

      if (!userDoc.exists) {
        console.log('Usuario no encontrado en Firestore, creando registro...');
        
        // Crear usuario en Firestore si no existe
        await db.collection('usuarios').doc(uid).set({
          email: decodedToken.email,
          name: decodedToken.name || 'Usuario',
          role: 'user',
          createdAt: new Date(),
          uid: uid
        });

        return res.status(200).json({
          success: true,
          uid,
          email: decodedToken.email,
          name: decodedToken.name || 'Usuario',
          role: 'user',
        });
      }

      const userData = userDoc.data();

      res.status(200).json({
        success: true,
        uid,
        email: decodedToken.email,
        name: userData.name,
        role: userData.role,
      });

    } catch (firestoreError) {
      console.error('Error de Firestore:', firestoreError);
      
      // Fallback: usar datos del token
      res.status(200).json({
        success: true,
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || 'Usuario',
        role: 'user',
        warning: 'Login exitoso, pero sin acceso a Firestore'
      });
    }

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { 
  registerUser,
  loginUser,
};

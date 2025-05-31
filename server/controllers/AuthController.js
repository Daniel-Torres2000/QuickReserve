// server/controllers/AuthController.js
const { admin, db } = require('../firebase/firebaseAdmin');
const { sendWelcomeEmail } = require('../emailService'); // Importar el servicio de email

const registerUser = async (req, res) => {
  // Extraer datos del body - usando los nombres correctos que envía el frontend
  const { nombre, apellido, email, telefono, role } = req.body;
  
  // Crear nombre completo
  const name = `${nombre} ${apellido}`;
  
  // Debug: Ver exactamente qué llega del frontend
  console.log('📦 Datos recibidos del frontend:');
  console.log('req.body completo:', JSON.stringify(req.body, null, 2));

  try {
    console.log('📝 Iniciando registro para:', email);

    // Validaciones básicas
    console.log('🔍 Validando datos recibidos...');
    console.log('nombre:', nombre);
    console.log('apellido:', apellido);
    console.log('name (completo):', name);
    console.log('email:', email); 
    console.log('telefono:', telefono);
    console.log('role:', role);

    if (!nombre || !apellido || !email || !telefono) {
      console.log('❌ Faltan campos requeridos');
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Validar formato de email
    console.log('🔍 Validando formato de email...');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Formato de email inválido');
      return res.status(400).json({ 
        error: 'Formato de email inválido' 
      });
    }
    console.log('✅ Email válido');

    // Generar contraseña temporal (para el correo)
    const generateTempPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const tempPassword = generateTempPassword();
    console.log('🔑 Contraseña temporal generada para correo');

    // Crear el usuario con Firebase Admin
    console.log('🔍 Intentando crear usuario en Firebase Auth...');
    const userRecord = await admin.auth().createUser({
      email,
      // No podemos crear usuario sin password, así que generamos una temporal
      password: tempPassword, // Usar la contraseña temporal generada
      displayName: name,
    });

    console.log('✅ Usuario creado en Firebase Auth:', userRecord.uid);

    // Guardar datos adicionales en Firestore
    console.log('🔍 Guardando datos en Firestore...');
    await db.collection('usuarios').doc(userRecord.uid).set({
      nombre,
      apellido, 
      name, // nombre completo
      email,
      telefono,
      role: role || 'padre',
      uid: userRecord.uid,
      tempPassword, // Guardar la contraseña temporal
      mustChangePassword: true, // Usuario debe cambiar contraseña en primer login
      createdAt: new Date(),
      isActive: true
    });

    console.log('✅ Datos guardados en Firestore');

    // Enviar correo de bienvenida automáticamente
    console.log('📧 Enviando correo de bienvenida...');
    
    try {
      const emailResult = await sendWelcomeEmail({
        email,
        name,
        role: role || 'padre',
        tempPassword // Enviar la contraseña temporal para el correo (solo informativo)
      });

      if (emailResult.success) {
        console.log('✅ Correo de bienvenida enviado exitosamente');
      } else {
        console.error('⚠️ Error al enviar correo (pero usuario ya creado):', emailResult.error);
      }
    } catch (emailError) {
      console.error('⚠️ Error al enviar correo (pero usuario ya creado):', emailError.message);
      // No fallar el registro si el correo falla
    }

    // Respuesta exitosa
    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      name: name,
      email: email,
      role: role || 'padre',
      uid: userRecord.uid,
      emailSent: true
    });

  } catch (error) {
    console.error('❌ Error en el registro:', error);
    
    // Manejar errores específicos de Firebase
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ 
        error: 'El correo electrónico ya está registrado' 
      });
    }
    
    if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ 
        error: 'El formato del correo electrónico es inválido' 
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
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
          role: 'padre',
          createdAt: new Date(),
          uid: uid
        });

        return res.status(200).json({
          success: true,
          uid,
          email: decodedToken.email,
          name: decodedToken.name || 'Usuario',
          role: 'padre',
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
        role: 'padre',
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
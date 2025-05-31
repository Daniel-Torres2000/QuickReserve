require('dotenv').config();
// server/index.js

// TEMPORAL - Debug credenciales
console.log('=== DEBUG CREDENCIALES ===');
console.log('EMAIL_SERVICE:', `"${process.env.EMAIL_SERVICE}"`);
console.log('EMAIL_USER:', `"${process.env.EMAIL_USER}"`);
console.log('EMAIL_PASSWORD:', `"${process.env.EMAIL_PASSWORD}"`);
console.log('Longitud password:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);
console.log('==========================');
// TEMPORAL - Debug credenciales

// Importar el servicio de email
const { sendWelcomeEmail, testEmailConnection } = require('./emailService')

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const AuthRoutes = require('./routes/AuthRoutes');
const morgan = require('morgan');

// Firebase Admin SDK
const { admin, db } = require('./firebase/firebaseAdmin');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', AuthRoutes);
app.use(morgan('dev'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor corriendo correctamente');
});

// Aquí rutas de registro, login, etc.
// Por ejemplo: app.use('/api/users', require('./routes/userRoutes'));

// Iniciar servidor

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// ===== ENDPOINT PARA ENVIAR CORREO DE BIENVENIDA =====
app.post('/api/auth/send-welcome-email', async (req, res) => {
  try {
    const { email, name, role, tempPassword } = req.body;

    // Validar que lleguen todos los datos necesarios
    if (!email || !name || !role || !tempPassword) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos: email, name, role, tempPassword' 
      });
    }

    console.log(`📧 Enviando correo de bienvenida a: ${email}`);

    // Enviar correo usando el servicio
    const result = await sendWelcomeEmail({
      email,
      name,
      role,
      tempPassword
    });

    if (result.success) {
      console.log(`✅ Correo enviado exitosamente a: ${email}`);
      res.json({ 
        message: 'Correo de bienvenida enviado exitosamente',
        email: email 
      });
    } else {
      console.error(`❌ Error al enviar correo a ${email}:`, result.error);
      res.status(500).json({ 
        error: 'Error al enviar correo de bienvenida',
        details: result.error 
      });
    }

  } catch (error) {
    console.error('❌ Error en endpoint de correo:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al enviar correo',
      details: error.message 
    });
  }
});

// ===== ENDPOINT PARA PROBAR LA CONFIGURACIÓN DE CORREO =====
app.get('/api/auth/test-email', async (req, res) => {
  try {
    console.log('🔧 Probando configuración de correo...');
    
    const isConfigured = await testEmailConnection();
    
    if (isConfigured) {
      console.log('✅ Configuración de correo OK');
      res.json({ 
        message: 'Configuración de correo verificada correctamente',
        emailUser: process.env.EMAIL_USER 
      });
    } else {
      console.log('❌ Error en configuración de correo');
      res.status(500).json({ 
        error: 'Error en configuración de correo' 
      });
    }
  } catch (error) {
    console.error('❌ Error al probar correo:', error);
    res.status(500).json({ 
      error: 'Error al verificar configuración de correo',
      details: error.message 
    });
  }
});

// ===== ENDPOINT PARA PROBAR FIREBASE =====
app.get('/api/auth/test-firebase', async (req, res) => {
  try {
    console.log('🔧 Probando Firebase Auth...');
    
    // Prueba 1: Verificar conexión básica
    const app = admin.app();
    console.log('✅ Firebase app inicializada:', app.name);
    
    // Prueba 2: Intentar listar usuarios (máximo 1 para no saturar)
    const listUsersResult = await admin.auth().listUsers(1);
    console.log('✅ Firebase Auth funciona, usuarios encontrados:', listUsersResult.users.length);
    
    // Prueba 3: Verificar Firestore
    const testDoc = await db.collection('test').limit(1).get();
    console.log('✅ Firestore funciona, documentos de prueba:', testDoc.size);
    
    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Firebase configurado correctamente',
      details: {
        authUsers: listUsersResult.users.length,
        firestoreConnected: true,
        projectId: app.options.projectId
      }
    });
    
  } catch (error) {
    console.error('❌ Error en Firebase:', error);
    
    // Analizar el tipo de error
    let errorType = 'Desconocido';
    let solution = '';
    
    if (error.code === 'auth/project-not-found') {
      errorType = 'Proyecto no encontrado';
      solution = 'Verifica que el project_id en serviceAccountKey.json sea correcto';
    } else if (error.code === 'auth/invalid-credential') {
      errorType = 'Credenciales inválidas';
      solution = 'El serviceAccountKey.json puede estar corrupto o mal configurado';
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      errorType = 'Error de conexión';
      solution = 'Problema de internet o firewall bloqueando Firebase';
    } else if (error.message.includes('permission')) {
      errorType = 'Permisos insuficientes';
      solution = 'El service account no tiene los permisos necesarios';
    }
    
    res.status(500).json({
      success: false,
      error: 'Error en Firebase',
      errorType: errorType,
      solution: solution,
      details: error.message,
      code: error.code || 'Sin código'
    });
  }
});

// ===== ENDPOINT PARA PROBAR TOKEN ESPECÍFICO =====
app.post('/api/auth/test-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token requerido en el body' });
    }
    
    console.log('🔧 Verificando token...');
    
    // Verificar el token con Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    console.log('✅ Token válido para usuario:', decodedToken.email);
    
    res.json({
      success: true,
      message: 'Token verificado correctamente',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified
      }
    });
    
  } catch (error) {
    console.error('❌ Error al verificar token:', error);
    
    res.status(401).json({
      success: false,
      error: 'Token inválido',
      details: error.message,
      code: error.code
    });
  }
});
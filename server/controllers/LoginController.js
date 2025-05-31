const admin = require('firebase-admin');

/**
 * Inicia sesión con correo y contraseña.
 * Solo verifica si el usuario existe en Firebase Auth.
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Firebase Admin NO permite autenticar con contraseña directamente (solo verificación).
    // Así que aquí normalmente solo usarás Firebase Auth en el frontend para login.
    return res.status(501).json({ error: 'El login se maneja desde el frontend con Firebase Auth.' });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error en el login' });
  }
};

module.exports = { loginUser };

// server/index.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const AuthRoutes = require('./routes/AuthRoutes');
const morgan = require('morgan');

// Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./firebase/serviceAccountKey.json');

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

// server/index.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;
const AuthoRoutes = require('./routes/AuthoRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', AuthoRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor corriendo correctamente');
});

// Aquí rutas de registro, login, etc.
// Por ejemplo: app.use('/api/users', require('./routes/userRoutes'));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

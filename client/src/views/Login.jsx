import React, { useState } from 'react';
import axios from 'axios'; // importar axios
import '../css/Login.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // 1. Autenticarse con Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const token = await userCredential.user.getIdToken();

      // 2. Enviar token al backend para obtener los datos del usuario
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const userData = response.data;

      // 3. Mostrar mensaje o redirigir según el rol
      console.log('Usuario autenticado con éxito:', userData);
      setMessage(`Bienvenido, ${userData.name} (${userData.role})`);

      // (Opcional) Guardar token en localStorage si marcó "Recuérdame"
      if (formData.remember) {
        localStorage.setItem('token', token);
      }

      // (Opcional) Redirigir según el rol
      // window.location.href = `/dashboard/${userData.role}`;

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      console.log(error.response);
      setError('Correo o contraseña incorrectos o usuario no registrado');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Iniciar Sesión</h2>

        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="login-input"
          placeholder="Correo electrónico"
          required
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="login-input"
          placeholder="Contraseña"
          required
        />

        <label className="login-checkbox">
          <input
            type="checkbox"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
          />
          Recuérdame
        </label>

        <button type="submit" className="login-button">Ingresar</button>

        <p className="login-footer">
          ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </form>
    </div>
  );
}

export default Login;

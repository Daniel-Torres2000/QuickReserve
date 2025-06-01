import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Login.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

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

      // 3. Guardar datos del usuario y token
      login(userData, token, formData.remember);

      console.log('Usuario autenticado con éxito:', userData);

      // 4. Redirigir según el rol después de un breve delay
      setTimeout(() => {
        if (userData.role === 'docente') {
          navigate('/dashboard-docente');
        } else if (userData.role === 'padre') {
          navigate('/dashboard-padre');
        } else if (userData.role === 'admin') {
          navigate('/dashboard-administrador');
        } else {
          navigate('/dashboard');
        }
      }, 1000);

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Correo o contraseña incorrectos o usuario no registrado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Iniciar Sesión</h2>

        {message && <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{message}</p>}
        {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="login-input"
          placeholder="Correo electrónico"
          required
          disabled={loading}
        />

        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="login-input"
          placeholder="Contraseña"
          required
          disabled={loading}
        />

        <label className="login-checkbox">
          <input
            type="checkbox"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
            disabled={loading}
          />
          Recuérdame
        </label>

        <button 
          type="submit" 
          className="login-button"
          disabled={loading}
        >
          {loading ? 'Iniciando sesión...' : 'Ingresar'}
        </button>

        <p className="login-footer">
          ¿No tienes una cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
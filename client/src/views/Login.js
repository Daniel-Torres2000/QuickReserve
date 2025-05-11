import React, { useState } from 'react';
import '../css/Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del login:', formData);
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Iniciar Sesión</h2>

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

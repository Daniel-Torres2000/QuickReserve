import React, { useState } from 'react';
import '../css/Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'asistente',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    console.log('Datos enviados:', formData);
  };

  return (
    <div className="bg-register">
      <form
        onSubmit={handleSubmit}
        className="register-form"
      >
        <h2 className="register-title">
          Formulario de Registro
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={handleChange}
          className="register-input"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          className="register-input"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          className="register-input"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="register-input"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="register-input"
        >
          <option value="asistente">Asistente</option>
          <option value="docente">Docente</option>
          <option value="coordinador">Coordinador</option>
          <option value="padre">Padre de Familia</option>
        </select>

        <button
          type="submit"
          className="register-button"
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}

export default Register;

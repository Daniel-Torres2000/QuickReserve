import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    role: 'padre',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) setError('');
  };

  // Función para limpiar el formulario
  const clearForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      role: 'padre',
    });
  };

  // Validar formato de teléfono guatemalteco
  const validatePhone = (phone) => {
    // Patrones válidos para Guatemala: +502 XXXX-XXXX, 502 XXXX-XXXX, XXXX-XXXX
    const patterns = [
      /^\+502\s\d{4}-\d{4}$/,  // +502 1234-5678
      /^502\s\d{4}-\d{4}$/,    // 502 1234-5678
      /^\d{4}-\d{4}$/,         // 1234-5678
      /^\d{8}$/                // 12345678
    ];
    
    return patterns.some(pattern => pattern.test(phone.trim()));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      setLoading(false);
      return;
    }

    if (!formData.apellido.trim()) {
      setError('El apellido es requerido');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      setLoading(false);
      return;
    }

    if (!formData.telefono.trim()) {
      setError('El teléfono es requerido');
      setLoading(false);
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('El formato del correo electrónico no es válido');
      setLoading(false);
      return;
    }

    // Validar formato de teléfono
    if (!validatePhone(formData.telefono)) {
      setError('Formato de teléfono inválido. Use: +502 1234-5678, 502 1234-5678, 1234-5678 o 12345678');
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Enviando datos al servidor:', formData);

      // Registrar usuario (el backend se encarga del correo automáticamente)
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('📋 Respuesta del servidor:', data);

      if (response.ok) {
        // Limpiar formulario
        clearForm();

        // Mostrar mensaje de éxito
        setSuccessMessage(
          `¡Bienvenido/a ${data.name}! Tu cuenta ha sido creada exitosamente. 
          
            Hemos enviado un correo electrónico a: ${data.email}
          
          Revisa tu bandeja de entrada (y la carpeta de spam)`
        );

        // ❌ ELIMINADO: setTimeout para redirección automática

      } else {
        // Manejar errores específicos del servidor
        if (data.error) {
          setError(data.error);
        } else {
          setError(data.message || 'No se pudo registrar el usuario');
        }
      }
    } catch (error) {
      console.error('❌ Error al enviar el formulario:', error);
      setError('Hubo un error en el servidor. Por favor, verifica tu conexión e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-register">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="register-title">Formulario de Registro</h2>
        <p className="register-subtitle">
          Para padres de familia de la institución educativa
        </p>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>¡Registro Exitoso!</h3>
            <p>{successMessage}</p>
            
            <button 
              onClick={() => navigate('/login')}
              className="goto-login-button"
            >
              Continuar al Login
            </button>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="error-message">
            <div className="error-icon">❌</div>
            <p>{error}</p>
          </div>
        )}

        {/* Solo mostrar formulario si no hay mensaje de éxito */}
        {!successMessage && (
          <>
            <div className="input-row">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre *"
                value={formData.nombre}
                onChange={handleChange}
                className="register-input half-width"
                required
                disabled={loading}
              />

              <input
                type="text"
                name="apellido"
                placeholder="Apellido *"
                value={formData.apellido}
                onChange={handleChange}
                className="register-input half-width"
                required
                disabled={loading}
              />
            </div>

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico *"
              value={formData.email}
              onChange={handleChange}
              className="register-input"
              required
              disabled={loading}
            />

            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono (ej: +502 1234-5678) *"
              value={formData.telefono}
              onChange={handleChange}
              className="register-input"
              required
              disabled={loading}
            />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="register-input"
              disabled={loading}
            >
              <option value="padre">Padre de Familia</option>
            </select>

            <div className="info-box">
              <p>
                <strong>Verifica el acceso a tu correo electrónico</strong><br/>
                Al finalizar el formulario, se enviará un correo electrónico con tus credenciales de inicio de sesión.
              </p>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Registrando...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>

            <p className="register-footer">
              ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
            </p>

            <p className="register-note">
              QuickReserve - Sistema de Gestión Escolar
            </p>
          </>
        )}
      </form>
    </div>
  );
}

export default Register;
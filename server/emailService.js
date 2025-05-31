// emailService.js
const nodemailer = require('nodemailer');

// Configurar el transporter con las variables de entorno
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // 'gmail'
  auth: {
    user: process.env.EMAIL_USER,     // 'notificacionesquickreserve@gmail.com'
    pass: process.env.EMAIL_PASSWORD  // Tu contraseña de aplicación
  }
});

// Función para enviar correo de bienvenida
const sendWelcomeEmail = async (emailData) => {
  const { email, name, role, tempPassword } = emailData;

  // Template HTML del correo
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bienvenido a QuickReserve</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          background-color: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #d93025, #b3201a);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .welcome-text {
          font-size: 18px;
          margin-bottom: 20px;
          color: #444;
        }
        .credentials-box {
          background: linear-gradient(135deg, #f5f5f5, #e0e0e0);
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
        }
        .credentials-title {
          color: #d93025;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .credential-item {
          margin: 12px 0;
          padding: 10px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #d93025;
        }
        .credential-label {
          font-weight: 600;
          color: #444;
          display: inline-block;
          min-width: 100px;
        }
        .credential-value {
          color: #666;
        }
        .password-note {
          font-size: 14px;
          color: #666;
          font-style: italic;
          margin-top: 5px;
        }
        .steps-section {
          margin: 25px 0;
        }
        .steps-title {
          color: #d93025;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .steps-list {
          list-style: none;
          padding: 0;
        }
        .steps-list li {
          padding: 8px 0;
          color: #444;
          position: relative;
          padding-left: 25px;
        }
        .steps-list li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #d93025;
          font-weight: bold;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .access-button {
          display: inline-block;
          background: linear-gradient(135deg, #d93025, #b3201a);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: transform 0.3s;
        }
        .access-button:hover {
          transform: translateY(-2px);
        }
        .help-section {
          background: #f9fafb;
          border-radius: 12px;
          padding: 20px;
          margin: 25px 0;
        }
        .help-title {
          color: #d93025;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .help-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .help-list li {
          color: #666;
          margin: 5px 0;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Bienvenido/a a QuickReserve!</h1>
          <p>Tu cuenta ha sido creada exitosamente</p>
        </div>
        
        <div class="content">
          <div class="welcome-text">
            <strong>Hola ${name},</strong><br>
            ¡Gracias por unirte a QuickReserve! Tu cuenta como <strong>${role === 'docente' ? 'Docente' : 'Padre de Familia'}</strong> ha sido creada correctamente.
          </div>
          
          <div class="credentials-box">
            <div class="credentials-title">📋 Información de tu cuenta</div>
            
            <div class="credential-item">
              <span class="credential-label">Nombre:</span>
              <span class="credential-value">${name}</span>
            </div>
            
            <div class="credential-item">
              <span class="credential-label">Email:</span>
              <span class="credential-value">${email}</span>
            </div>
            
            <div class="credential-item">
              <span class="credential-label">Rol:</span>
              <span class="credential-value">${role === 'docente' ? 'Docente' : 'Padre de Familia'}</span>
            </div>
            
            <div class="credential-item">
              <span class="credential-label">Contraseña:</span>
              <span class="credential-value">${tempPassword}</span>
              <div class="password-note">Te recomendamos cambiar tu contraseña después del primer inicio de sesión</div>
            </div>
          </div>
          
          <div class="steps-section">
            <div class="steps-title">🚀 Primeros pasos</div>
            <ul class="steps-list">
              ${role === 'docente' ? `
                <li>Accede a tu dashboard para gestionar citas con padres de familia</li>
                <li>Configura tu horario de disponibilidad</li>
                <li>Revisa y actualiza tu perfil</li>
                <li>Programa tus primeras citas</li>
              ` : `
                <li>Accede a tu dashboard para solicitar citas con docentes</li>
                <li>Completa el perfil de tus hijos</li>
                <li>Explora los horarios disponibles de los docentes</li>
                <li>Programa tu primera cita</li>
              `}
            </ul>
          </div>
          
          <div class="button-container">
            <a href="${process.env.FRONTEND_URL}/login" class="access-button">
              Acceder a la Plataforma
            </a>
          </div>
          
          <div class="help-section">
            <div class="help-title">📞 ¿Necesitas ayuda?</div>
            <p>Si tienes alguna pregunta o necesitas asistencia, contáctanos:</p>
            <ul class="help-list">
              <li>📧 Email: soporte@quickreserve.com</li>
              <li>📱 Teléfono: +502 1234-5678</li>
              <li>🕐 Horario: Lunes a Viernes, 8:00 AM - 5:00 PM</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Este correo fue enviado automáticamente por QuickReserve</p>
          <p>© ${new Date().getFullYear()} QuickReserve - Plataforma de Gestión de Citas Educativas</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Configuración del correo
  const mailOptions = {
    from: {
      name: 'QuickReserve',
      address: process.env.EMAIL_USER
    },
    to: email,
    subject: `¡Bienvenido/a a QuickReserve, ${name}!`,
    html: htmlTemplate,
    text: `
      ¡Hola ${name}!
      
      ¡Bienvenido/a a QuickReserve! Tu cuenta como ${role === 'docente' ? 'Docente' : 'Padre de Familia'} ha sido creada exitosamente.
      
      Información de tu cuenta:
      - Nombre: ${name}
      - Email: ${email}
      - Rol: ${role === 'docente' ? 'Docente' : 'Padre de Familia'}
      - Contraseña: ${tempPassword}
      
      Puedes acceder a la plataforma en: ${process.env.FRONTEND_URL}/login
      
      ¡Gracias por unirte a QuickReserve!
      
      Equipo de QuickReserve
    `
  };

  try {
    // Enviar el correo
    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo de bienvenida enviado a: ${email}`);
    return { success: true, message: 'Correo enviado exitosamente' };
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    return { success: false, error: error.message };
  }
};

// Función para verificar la configuración del correo
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Configuración de correo verificada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en configuración de correo:', error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  testEmailConnection
};
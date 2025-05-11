import React from 'react';
import './Features.css';

function Features() {
  return (
    <section className="features">
      <div className="features-container">
        <div className="feature-box">
          <h3>Programación Sencilla</h3>
          <p>Agenda citas con profesores o padres en pocos clics. Nuestro sistema muestra disponibilidad en tiempo real y envía recordatorios automáticos.</p>
        </div>
        <div className="feature-box">
          <h3>Seguimiento Académico</h3>
          <p>Accede a informes de progreso, calificaciones y observaciones. Mantente al día con el desempeño académico y conductual.</p>
        </div>
        <div className="feature-box">
          <h3>Comunicación Efectiva</h3>
          <p>Chatea directamente con profesores o padres, comparte documentos y establece objetivos claros para el desarrollo estudiantil.</p>
        </div>
      </div>
    </section>
  );
}

export default Features;
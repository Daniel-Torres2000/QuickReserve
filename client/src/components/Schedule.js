import React from 'react';
import './Schedule.css';

function Schedule() {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const hours = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

  return (
    <section className="schedule">
      <h2>Agenda una nueva cita</h2>
      <div className="time-grid">
        {/* Encabezados: días (sin "Hora") */}
        {days.map((day, index) => (
          <div key={index} className="day">{day}</div>
        ))}

        {/* Filas de horas (cada celda con su hora) */}
        {hours.map((hour, i) => (
          <React.Fragment key={`row-${i}`}>
            {days.map((_, j) => (
              <div key={`slot-${i}-${j}`} className="time-slot">{hour}</div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

export default Schedule;

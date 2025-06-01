import React, { useState } from 'react';
import '../css/DashboardDocente.css';
import { useAuth } from '../context/AuthContext'; // ← IMPORTAR CONTEXTO
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function DashboardDocente() {
  const [activeSection, setActiveSection] = useState('calendario');
  
  // 🔥 OBTENER DATOS REALES DEL USUARIO
  const { user, logout } = useAuth();
  
  // 🔄 REEMPLAZAR useState hardcodeado por datos dinámicos
  const docenteData = {
    name: user?.name || 'Docente',
    email: user?.email || '',
    subject: user?.materia || user?.subject || 'Materia no asignada',
    grade: user?.grado || user?.grade || 'Grado no asignado',
    phone: user?.telefono || user?.phone || 'No disponible',
    schedule: user?.horario || {
      lunes: '8:00 - 16:00',
      martes: '8:00 - 16:00',
      miercoles: '8:00 - 14:00',
      jueves: '8:00 - 16:00',
      viernes: '8:00 - 12:00'
    }
  };

  const [citasSemana, setCitasSemana] = useState([
    {
      id: 1,
      padre: 'María González',
      estudiante: 'Pedro González',
      dia: 'lunes',
      fecha: '2025-06-02',
      hora: '10:00',
      estado: 'Confirmada',
      motivo: 'Revisión de calificaciones'
    },
    {
      id: 2,
      padre: 'Carlos Rodríguez',
      estudiante: 'Ana Rodríguez',
      dia: 'miercoles',
      fecha: '2025-06-04',
      hora: '14:30',
      estado: 'Confirmada',
      motivo: 'Comportamiento en clase'
    },
    {
      id: 3,
      padre: 'Laura Martínez',
      estudiante: 'Luis Martínez',
      dia: 'viernes',
      fecha: '2025-06-06',
      hora: '11:00',
      estado: 'Pendiente',
      motivo: 'Apoyo académico'
    }
  ]);

  const [historialCitas] = useState([
    {
      id: 4,
      padre: 'Ana López',
      estudiante: 'María López',
      fecha: '2025-05-28',
      hora: '09:30',
      estado: 'Completada',
      motivo: 'Seguimiento académico',
      notas: 'Estudiante muestra mejora en matemáticas'
    },
    {
      id: 5,
      padre: 'Roberto Silva',
      estudiante: 'Diego Silva',
      fecha: '2025-05-25',
      hora: '15:00',
      estado: 'Completada',
      motivo: 'Reunión de padres',
      notas: 'Se acordaron estrategias de estudio en casa'
    }
  ]);

  const [showNewCitaModal, setShowNewCitaModal] = useState(false);
  const [newCita, setNewCita] = useState({
    padre: '',
    estudiante: '',
    fecha: '',
    hora: '',
    motivo: ''
  });

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

  // 🔥 FUNCIÓN DE LOGOUT ACTUALIZADA
  const handleLogout = async () => {
    try {
      await logout();
      // El contexto manejará la redirección automáticamente
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCita({ ...newCita, [name]: value });
  };

  const handleSubmitCita = (e) => {
    e.preventDefault();
    const fechaCita = new Date(newCita.fecha);
    const diasNombres = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const diaCita = diasNombres[fechaCita.getDay()];
    
    const nuevaCita = {
      id: citasSemana.length + historialCitas.length + 1,
      ...newCita,
      dia: diaCita,
      estado: 'Pendiente'
    };
    
    setCitasSemana([...citasSemana, nuevaCita]);
    setNewCita({ padre: '', estudiante: '', fecha: '', hora: '', motivo: '' });
    setShowNewCitaModal(false);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCitasPorDia = (dia) => {
    return citasSemana.filter(cita => cita.dia === dia);
  };

  const renderCalendarioSemanal = () => (
    <div className="calendario-section">
      <div className="section-header">
        <h2 className="section-title">Calendario Semanal</h2>
        <button 
          className="new-cita-button"
          onClick={() => setShowNewCitaModal(true)}
        >
          + Nueva Cita
        </button>
      </div>
      
      <div className="calendario-grid">
        {diasSemana.map(dia => (
          <div key={dia} className="dia-card">
            <div className="dia-header">
              <h3 className="dia-nombre">{dia.charAt(0).toUpperCase() + dia.slice(1)}</h3>
              <span className="citas-count">{getCitasPorDia(dia).length} citas</span>
            </div>
            
            <div className="citas-dia">
              {getCitasPorDia(dia).length > 0 ? (
                getCitasPorDia(dia).map(cita => (
                  <div key={cita.id} className="cita-mini">
                    <div className="cita-time">{cita.hora}</div>
                    <div className="cita-info">
                      <div className="cita-padre-mini">{cita.padre}</div>
                      <div className="cita-motivo-mini">{cita.motivo}</div>
                      <span className={`status-mini ${cita.estado.toLowerCase()}`}>
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-citas">Sin citas programadas</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div className="perfil-section">
      <h2 className="section-title">Mi Perfil</h2>
      
      <div className="perfil-content">
        <div className="perfil-card">
          <div className="perfil-header">
            <div className="avatar-section">
              <div className="avatar">{docenteData.name.split(' ').map(n => n[0]).join('')}</div>
              <div className="perfil-info">
                <h3 className="perfil-name">{docenteData.name}</h3>
                <p className="perfil-role">{docenteData.subject} - {docenteData.grade}</p>
              </div>
            </div>
          </div>
          
          <div className="perfil-details">
            <div className="detail-group">
              <label className="detail-label">Email:</label>
              <span className="detail-value">{docenteData.email}</span>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">Teléfono:</label>
              <span className="detail-value">{docenteData.phone}</span>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">Materia:</label>
              <span className="detail-value">{docenteData.subject}</span>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">Grado:</label>
              <span className="detail-value">{docenteData.grade}</span>
            </div>
          </div>
          
          <button className="edit-profile-button">Editar Perfil</button>
        </div>
      </div>
    </div>
  );

  const renderHorarios = () => (
    <div className="horarios-section">
      <div className="section-header">
        <h2 className="section-title">Mi Horario</h2>
        <button className="edit-schedule-button">Modificar Horario</button>
      </div>
      
      <div className="horario-grid">
        {Object.entries(docenteData.schedule).map(([dia, horario]) => (
          <div key={dia} className="horario-card">
            <div className="horario-dia">{dia.charAt(0).toUpperCase() + dia.slice(1)}</div>
            <div className="horario-horas">{horario}</div>
          </div>
        ))}
      </div>
      
      <div className="disponibilidad-section">
        <h3 className="subsection-title">Horarios Disponibles para Citas</h3>
        <div className="disponibilidad-info">
          <p>Las citas pueden programarse durante los siguientes horarios:</p>
          <ul className="horarios-lista">
            <li>Lunes a Jueves: 9:00 AM - 3:00 PM</li>
            <li>Viernes: 9:00 AM - 11:00 AM</li>
            <li>Recesos: 10:30 AM - 11:00 AM y 2:00 PM - 2:30 PM</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderHistorial = () => (
    <div className="historial-section">
      <h2 className="section-title">Historial de Citas</h2>
      
      <div className="historial-filters">
        <select className="filter-select">
          <option>Todas las citas</option>
          <option>Completadas</option>
          <option>Canceladas</option>
        </select>
        <input type="date" className="filter-date" />
      </div>
      
      <div className="citas-list">
        {historialCitas.map(cita => (
          <div key={cita.id} className="cita-card historial">
            <div className="cita-header">
              <div className="cita-info">
                <h3 className="cita-padre">{cita.padre}</h3>
                <p className="cita-estudiante">Estudiante: {cita.estudiante}</p>
              </div>
              <span className={`status-badge ${cita.estado.toLowerCase()}`}>
                {cita.estado}
              </span>
            </div>
            
            <div className="cita-details">
              <div className="detail-row">
                <span className="detail-label">Fecha:</span>
                <span className="detail-value">{formatearFecha(cita.fecha)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Hora:</span>
                <span className="detail-value">{cita.hora}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Motivo:</span>
                <span className="detail-value">{cita.motivo}</span>
              </div>
              {cita.notas && (
                <div className="detail-row">
                  <span className="detail-label">Notas:</span>
                  <span className="detail-value">{cita.notas}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 🔍 VERIFICAR SI EL USUARIO ESTÁ CARGADO
  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Cargando información del docente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">QuickReserve</span>
          </div>
          <div className="user-info">
            <div className="user-avatar">{docenteData.name.split(' ').map(n => n[0]).join('')}</div>
            <div className="user-details">
              <span className="user-name">{docenteData.name}</span>
              <span className="user-role">Docente</span>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'calendario' ? 'active' : ''}`}
            onClick={() => setActiveSection('calendario')}
            data-tooltip="Calendario"
          >
            <CalendarIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Calendario</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'perfil' ? 'active' : ''}`}
            onClick={() => setActiveSection('perfil')}
            data-tooltip="Mi Perfil"
          >
            <UserIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Mi Perfil</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'horarios' ? 'active' : ''}`}
            onClick={() => setActiveSection('horarios')}
            data-tooltip="Horarios"
          >
            <ClockIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Horarios</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'historial' ? 'active' : ''}`}
            onClick={() => setActiveSection('historial')}
            data-tooltip="Historial"
          >
            <DocumentTextIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Historial</span>
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-button" data-tooltip="Cerrar Sesión" onClick={handleLogout}>
            <ArrowRightOnRectangleIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {activeSection === 'calendario' && renderCalendarioSemanal()}
          {activeSection === 'perfil' && renderPerfil()}
          {activeSection === 'horarios' && renderHorarios()}
          {activeSection === 'historial' && renderHistorial()}
        </div>
      </main>

      {/* Modal para nueva cita */}
      {showNewCitaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Programar Nueva Cita</h2>
              <button 
                className="close-button"
                onClick={() => setShowNewCitaModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitCita} className="cita-form">
              <div className="form-group">
                <label className="form-label">Nombre del Padre/Madre</label>
                <input
                  type="text"
                  name="padre"
                  value={newCita.padre}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre del Estudiante</label>
                <input
                  type="text"
                  name="estudiante"
                  value={newCita.estudiante}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={newCita.fecha}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <input
                    type="time"
                    name="hora"
                    value={newCita.hora}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Motivo de la Cita</label>
                <textarea
                  name="motivo"
                  value={newCita.motivo}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="3"
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowNewCitaModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                >
                  Programar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardDocente;
import React, { useState } from 'react';
import '../css/DashboardPadre.css';
import { useAuth } from '../context/AuthContext'; // ← IMPORTAR CONTEXTO
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function DashboardPadre() {
  const [activeSection, setActiveSection] = useState('citas');
  
  // 🔥 OBTENER DATOS REALES DEL USUARIO
  const { user, logout } = useAuth();
  
  // 🔄 REEMPLAZAR useState hardcodeado por datos dinámicos
  const padreData = {
    name: user?.name || 'Usuario',
    email: user?.email || '',
    phone: user?.telefono || user?.phone || 'No disponible',
    hijos: user?.hijos || [
      { id: 1, nombre: 'Sin hijos registrados', grado: '', docente: '' }
    ]
  };

  const [citasProgramadas, setCitasProgramadas] = useState([
    {
      id: 1,
      hijo: 'Pedro González',
      docente: 'Prof. Juan Pérez',
      materia: 'Matemáticas',
      fecha: '2025-06-02',
      hora: '10:00',
      estado: 'Confirmada',
      motivo: 'Revisión de calificaciones',
      ubicacion: 'Aula 205'
    },
    {
      id: 2,
      hijo: 'Ana González', 
      docente: 'Prof. María López',
      materia: 'Español',
      fecha: '2025-06-05',
      hora: '14:30',
      estado: 'Pendiente',
      motivo: 'Reunión académica',
      ubicacion: 'Aula 103'
    }
  ]);

  const [historialCitas] = useState([
    {
      id: 3,
      hijo: 'Pedro González',
      docente: 'Prof. Juan Pérez',
      materia: 'Matemáticas',
      fecha: '2025-05-28',
      hora: '09:30',
      estado: 'Completada',
      motivo: 'Seguimiento académico',
      notas: 'Pedro ha mostrado gran mejora en matemáticas. Se recomienda continuar con práctica adicional.',
      ubicacion: 'Aula 205'
    },
    {
      id: 4,
      hijo: 'Ana González',
      docente: 'Prof. María López', 
      materia: 'Español',
      fecha: '2025-05-25',
      hora: '15:00',
      estado: 'Completada',
      motivo: 'Consulta sobre lectura',
      notas: 'Ana necesita reforzar comprensión lectora. Se enviaron ejercicios para casa.',
      ubicacion: 'Aula 103'
    }
  ]);

  const [docentesDisponibles] = useState([
    {
      id: 1,
      nombre: 'Prof. Juan Pérez',
      materia: 'Matemáticas',
      grado: '5to Grado',
      horarios: ['9:00-12:00', '14:00-16:00'],
      disponible: true
    },
    {
      id: 2,
      nombre: 'Prof. María López',
      materia: 'Español', 
      grado: '3er Grado',
      horarios: ['8:00-11:00', '13:00-15:00'],
      disponible: true
    },
    {
      id: 3,
      nombre: 'Prof. Carlos Silva',
      materia: 'Ciencias',
      grado: '4to Grado', 
      horarios: ['10:00-12:00', '14:30-16:30'],
      disponible: false
    }
  ]);

  const [showNewCitaModal, setShowNewCitaModal] = useState(false);
  const [newCita, setNewCita] = useState({
    hijo: '',
    docente: '',
    fecha: '',
    hora: '',
    motivo: ''
  });

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
    
    const docenteSeleccionado = docentesDisponibles.find(d => d.id.toString() === newCita.docente);
    const hijoSeleccionado = padreData.hijos.find(h => h.id.toString() === newCita.hijo);
    
    const nuevaCita = {
      id: citasProgramadas.length + historialCitas.length + 1,
      hijo: hijoSeleccionado?.nombre || '',
      docente: docenteSeleccionado?.nombre || '',
      materia: docenteSeleccionado?.materia || '',
      fecha: newCita.fecha,
      hora: newCita.hora,
      motivo: newCita.motivo,
      estado: 'Pendiente',
      ubicacion: 'Por confirmar'
    };
    
    setCitasProgramadas([...citasProgramadas, nuevaCita]);
    setNewCita({ hijo: '', docente: '', fecha: '', hora: '', motivo: '' });
    setShowNewCitaModal(false);
  };

  const cancelarCita = (id) => {
    setCitasProgramadas(citasProgramadas.map(cita => 
      cita.id === id ? { ...cita, estado: 'Cancelada' } : cita
    ));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderCitas = () => (
    <div className="citas-section">
      <div className="section-header">
        <h2 className="section-title">Mis Citas</h2>
        <button 
          className="new-cita-button"
          onClick={() => setShowNewCitaModal(true)}
        >
          + Agendar Cita
        </button>
      </div>

      {/* Citas Próximas */}
      <div className="citas-proximas">
        <h3 className="subsection-title">Citas Próximas</h3>
        <div className="citas-list">
          {citasProgramadas.filter(cita => cita.estado !== 'Cancelada').length > 0 ? (
            citasProgramadas.filter(cita => cita.estado !== 'Cancelada').map(cita => (
              <div key={cita.id} className="cita-card">
                <div className="cita-header">
                  <div className="cita-info">
                    <h3 className="cita-hijo">{cita.hijo}</h3>
                    <p className="cita-docente">con {cita.docente} - {cita.materia}</p>
                  </div>
                  <span className={`status-badge ${cita.estado.toLowerCase()}`}>
                    {cita.estado}
                  </span>
                </div>
                
                <div className="cita-details">
                  <div className="detail-row">
                    <span className="detail-label">📅 Fecha:</span>
                    <span className="detail-value">{formatearFecha(cita.fecha)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🕐 Hora:</span>
                    <span className="detail-value">{cita.hora}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📍 Ubicación:</span>
                    <span className="detail-value">{cita.ubicacion}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📝 Motivo:</span>
                    <span className="detail-value">{cita.motivo}</span>
                  </div>
                </div>

                {cita.estado === 'Pendiente' && (
                  <div className="cita-actions">
                    <button 
                      className="action-button cancel"
                      onClick={() => cancelarCita(cita.id)}
                    >
                      Cancelar Cita
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-citas">
              <p>No tienes citas programadas</p>
              <button 
                className="new-cita-button"
                onClick={() => setShowNewCitaModal(true)}
              >
                Agendar Primera Cita
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Historial */}
      <div className="historial-citas">
        <h3 className="subsection-title">Historial de Citas</h3>
        <div className="citas-list">
          {historialCitas.map(cita => (
            <div key={cita.id} className="cita-card historial">
              <div className="cita-header">
                <div className="cita-info">
                  <h3 className="cita-hijo">{cita.hijo}</h3>
                  <p className="cita-docente">con {cita.docente} - {cita.materia}</p>
                </div>
                <span className={`status-badge ${cita.estado.toLowerCase()}`}>
                  {cita.estado}
                </span>
              </div>
              
              <div className="cita-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Fecha:</span>
                  <span className="detail-value">{formatearFecha(cita.fecha)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🕐 Hora:</span>
                  <span className="detail-value">{cita.hora}</span>
                </div>
                {cita.notas && (
                  <div className="detail-row">
                    <span className="detail-label">📋 Notas:</span>
                    <span className="detail-value">{cita.notas}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
              <div className="avatar">{padreData.name.split(' ').map(n => n[0]).join('')}</div>
              <div className="perfil-info">
                <h3 className="perfil-name">{padreData.name}</h3>
                <p className="perfil-role">Padre de Familia</p>
              </div>
            </div>
          </div>
          
          <div className="perfil-details">
            <div className="detail-group">
              <label className="detail-label">Email:</label>
              <span className="detail-value">{padreData.email}</span>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">Teléfono:</label>
              <span className="detail-value">{padreData.phone}</span>
            </div>
          </div>

          <div className="hijos-section">
            <h3 className="subsection-title">Mis Hijos</h3>
            <div className="hijos-list">
              {padreData.hijos.map((hijo, index) => (
                <div key={hijo.id || index} className="hijo-card">
                  <div className="hijo-info">
                    <h4 className="hijo-nombre">{hijo.nombre}</h4>
                    <p className="hijo-grado">{hijo.grado}</p>
                    <p className="hijo-docente">Docente: {hijo.docente}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button className="edit-profile-button">Editar Perfil</button>
        </div>
      </div>
    </div>
  );

  const renderHorarios = () => (
    <div className="horarios-section">
      <h2 className="section-title">Horarios de Atención</h2>
      
      <div className="docentes-grid">
        {docentesDisponibles.map(docente => (
          <div key={docente.id} className={`docente-card ${!docente.disponible ? 'no-disponible' : ''}`}>
            <div className="docente-header">
              <h3 className="docente-nombre">{docente.nombre}</h3>
              <span className={`disponibilidad-badge ${docente.disponible ? 'disponible' : 'no-disponible'}`}>
                {docente.disponible ? 'Disponible' : 'No Disponible'}
              </span>
            </div>
            
            <div className="docente-info">
              <p className="docente-materia">{docente.materia} - {docente.grado}</p>
              
              <div className="horarios-atencion">
                <h4 className="horarios-title">Horarios de Atención:</h4>
                <ul className="horarios-lista">
                  {docente.horarios.map((horario, index) => (
                    <li key={index}>{horario}</li>
                  ))}
                </ul>
              </div>
            </div>

            {docente.disponible && (
              <button 
                className="agendar-button"
                onClick={() => setShowNewCitaModal(true)}
              >
                Agendar Cita
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="info-horarios">
        <h3 className="subsection-title">Información General</h3>
        <div className="info-card">
          <ul className="info-lista">
            <li>📅 Las citas pueden agendarse con máximo 2 semanas de anticipación</li>
            <li>⏰ Duración promedio de cada cita: 30 minutos</li>
            <li>📞 Para cambios de último momento, contactar directamente al docente</li>
            <li>🏫 Las citas se realizan en las aulas de cada docente</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // 🔍 VERIFICAR SI EL USUARIO ESTÁ CARGADO
  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Cargando información del usuario...</p>
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
            <div className="user-avatar">{padreData.name.split(' ').map(n => n[0]).join('')}</div>
            <div className="user-details">
              <span className="user-name">{padreData.name}</span>
              <span className="user-role">Padre de Familia</span>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'citas' ? 'active' : ''}`}
            onClick={() => setActiveSection('citas')}
            data-tooltip="Mis Citas"
          >
            <CalendarIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Mis Citas</span>
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
          {activeSection === 'citas' && renderCitas()}
          {activeSection === 'perfil' && renderPerfil()}
          {activeSection === 'horarios' && renderHorarios()}
        </div>
      </main>

      {/* Modal para nueva cita */}
      {showNewCitaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Agendar Nueva Cita</h2>
              <button 
                className="close-button"
                onClick={() => setShowNewCitaModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitCita} className="cita-form">
              <div className="form-group">
                <label className="form-label">Seleccionar Hijo/a</label>
                <select
                  name="hijo"
                  value={newCita.hijo}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Seleccionar hijo/a</option>
                  {padreData.hijos.map((hijo, index) => (
                    <option key={hijo.id || index} value={hijo.id || index}>
                      {hijo.nombre} - {hijo.grado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Seleccionar Docente</label>
                <select
                  name="docente"
                  value={newCita.docente}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                >
                  <option value="">Seleccionar docente</option>
                  {docentesDisponibles.filter(d => d.disponible).map(docente => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nombre} - {docente.materia}
                    </option>
                  ))}
                </select>
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
                  <select
                    name="hora"
                    value={newCita.hora}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Seleccionar hora</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="15:30">03:30 PM</option>
                  </select>
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
                  placeholder="Describe brevemente el motivo de la cita..."
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
                  Agendar Cita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPadre;
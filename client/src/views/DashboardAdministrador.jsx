import React, { useState } from 'react';
import '../css/DashboardAdministrador.css';
import { useAuth } from '../context/AuthContext'; // ← IMPORTAR CONTEXTO
import {
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ChartPieIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

function DashboardAdministrador() {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // 🔥 OBTENER DATOS REALES DEL USUARIO
  const { user, logout } = useAuth();
  
  // 🔄 REEMPLAZAR useState hardcodeado por datos dinámicos
  const adminData = {
    name: user?.name || 'Administrador',
    email: user?.email || '',
    role: user?.role === 'administrador' ? 'Super Administrador' : (user?.role || 'Admin'),
    phone: user?.telefono || user?.phone || 'No disponible'
  };

  // Estados para métricas del dashboard
  const [metricas] = useState({
    totalUsuarios: 45,
    docentesActivos: 18,
    coordinadores: 4,
    administradores: 2,
    citasSemana: 127,
    citasHoy: 8,
    usuariosActivos: 38
  });

  // Estados para gestión de usuarios
  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: 'Prof. Juan Pérez',
      email: 'juan.perez@colegio.edu',
      rol: 'Docente',
      materia: 'Matemáticas',
      estado: 'Activo',
      fechaRegistro: '2025-01-15'
    },
    {
      id: 2,
      nombre: 'Coord. Ana López',
      email: 'ana.lopez@colegio.edu',
      rol: 'Coordinador',
      materia: 'Primaria',
      estado: 'Activo',
      fechaRegistro: '2025-01-10'
    },
    {
      id: 3,
      nombre: 'Prof. Carlos Silva',
      email: 'carlos.silva@colegio.edu',
      rol: 'Docente',
      materia: 'Historia',
      estado: 'Inactivo',
      fechaRegistro: '2025-02-01'
    }
  ]);

  // Estados para configuración del sistema
  const [configuracion] = useState({
    horariosDisponibles: {
      inicio: '08:00',
      fin: '16:00',
      duracionCita: 30,
      descansos: ['10:30-11:00', '14:00-14:30']
    },
    diasHabiles: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
    materias: ['Matemáticas', 'Español', 'Ciencias', 'Historia', 'Inglés', 'Educación Física']
  });

  // Estados para modales
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: '',
    email: '',
    rol: 'Docente',
    materia: '',
    telefono: ''
  });

  const [filtroUsuarios, setFiltroUsuarios] = useState('todos');

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
    setNewUser({ ...newUser, [name]: value });
  };

  const handleSubmitUser = (e) => {
    e.preventDefault();
    const nuevoUsuario = {
      id: usuarios.length + 1,
      nombre: newUser.nombre,
      email: newUser.email,
      rol: newUser.rol,
      materia: newUser.materia,
      estado: 'Activo',
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
    
    setUsuarios([...usuarios, nuevoUsuario]);
    setNewUser({ nombre: '', email: '', rol: 'Docente', materia: '', telefono: '' });
    setShowNewUserModal(false);
  };

  const toggleUserStatus = (id) => {
    setUsuarios(usuarios.map(usuario => 
      usuario.id === id 
        ? { ...usuario, estado: usuario.estado === 'Activo' ? 'Inactivo' : 'Activo' }
        : usuario
    ));
  };

  const filtrarUsuarios = () => {
    if (filtroUsuarios === 'todos') return usuarios;
    if (filtroUsuarios === 'activos') return usuarios.filter(u => u.estado === 'Activo');
    if (filtroUsuarios === 'inactivos') return usuarios.filter(u => u.estado === 'Inactivo');
    return usuarios.filter(u => u.rol === filtroUsuarios);
  };

  const renderDashboard = () => (
    <div className="dashboard-section">
      <h2 className="section-title">Panel de Control</h2>
      
      {/* Métricas principales */}
      <div className="metricas-grid">
        <div className="metrica-card">
          <div className="metrica-icon">👥</div>
          <div className="metrica-content">
            <h3 className="metrica-value">{metricas.totalUsuarios}</h3>
            <p className="metrica-label">Total Usuarios</p>
          </div>
        </div>
        
        <div className="metrica-card">
          <div className="metrica-icon">👨‍🏫</div>
          <div className="metrica-content">
            <h3 className="metrica-value">{metricas.docentesActivos}</h3>
            <p className="metrica-label">Docentes Activos</p>
          </div>
        </div>
        
        <div className="metrica-card">
          <div className="metrica-icon">📅</div>
          <div className="metrica-content">
            <h3 className="metrica-value">{metricas.citasSemana}</h3>
            <p className="metrica-label">Citas esta Semana</p>
          </div>
        </div>
        
        <div className="metrica-card">
          <div className="metrica-icon">🟢</div>
          <div className="metrica-content">
            <h3 className="metrica-value">{metricas.usuariosActivos}</h3>
            <p className="metrica-label">Usuarios Activos</p>
          </div>
        </div>
      </div>

      {/* Resumen por roles */}
      <div className="resumen-section">
        <h3 className="subsection-title">Distribución de Usuarios</h3>
        <div className="roles-grid">
          <div className="rol-card">
            <div className="rol-info">
              <span className="rol-nombre">Docentes</span>
              <span className="rol-count">{metricas.docentesActivos}</span>
            </div>
            <div className="rol-progress">
              <div className="progress-bar" style={{width: `${(metricas.docentesActivos / metricas.totalUsuarios) * 100}%`}}></div>
            </div>
          </div>
          
          <div className="rol-card">
            <div className="rol-info">
              <span className="rol-nombre">Coordinadores</span>
              <span className="rol-count">{metricas.coordinadores}</span>
            </div>
            <div className="rol-progress">
              <div className="progress-bar" style={{width: `${(metricas.coordinadores / metricas.totalUsuarios) * 100}%`}}></div>
            </div>
          </div>
          
          <div className="rol-card">
            <div className="rol-info">
              <span className="rol-nombre">Administradores</span>
              <span className="rol-count">{metricas.administradores}</span>
            </div>
            <div className="rol-progress">
              <div className="progress-bar" style={{width: `${(metricas.administradores / metricas.totalUsuarios) * 100}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="actividad-section">
        <h3 className="subsection-title">Actividad Reciente</h3>
        <div className="actividad-list">
          <div className="actividad-item">
            <div className="actividad-icon">👤</div>
            <div className="actividad-content">
              <p className="actividad-text">Nuevo docente registrado: Prof. Carlos Silva</p>
              <span className="actividad-time">Hace 2 horas</span>
            </div>
          </div>
          <div className="actividad-item">
            <div className="actividad-icon">📅</div>
            <div className="actividad-content">
              <p className="actividad-text">15 nuevas citas programadas hoy</p>
              <span className="actividad-time">Hace 4 horas</span>
            </div>
          </div>
          <div className="actividad-item">
            <div className="actividad-icon">⚙️</div>
            <div className="actividad-content">
              <p className="actividad-text">Configuración de horarios actualizada</p>
              <span className="actividad-time">Ayer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsuarios = () => (
    <div className="usuarios-section">
      <div className="section-header">
        <h2 className="section-title">Gestión de Usuarios</h2>
        <button 
          className="new-cita-button"
          onClick={() => setShowNewUserModal(true)}
        >
          + Nuevo Usuario
        </button>
      </div>
      
      <div className="usuarios-filters">
        <select 
          className="filter-select"
          value={filtroUsuarios}
          onChange={(e) => setFiltroUsuarios(e.target.value)}
        >
          <option value="todos">Todos los usuarios</option>
          <option value="activos">Usuarios activos</option>
          <option value="inactivos">Usuarios inactivos</option>
          <option value="Docente">Solo Docentes</option>
          <option value="Coordinador">Solo Coordinadores</option>
          <option value="Administrador">Solo Administradores</option>
        </select>
      </div>
      
      <div className="usuarios-list">
        {filtrarUsuarios().map(usuario => (
          <div key={usuario.id} className="usuario-card">
            <div className="usuario-header">
              <div className="usuario-info">
                <div className="usuario-avatar">
                  {usuario.nombre.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="usuario-details">
                  <h3 className="usuario-nombre">{usuario.nombre}</h3>
                  <p className="usuario-email">{usuario.email}</p>
                  <p className="usuario-materia">{usuario.materia}</p>
                </div>
              </div>
              <div className="usuario-status">
                <span className={`status-badge ${usuario.estado.toLowerCase()}`}>
                  {usuario.estado}
                </span>
                <span className={`rol-badge ${usuario.rol.toLowerCase()}`}>
                  {usuario.rol}
                </span>
              </div>
            </div>
            
            <div className="usuario-actions">
              <button 
                className={`action-button ${usuario.estado === 'Activo' ? 'deactivate' : 'activate'}`}
                onClick={() => toggleUserStatus(usuario.id)}
              >
                {usuario.estado === 'Activo' ? 'Desactivar' : 'Activar'}
              </button>
              <button className="action-button edit">Editar</button>
              <button className="action-button reset">Reset Password</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfiguracion = () => (
    <div className="configuracion-section">
      <div className="section-header">
        <h2 className="section-title">Configuración del Sistema</h2>
      </div>
      
      <div className="config-grid">
        <div className="config-card">
          <h3 className="config-title">Horarios de Citas</h3>
          <div className="config-content">
            <div className="config-item">
              <span className="config-label">Horario:</span>
              <span className="config-value">{configuracion.horariosDisponibles.inicio} - {configuracion.horariosDisponibles.fin}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Duración:</span>
              <span className="config-value">{configuracion.horariosDisponibles.duracionCita} minutos</span>
            </div>
            <div className="config-item">
              <span className="config-label">Descansos:</span>
              <span className="config-value">{configuracion.horariosDisponibles.descansos.join(', ')}</span>
            </div>
          </div>
        </div>
        
        <div className="config-card">
          <h3 className="config-title">Días Hábiles</h3>
          <div className="config-content">
            <div className="dias-list">
              {configuracion.diasHabiles.map(dia => (
                <span key={dia} className="dia-badge">{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="config-card">
          <h3 className="config-title">Materias Disponibles</h3>
          <div className="config-content">
            <div className="materias-list">
              {configuracion.materias.map(materia => (
                <span key={materia} className="materia-badge">{materia}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="system-actions">
        <h3 className="subsection-title">Acciones del Sistema</h3>
        <div className="actions-grid">
          <button className="system-action-button backup">
            <span className="action-icon">💾</span>
            <span className="action-text">Crear Backup</span>
          </button>
          <button className="system-action-button logs">
            <span className="action-icon">📊</span>
            <span className="action-text">Ver Logs</span>
          </button>
          <button className="system-action-button maintenance">
            <span className="action-icon">🔧</span>
            <span className="action-text">Mantenimiento</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderReportes = () => (
    <div className="reportes-section">
      <h2 className="section-title">Reportes y Estadísticas</h2>
      
      <div className="reportes-grid">
        <div className="reporte-card">
          <h3 className="reporte-title">Citas por Mes</h3>
          <div className="reporte-content">
            <div className="stat-item">
              <span className="stat-label">Enero 2025:</span>
              <span className="stat-value">245 citas</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Febrero 2025:</span>
              <span className="stat-value">298 citas</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Marzo 2025:</span>
              <span className="stat-value">189 citas</span>
            </div>
          </div>
        </div>
        
        <div className="reporte-card">
          <h3 className="reporte-title">Docentes más Solicitados</h3>
          <div className="reporte-content">
            <div className="stat-item">
              <span className="stat-label">Prof. Ana García:</span>
              <span className="stat-value">45 citas</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Prof. Juan Pérez:</span>
              <span className="stat-value">38 citas</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Prof. María López:</span>
              <span className="stat-value">32 citas</span>
            </div>
          </div>
        </div>
        
        <div className="reporte-card">
          <h3 className="reporte-title">Horarios más Populares</h3>
          <div className="reporte-content">
            <div className="stat-item">
              <span className="stat-label">10:00 - 10:30:</span>
              <span className="stat-value">78 citas</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">11:00 - 11:30:</span>
              <span className="stat-value">65 citas</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">14:00 - 14:30:</span>
              <span className="stat-value">52 citas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="export-section">
        <h3 className="subsection-title">Exportar Reportes</h3>
        <div className="export-buttons">
          <button className="export-button">📊 Exportar Excel</button>
          <button className="export-button">📄 Exportar PDF</button>
          <button className="export-button">📈 Generar Gráficos</button>
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
          <p>Cargando panel de administración...</p>
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
            <span className="logo-text">EduCitas</span>
          </div>
          <div className="user-info">
            <div className="user-avatar">{adminData.name.split(' ').map(n => n[0]).join('')}</div>
            <div className="user-details">
              <span className="user-name">{adminData.name}</span>
              <span className="user-role">Super Admin</span>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
            data-tooltip="Dashboard"
          >
            <ChartBarIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveSection('usuarios')}
            data-tooltip="Usuarios"
          >
            <UsersIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Usuarios</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'configuracion' ? 'active' : ''}`}
            onClick={() => setActiveSection('configuracion')}
            data-tooltip="Configuración"
          >
            <CogIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Configuración</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'reportes' ? 'active' : ''}`}
            onClick={() => setActiveSection('reportes')}
            data-tooltip="Reportes"
          >
            <ChartPieIcon className="nav-icon w-6 h-6" />
            <span className="nav-text">Reportes</span>
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
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'usuarios' && renderUsuarios()}
          {activeSection === 'configuracion' && renderConfiguracion()}
          {activeSection === 'reportes' && renderReportes()}
        </div>
      </main>

      {/* Modal para nuevo usuario */}
      {showNewUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Registrar Nuevo Usuario</h2>
              <button 
                className="close-button"
                onClick={() => setShowNewUserModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmitUser} className="cita-form">
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={newUser.nombre}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select
                    name="rol"
                    value={newUser.rol}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="Docente">Docente</option>
                    <option value="Coordinador">Coordinador</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Materia/Área</label>
                  <select
                    name="materia"
                    value={newUser.materia}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {configuracion.materias.map(materia => (
                      <option key={materia} value={materia}>{materia}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={newUser.telefono}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowNewUserModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                >
                  Registrar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdministrador;
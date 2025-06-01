import React, { useState, useEffect, useCallback } from 'react';
import '../css/DashboardAdministrador.css';
import { useAuth } from '../context/AuthContext';
import { getAllUsers } from '../services/usersService';
import {
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  ChartPieIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  updateUser,
  deleteUser,
  toggleUserStatus,
  resetUserPassword,
  //getUserStats,
  getUsersByRole,
  getUsersByStatus
} from '../services/usersService';

function DashboardAdministrador() {
  console.log('🎯 COMPONENTE DASHBOARD RENDERIZANDO');
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user, logout } = useAuth();
// AGREGA ESTA LÍNEA TEMPORAL:
  console.log('🔥 DASHBOARD CARGADO - EJECUTANDO loadStats');
  // Estados para datos reales
  const [usuarios, setUsuarios] = useState([]);
  const [metricas, setMetricas] = useState({
    totalUsuarios: 0,
    docentesActivos: 0,
    coordinadores: 0,
    administradores: 0,
    padres: 0,
    usuariosActivos: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para modales
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Estados para formularios
  const [newUser, setNewUser] = useState({
    nombre: '',
    apellido: '',
    email: '',
    role: 'padre',
    telefono: ''
  });
  const [editUser, setEditUser] = useState({});
  const [filtroUsuarios, setFiltroUsuarios] = useState('todos');

  // Configuración del sistema (mantener estático por ahora)
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

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('🚀 useEffect ejecutándose...');
    loadUsers();
    loadStats();
  }, []);

  // 🔥 FUNCIONES CRUD REALES

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await getAllUsers();
      setUsuarios(usersData);
      setError('');
    } catch (error) {
      setError('Error al cargar usuarios: ' + error.message);
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
  console.log('🔄 loadStats() iniciando...');
  try {
    const allUsers = await getAllUsers();
    
    // AQUÍ es donde filtras los administradores
    const usuariosSinAdmins = allUsers.filter(user => 
      user.rol !== 'administrador' && user.role !== 'administrador'
    );

    const stats = {
      totalUsuarios: usuariosSinAdmins.length, // ← CAMBIO AQUÍ: Sin admins
      docentesActivos: allUsers.filter(user => (user.rol === 'docente' || user.role === 'docente')).length,
      coordinadores: allUsers.filter(user => (user.rol === 'coordinador' || user.role === 'coordinador')).length,
      administradores: allUsers.filter(user => (user.rol === 'administrador' || user.role === 'administrador')).length,
      padres: allUsers.filter(user => (user.rol === 'padre' || user.role === 'padre')).length,
      usuariosActivos: allUsers.filter(user => (user.activo === true || user.isActive === true)).length
    };

    console.log('📈 Stats calculados:', stats);
    setMetricas(stats);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const handleCreateUser = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    console.log('🚀 Registrando usuario completo con email...');
    
    // 📧 USAR SOLO TU BACKEND - que crea usuario Y envía email
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: newUser.nombre,
        apellido: newUser.apellido,
        email: newUser.email,
        telefono: newUser.telefono,
        role: newUser.role
      }),
    });
    
    const data = await response.json();
    console.log('📊 Response:', data);
    
    if (response.ok) {
      console.log('✅ Usuario creado y email enviado exitosamente');
      
      // Agregar el nuevo usuario a la lista (simulando la estructura que esperas)
      const newUserForList = {
        id: data.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: true,
        fechaRegistro: new Date().toLocaleDateString()
      };
      
      setUsuarios([newUserForList, ...usuarios]);
      setNewUser({ nombre: '', apellido: '', email: '', role: 'padre', telefono: '' });
      setShowNewUserModal(false);
      await loadStats();
      setError('');
    } else {
      throw new Error(data.error || 'Error al crear usuario');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    setError('Error al crear usuario: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleEditUser = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    await updateUser(selectedUser.id, editUser);
    await loadUsers(); // Recargar lista
    await loadStats(); 
    setShowEditModal(false);
    setSelectedUser(null);
    setEditUser({});
    setError('');
  } catch (error) {
    setError('Error al actualizar usuario: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await deleteUser(selectedUser.id);
      setUsuarios(usuarios.filter(u => u.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadStats(); // Actualizar estadísticas
      setError('');
    } catch (error) {
      setError('Error al eliminar usuario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);
      await toggleUserStatus(userId, currentStatus);
      await loadUsers(); // Recargar lista
      loadStats(); // Actualizar estadísticas
      setError('');
    } catch (error) {
      setError('Error al cambiar estado: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      setLoading(true);
      const newPassword = await resetUserPassword(userId);
      alert(`Nueva contraseña temporal: ${newPassword}`);
      setError('');
    } catch (error) {
      setError('Error al resetear contraseña: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 FUNCIONES DE FILTRADO MEJORADAS

  const filtrarUsuarios = useCallback(async () => {
  try {
    setLoading(true);
    let filteredUsers = [];

    switch (filtroUsuarios) {
      case 'todos':
        filteredUsers = await getAllUsers();
        break;
      case 'activos':
        filteredUsers = await getUsersByStatus(true);
        break;
      case 'inactivos':
        filteredUsers = await getUsersByStatus(false);
        break;
      case 'docente':
      case 'coordinador':
      case 'administrador':
      case 'padre':
        filteredUsers = await getUsersByRole(filtroUsuarios);
        break;
      default:
        filteredUsers = await getAllUsers(); // ← Cambiar esta línea
    }

    return filteredUsers;
  } catch (error) {
    console.error('Error filtering users:', error);
    return [];
  } finally {
    setLoading(false);
  }
}, [filtroUsuarios]); // ← Solo filtroUsuarios

  useEffect(() => {
    const applyFilter = async () => {
      const filtered = await filtrarUsuarios();
      setUsuarios(filtered);
    };
    applyFilter();
  }, [filtroUsuarios, filtrarUsuarios]); // ← Agregar la función también

  // 🔥 MANEJADORES DE MODALES

  const openEditModal = (usuario) => {
    setSelectedUser(usuario);
    setEditUser({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      role: usuario.role,
      telefono: usuario.telefono
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (usuario) => {
    setSelectedUser(usuario);
    setShowDeleteModal(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditUser({ ...editUser, [name]: value });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  // Obtener datos del administrador
  const adminData = {
    name: user?.name || 'Administrador',
    email: user?.email || '',
    role: user?.role === 'administrador' ? 'Super Administrador' : (user?.role || 'Admin'),
    phone: user?.telefono || user?.phone || 'No disponible'
  };

  // Mostrar loading si no hay usuario
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

  // 🔥 RENDERIZAR SECCIONES

  const renderDashboard = () => (
    <div className="dashboard-section">
      <h2 className="section-title">Panel de Control</h2>
      
      {/* Mostrar error si existe */}
      {error && (
        <div className="error-banner">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      
      {/* Métricas principales */}
      <div className="metricas-grid">
        <div className="metrica-card">
          <div className="metrica-content">
            <h3 className="metrica-value">{metricas.totalUsuarios}</h3>
            <p className="metrica-label">Total Usuarios</p>
          </div>
        </div>
        
        <div className="metrica-card">
          <div className="metrica-content">
            <h3 className="metrica-value">{metricas.docentesActivos}</h3>
            <p className="metrica-label">Docentes</p>
          </div>
        </div>
        
        <div className="metrica-card">
          <div className="metrica-content">
            <h3 className="metrica-value">{metricas.coordinadores}</h3>
            <p className="metrica-label">Coordinadores</p>
          </div>
        </div>
        
        <div className="metrica-card">
          <div className="metrica-content">
            <h3 className="metrica-value">{metricas.padres}</h3>
            <p className="metrica-label">Padres de Familia</p>
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
              <div className="progress-bar" style={{width: `${metricas.totalUsuarios > 0 ? (metricas.docentesActivos / metricas.totalUsuarios) * 100 : 0}%`}}></div>
            </div>
          </div>
          
          <div className="rol-card">
            <div className="rol-info">
              <span className="rol-nombre">Coordinadores</span>
              <span className="rol-count">{metricas.coordinadores}</span>
            </div>
            <div className="rol-progress">
              <div className="progress-bar" style={{width: `${metricas.totalUsuarios > 0 ? (metricas.coordinadores / metricas.totalUsuarios) * 100 : 0}%`}}></div>
            </div>
          </div>
          
          <div className="rol-card">
            <div className="rol-info">
              <span className="rol-nombre">Padres</span>
              <span className="rol-count">{metricas.padres}</span>
            </div>
            <div className="rol-progress">
              <div className="progress-bar" style={{width: `${metricas.totalUsuarios > 0 ? (metricas.padres / metricas.totalUsuarios) * 100 : 0}%`}}></div>
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
          disabled={loading}
        >
          + Nuevo Usuario
        </button>
      </div>
      
      {/* Mostrar error si existe */}
      {error && (
        <div className="error-banner">
          <ExclamationTriangleIcon className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      
      <div className="usuarios-filters">
        <select 
          className="filter-select"
          value={filtroUsuarios}
          onChange={(e) => setFiltroUsuarios(e.target.value)}
          disabled={loading}
        >
          <option value="todos">Todos los usuarios</option>
          <option value="activos">Usuarios activos</option>
          <option value="inactivos">Usuarios inactivos</option>
          <option value="docente">Solo Docentes</option>
          <option value="coordinador">Solo Coordinadores</option>
          <option value="administrador">Solo Administradores</option>
          <option value="padre">Solo Padres</option>
        </select>
      </div>
      
      {loading && (
        <div className="loading-spinner-small">Cargando usuarios...</div>
      )}
      
      <div className="usuarios-list">
        {usuarios.map(usuario => (
          <div key={usuario.id} className="usuario-card">
            <div className="usuario-header">
              <div className="usuario-info">
                <div className="usuario-avatar">
                  {usuario.nombre ? (usuario.nombre[0] + (usuario.apellido?.[0] || '')) : usuario.name?.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="usuario-details">
                  <h3 className="usuario-nombre">{usuario.name || `${usuario.nombre} ${usuario.apellido}`}</h3>
                  <p className="usuario-email">{usuario.email}</p>
                  <p className="usuario-telefono">{usuario.telefono}</p>
                  <p className="usuario-fecha">Registrado: {usuario.fechaRegistro}</p>
                </div>
              </div>
              <div className="usuario-status">
                <span className={`status-badge ${usuario.isActive ? 'active' : 'inactive'}`}>
                  {usuario.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <span className={`rol-badge ${usuario.role}`}>
                  {usuario.role.charAt(0).toUpperCase() + usuario.role.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="usuario-actions">
              <button 
                className={`action-button ${usuario.isActive ? 'deactivate' : 'activate'}`}
                onClick={() => handleToggleStatus(usuario.id, usuario.isActive)}
                disabled={loading}
              >
                {usuario.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button 
                className="action-button edit"
                onClick={() => openEditModal(usuario)}
                disabled={loading}
              >
                <PencilIcon className="w-4 h-4" />
                Editar
              </button>
              <button 
                className="action-button reset"
                onClick={() => handleResetPassword(usuario.id)}
                disabled={loading}
              >
                <KeyIcon className="w-4 h-4" />
                Reset Password
              </button>
              <button 
                className="action-button delete"
                onClick={() => openDeleteModal(usuario)}
                disabled={loading}
              >
                <TrashIcon className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
        
        {usuarios.length === 0 && !loading && (
          <div className="empty-state">
            <p>No hay usuarios que coincidan con el filtro seleccionado.</p>
          </div>
        )}
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
          <h3 className="config-title">Roles Disponibles</h3>
          <div className="config-content">
            <div className="roles-list">
              <span className="role-badge">Padre de Familia</span>
              <span className="role-badge">Docente</span>
              <span className="role-badge">Coordinador</span>
              <span className="role-badge">Administrador</span>
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
          <h3 className="reporte-title">Usuarios por Rol</h3>
          <div className="reporte-content">
            <div className="stat-item">
              <span className="stat-label">Padres de Familia:</span>
              <span className="stat-value">{metricas.padres} usuarios</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Docentes:</span>
              <span className="stat-value">{metricas.docentesActivos} usuarios</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Coordinadores:</span>
              <span className="stat-value">{metricas.coordinadores} usuarios</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Administradores:</span>
              <span className="stat-value">{metricas.administradores} usuarios</span>
            </div>
          </div>
        </div>
        
        <div className="reporte-card">
          <h3 className="reporte-title">Estado de Usuarios</h3>
          <div className="reporte-content">
            <div className="stat-item">
              <span className="stat-label">Usuarios Activos:</span>
              <span className="stat-value">{metricas.usuariosActivos}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Usuarios Inactivos:</span>
              <span className="stat-value">{metricas.totalUsuarios - metricas.usuariosActivos}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total de Usuarios:</span>
              <span className="stat-value">{metricas.totalUsuarios}</span>
            </div>
          </div>
        </div>
        
        <div className="reporte-card">
          <h3 className="reporte-title">Últimos Registros</h3>
          <div className="reporte-content">
            {usuarios.slice(0, 3).map(usuario => (
              <div key={usuario.id} className="stat-item">
                <span className="stat-label">{usuario.name}:</span>
                <span className="stat-value">{usuario.fechaRegistro}</span>
              </div>
            ))}
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

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-text">QuickReserve</span>
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
            
            <form onSubmit={handleCreateUser} className="cita-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={newUser.nombre}
                    onChange={(e) => handleInputChange(e, false)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={newUser.apellido}
                    onChange={(e) => handleInputChange(e, false)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={(e) => handleInputChange(e, false)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={(e) => handleInputChange(e, false)}
                    className="form-input"
                    required
                  >
                    <option value="padre">Padre de Familia</option>
                    <option value="docente">Docente</option>
                    <option value="coordinador">Coordinador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={newUser.telefono}
                    onChange={(e) => handleInputChange(e, false)}
                    className="form-input"
                    placeholder="ej: +502 1234-5678"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowNewUserModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar usuario */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Editar Usuario</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditUser} className="cita-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={editUser.nombre}
                    onChange={(e) => handleInputChange(e, true)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={editUser.apellido}
                    onChange={(e) => handleInputChange(e, true)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={editUser.email}
                  onChange={(e) => handleInputChange(e, true)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rol</label>
                  <select
                    name="role"
                    value={editUser.role}
                    onChange={(e) => handleInputChange(e, true)}
                    className="form-input"
                    required
                  >
                    <option value="padre">Padre de Familia</option>
                    <option value="docente">Docente</option>
                    <option value="coordinador">Coordinador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editUser.telefono}
                    onChange={(e) => handleInputChange(e, true)}
                    className="form-input"
                    placeholder="ej: +502 1234-5678"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowEditModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <div className="modal-header">
              <h2 className="modal-title">Confirmar Eliminación</h2>
              <button 
                className="close-button"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="confirm-content">
              <div className="warning-icon">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
              </div>
              <p className="confirm-message">
                ¿Estás seguro de que deseas eliminar al usuario <strong>{selectedUser.name}</strong>?
              </p>
              <p className="confirm-submessage">
                Esta acción no se puede deshacer y se eliminará toda la información del usuario.
              </p>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="delete-button"
                onClick={handleDeleteUser}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdministrador;
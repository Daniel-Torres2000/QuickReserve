import React, { useState, useEffect, useCallback } from 'react';
import '../css/DashboardPadre.css';
import { useAuth } from '../context/AuthContext';
import {
  CalendarIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
// 🔥 IMPORTAR FIRESTORE
import { 
  collection, 
  doc, 
  getDoc,  // ✅ IMPORTAR getDoc
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

function DashboardPadre() {
  const [activeSection, setActiveSection] = useState('citas');
  const { user, logout } = useAuth();

  // 🔥 DATOS DINÁMICOS DEL PADRE
  const padreData = {
    name: user?.name || user?.nombre || 'Usuario',
    email: user?.email || '',
    phone: user?.telefono || user?.phone || 'No disponible'
  };

  // 🔄 ESTADOS PARA CITAS Y DOCENTES
  const [citasProgramadas, setCitasProgramadas] = useState([]);
  const [historialCitas, setHistorialCitas] = useState([]);
  const [docentesDisponibles, setDocentesDisponibles] = useState([]);
  
  // 🔥 NUEVOS ESTADOS PARA HORARIOS DEL DOCENTE SELECCIONADO
  const [horarioDocenteSeleccionado, setHorarioDocenteSeleccionado] = useState({});
  const [citasDocenteSeleccionado, setCitasDocenteSeleccionado] = useState([]);
  const [loadingHorario, setLoadingHorario] = useState(false);
  const [semanaActual, setSemanaActual] = useState('');
  
  // Estados para modales y loading
  const [showNewCitaModal, setShowNewCitaModal] = useState(false);
  const [showEditCitaModal, setShowEditCitaModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDocentes, setLoadingDocentes] = useState(false);
  const [error, setError] = useState('');
  
  // 🔄 NUEVO CITA SIN CAMPO HIJO
  const [newCita, setNewCita] = useState({
    docenteId: '',
    dia: '',
    hora: '',
    motivo: ''
  });

  // 🔥 CONSTANTES PARA HORARIOS
  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  const horasDisponibles = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'
  ];

  // 🔍 FUNCIÓN DE ÚLTIMO RECURSO: CARGAR TODOS Y FILTRAR DOCENTES
  const cargarTodosLosUsuarios = useCallback(async () => {
    try {
      console.log('🔍 Cargando todos los usuarios para filtrar docentes...');
      
      const usuariosRef = collection(db, 'usuarios');
      const usuariosSnap = await getDocs(usuariosRef);
      
      console.log(`📊 Total documentos en colección: ${usuariosSnap.size}`);
      
      const todosUsuarios = [];
      usuariosSnap.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        todosUsuarios.push(userData);
        console.log('📋 Usuario:', userData);
      });
      
      // Filtrar docentes manualmente
      const docentes = todosUsuarios.filter(usuario => 
        usuario.role === 'docente' || usuario.rol === 'docente'
      );
      
      console.log('👨‍🏫 Docentes filtrados manualmente:', docentes);
      
      if (docentes.length > 0) {
        setDocentesDisponibles(docentes);
        console.log('✅ Docentes cargados mediante filtro manual:', docentes.length);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar todos los usuarios:', error);
    }
  }, []);

  // 🔄 FUNCIÓN ALTERNATIVA PARA BUSCAR DOCENTES CON 'rol'
  const buscarDocentesConRolAlternativo = useCallback(async () => {
    try {
      console.log('🔍 Intentando búsqueda alternativa con campo "rol"...');
      
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('rol', '==', 'docente'));
      
      const usuariosSnap = await getDocs(q);
      const docentes = [];
      
      console.log(`📊 Docentes encontrados con 'rol': ${usuariosSnap.size}`);
      
      usuariosSnap.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        console.log('👨‍🏫 Docente encontrado (rol):', userData);
        docentes.push(userData);
      });
      
      if (docentes.length > 0) {
        setDocentesDisponibles(docentes);
        console.log('✅ Docentes encontrados con campo "rol":', docentes.length);
      } else {
        // Si tampoco encuentra con 'rol', intentar cargar todos y filtrar
        await cargarTodosLosUsuarios();
      }
      
    } catch (error) {
      console.error('❌ Error en búsqueda alternativa de docentes:', error);
    }
  }, [cargarTodosLosUsuarios]);

  // 🔥 FUNCIONES FIRESTORE PARA DOCENTES - ENVUELTAS EN useCallback
  const cargarDocentesDisponibles = useCallback(async () => {
    try {
      setLoadingDocentes(true);
      console.log('🔍 Buscando docentes en colección "usuarios"...');
      
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('role', '==', 'docente'));
      
      const usuariosSnap = await getDocs(q);
      const docentes = [];
      
      console.log(`📊 Docentes encontrados: ${usuariosSnap.size}`);
      
      usuariosSnap.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        console.log('👨‍🏫 Docente encontrado:', userData);
        docentes.push(userData);
      });
      
      setDocentesDisponibles(docentes);
      console.log('✅ Docentes cargados:', docentes.length, 'docentes encontrados');
      
      if (docentes.length === 0) {
        console.log('⚠️ No se encontraron docentes con role="docente"');
        // Intentar búsqueda alternativa con 'rol'
        await buscarDocentesConRolAlternativo();
      }
      
    } catch (error) {
      console.error('❌ Error al cargar docentes:', error);
      setError('Error al cargar docentes: ' + error.message);
    } finally {
      setLoadingDocentes(false);
    }
  }, [buscarDocentesConRolAlternativo]); // Incluir la dependencia

  // 🔥 FUNCIONES FIRESTORE PARA HORARIOS DEL DOCENTE

  const cargarHorarioDocente = async (docenteId) => {
    try {
      setLoadingHorario(true);
      console.log('🔍 Cargando horario del docente:', docenteId);
      
      // 📅 CARGAR HORARIO DEL DOCENTE
      const horarioRef = doc(db, 'horarios_docentes', docenteId);
      const horarioSnap = await getDoc(horarioRef);
      
      if (horarioSnap.exists()) {
        const horarioData = horarioSnap.data();
        setHorarioDocenteSeleccionado(horarioData.horario || {});
        console.log('✅ Horario del docente cargado:', horarioData.horario);
      } else {
        console.log('⚠️ No se encontró horario para el docente');
        setHorarioDocenteSeleccionado({});
      }
      
      // 📅 CARGAR CITAS EXISTENTES DEL DOCENTE EN LA SEMANA ACTUAL
      await cargarCitasDocenteSemanaActual(docenteId);
      
    } catch (error) {
      console.error('❌ Error al cargar horario del docente:', error);
      setHorarioDocenteSeleccionado({});
    } finally {
      setLoadingHorario(false);
    }
  };

  const cargarCitasDocenteSemanaActual = async (docenteId) => {
    try {
      const citasRef = collection(db, 'citas');
      
      const q = query(
        citasRef,
        where('docenteId', '==', docenteId),
        where('semana', '==', obtenerSemanaActual())
      );
      
      const citasSnap = await getDocs(q);
      const citasDocente = [];
      
      citasSnap.forEach((doc) => {
        citasDocente.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setCitasDocenteSeleccionado(citasDocente);
      console.log('✅ Citas del docente en semana actual:', citasDocente.length);
      
    } catch (error) {
      console.error('❌ Error al cargar citas del docente:', error);
      setCitasDocenteSeleccionado([]);
    }
  };

  // 🔥 FUNCIONES UTILITARIAS PARA HORARIOS
  const obtenerSemanaActual = () => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
    
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 4); // Viernes
    
    const formatoFecha = (fecha) => fecha.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit' 
    });
    
    return `${formatoFecha(inicioSemana)} - ${formatoFecha(finSemana)}`;
  };

  const obtenerFechaDelDia = (dia) => {
    const hoy = new Date();
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
    
    const indiceDia = diasSemana.indexOf(dia);
    const fechaDia = new Date(inicioSemana);
    fechaDia.setDate(inicioSemana.getDate() + indiceDia);
    
    return fechaDia.toISOString().split('T')[0];
  };

  const obtenerHoraFin = (horaInicio) => {
    const [hora, minutos] = horaInicio.split(':').map(Number);
    const horaFin = hora + 1;
    return `${horaFin.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  };

  const verificarDisponibilidadHora = (dia, hora) => {
    // Verificar si el horario del docente permite esa hora
    if (!horarioDocenteSeleccionado[dia]?.[hora]) {
      return false;
    }
    
    // Verificar si ya hay una cita en ese horario
    return !citasDocenteSeleccionado.some(cita => 
      cita.dia === dia && cita.hora === hora && cita.estado !== 'Cancelada'
    );
  };

  const obtenerHorasDisponiblesPorDia = (dia) => {
    if (!horarioDocenteSeleccionado[dia]) return [];
    return horasDisponibles.filter(hora => horarioDocenteSeleccionado[dia][hora] === true);
  };

  const obtenerDatosDocente = (docenteId) => {
    return docentesDisponibles.find(docente => docente.id === docenteId);
  };

  // 🔥 FUNCIONES FIRESTORE PARA CITAS - ENVUELTAS EN useCallback
  const cargarCitasDelPadre = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const citasRef = collection(db, 'citas');
      
      // 📋 CONSULTA PARA TODAS LAS CITAS DEL PADRE
      const q = query(
        citasRef, 
        where('padreId', '==', user.uid)
      );
      
      const citasSnap = await getDocs(q);
      const todasLasCitas = [];
      
      citasSnap.forEach((doc) => {
        todasLasCitas.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // 🔄 ORDENAR POR FECHA DE CREACIÓN (MÁS RECIENTES PRIMERO)
      todasLasCitas.sort((a, b) => {
        const fechaA = new Date(a.fechaCreacion || a.fecha || 0);
        const fechaB = new Date(b.fechaCreacion || b.fecha || 0);
        return fechaB - fechaA;
      });
      
      // 📊 SEPARAR CITAS PRÓXIMAS Y HISTORIAL
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const citasProximas = todasLasCitas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        return fechaCita >= hoy && cita.estado !== 'Cancelada' && cita.estado !== 'Completada';
      });
      
      const historial = todasLasCitas.filter(cita => {
        const fechaCita = new Date(cita.fecha);
        return fechaCita < hoy || cita.estado === 'Cancelada' || cita.estado === 'Completada';
      });
      
      setCitasProgramadas(citasProximas);
      setHistorialCitas(historial);
      
      console.log('✅ Citas del padre cargadas:', {
        proximas: citasProximas.length,
        historial: historial.length,
        total: todasLasCitas.length
      });
      
    } catch (error) {
      console.error('❌ Error al cargar citas del padre:', error);
      setError('Error al cargar citas: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]); // Depende solo de user.uid

  const guardarCitaEnFirestore = async (citaData) => {
    try {
      const citasRef = collection(db, 'citas');
      
      // 📝 OBTENER DATOS COMPLETOS DEL DOCENTE
      const datosDocente = obtenerDatosDocente(citaData.docenteId);
      
      const citaCompleta = {
        // IDs de referencia
        docenteId: citaData.docenteId,
        padreId: user.uid,
        
        // Datos del docente
        docenteEmail: datosDocente?.email || '',
        docenteName: datosDocente?.nombre || datosDocente?.name || 'Docente no disponible',
        docenteMateria: datosDocente?.materia || datosDocente?.subject || '',
        docenteGrado: datosDocente?.grado || datosDocente?.grade || '',
        
        // Datos del padre (desnormalizados para consultas rápidas)
        padreNombre: padreData.name,
        padreEmail: padreData.email,
        padreTelefono: padreData.phone,
        
        // 🔥 DATOS DE LA CITA CON ESTRUCTURA IGUAL AL DOCENTE
        dia: citaData.dia,
        hora: citaData.hora,
        horaFin: obtenerHoraFin(citaData.hora),
        motivo: citaData.motivo,
        estado: 'Confirmada', // ✅ CONFIRMADA DIRECTAMENTE (NO PENDIENTE)
        
        // Datos temporales y de seguimiento
        fecha: obtenerFechaDelDia(citaData.dia),
        semana: obtenerSemanaActual(),
        año: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        
        // Metadatos
        fechaCreacion: new Date().toISOString(),
        creadoPor: user.uid,
        creadoPorTipo: 'padre'
      };
      
      const docRef = await addDoc(citasRef, citaCompleta);
      console.log('✅ Cita guardada con ID:', docRef.id);
      
      return { id: docRef.id, ...citaCompleta };
    } catch (error) {
      console.error('❌ Error al guardar cita:', error);
      throw error;
    }
  };

  const actualizarCitaEnFirestore = async (citaId, datosActualizados) => {
    try {
      const citaRef = doc(db, 'citas', citaId);
      await updateDoc(citaRef, {
        ...datosActualizados,
        fechaActualizacion: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Error al actualizar cita:', error);
      throw error;
    }
  };

  const eliminarCitaDeFirestore = async (citaId) => {
    try {
      const citaRef = doc(db, 'citas', citaId);
      await deleteDoc(citaRef);
    } catch (error) {
      console.error('❌ Error al eliminar cita:', error);
      throw error;
    }
  };

  // 🔥 EFECTOS - CORREGIDOS CON DEPENDENCIAS APROPIADAS
  useEffect(() => {
    if (user?.uid) {
      setSemanaActual(obtenerSemanaActual());
      cargarDocentesDisponibles();
      cargarCitasDelPadre();
    }
  }, [user?.uid, cargarDocentesDisponibles, cargarCitasDelPadre]);

  // 🔄 EFECTO PARA RECARGAR CITAS CUANDO SE CAMBIE A ESA SECCIÓN
  useEffect(() => {
    if (activeSection === 'citas' && user?.uid) {
      cargarCitasDelPadre();
    }
  }, [activeSection, user?.uid, cargarCitasDelPadre]);

  // 🔥 CRUD PARA CITAS
  const handleCreateCita = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // 🚫 VALIDAR QUE HAYA DOCENTES DISPONIBLES
      if (docentesDisponibles.length === 0) {
        setError('No hay docentes registrados. No se pueden crear citas.');
        return;
      }
      
      // 🚫 VALIDAR CAMPOS REQUERIDOS
      if (!newCita.docenteId) {
        setError('Debe seleccionar un docente');
        return;
      }
      
      if (!newCita.dia || !newCita.hora) {
        setError('Debe seleccionar día y hora');
        return;
      }
      
      // 🚫 VERIFICAR DISPONIBILIDAD
      if (!verificarDisponibilidadHora(newCita.dia, newCita.hora)) {
        setError('Ya hay una cita programada en ese horario o no está disponible');
        return;
      }

      // Guardar en Firestore y obtener datos completos
      const citaCompleta = await guardarCitaEnFirestore(newCita);
      
      // Actualizar estado local
      setCitasProgramadas(prev => [...prev, citaCompleta]);
      setNewCita({ docenteId: '', dia: '', hora: '', motivo: '' });
      setShowNewCitaModal(false);
      setHorarioDocenteSeleccionado({}); // Limpiar horario
      setCitasDocenteSeleccionado([]); // Limpiar citas
      setError('');
      
      console.log('✅ Cita creada exitosamente por el padre');
      
    } catch (error) {
      setError('Error al crear la cita: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCita = async (citaId, datosActualizados) => {
    try {
      setLoading(true);
      
      await actualizarCitaEnFirestore(citaId, datosActualizados);
      
      // Actualizar ambos estados
      setCitasProgramadas(prev => 
        prev.map(cita => 
          cita.id === citaId 
            ? { ...cita, ...datosActualizados }
            : cita
        )
      );
      
      setHistorialCitas(prev => 
        prev.map(cita => 
          cita.id === citaId 
            ? { ...cita, ...datosActualizados }
            : cita
        )
      );
      
      setShowEditCitaModal(false);
      setSelectedCita(null);
      setError('');
      
    } catch (error) {
      setError('Error al actualizar la cita: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCita = async (citaId) => {
    try {
      setLoading(true);
      
      await eliminarCitaDeFirestore(citaId);
      setCitasProgramadas(prev => prev.filter(cita => cita.id !== citaId));
      setHistorialCitas(prev => prev.filter(cita => cita.id !== citaId));
      setError('');
      
    } catch (error) {
      setError('Error al eliminar la cita: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelarCita = async (citaId) => {
    await handleUpdateCita(citaId, { estado: 'Cancelada' });
    // Recargar citas para mover la cancelada al historial
    setTimeout(() => cargarCitasDelPadre(), 500);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 🔄 SI CAMBIA EL DOCENTE, CARGAR SU HORARIO
    if (name === 'docenteId') {
      setNewCita({ 
        ...newCita, 
        [name]: value,
        dia: '', // Resetear día y hora cuando cambie el docente
        hora: ''
      });
      
      if (value) {
        cargarHorarioDocente(value);
      } else {
        setHorarioDocenteSeleccionado({});
        setCitasDocenteSeleccionado([]);
      }
    } else {
      setNewCita({ ...newCita, [name]: value });
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 🔥 RENDERIZAR SECCIONES
  const renderCitas = () => (
    <div className="citas-section">
      <div className="section-header">
        <h2 className="section-title">Mis Citas</h2>
        <button 
          className="new-cita-button"
          onClick={() => setShowNewCitaModal(true)}
          disabled={loading}
        >
          + Agendar Cita
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Citas Próximas */}
      <div className="citas-proximas">
        <h3 className="subsection-title">
          Citas Próximas 
          <span className="citas-count">({citasProgramadas.length})</span>
        </h3>
        
        {loading && (
          <div className="loading-section">
            <div className="loading-spinner"></div>
            <p>Cargando citas...</p>
          </div>
        )}
        
        <div className="citas-list">
          {citasProgramadas.length > 0 ? (
            citasProgramadas.map(cita => (
              <div key={cita.id} className="cita-card">
                <div className="cita-header">
                  <div className="cita-info">
                    <h3 className="cita-docente">{cita.docenteName}</h3>
                    <p className="cita-materia">{cita.docenteMateria} - {cita.docenteGrado}</p>
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
                    <span className="detail-label">📝 Motivo:</span>
                    <span className="detail-value">{cita.motivo}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📧 Email Docente:</span>
                    <span className="detail-value">{cita.docenteEmail}</span>
                  </div>
                </div>

                <div className="cita-actions">
                  {cita.estado === 'Pendiente' && (
                    <button 
                      className="action-button cancel"
                      onClick={() => cancelarCita(cita.id)}
                      disabled={loading}
                    >
                      Cancelar Cita
                    </button>
                  )}
                  <button 
                    className="action-button edit"
                    onClick={() => {
                      setSelectedCita(cita);
                      setShowEditCitaModal(true);
                    }}
                    disabled={loading}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-citas">
              <div className="empty-icon">📅</div>
              <h3>No tienes citas programadas</h3>
              <p>Agenda tu primera cita con un docente</p>
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
        <h3 className="subsection-title">
          Historial de Citas
          <span className="citas-count">({historialCitas.length})</span>
        </h3>
        <div className="citas-list">
          {historialCitas.length > 0 ? (
            historialCitas.map(cita => (
              <div key={cita.id} className="cita-card historial">
                <div className="cita-header">
                  <div className="cita-info">
                    <h3 className="cita-docente">{cita.docenteName}</h3>
                    <p className="cita-materia">{cita.docenteMateria} - {cita.docenteGrado}</p>
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
                    <span className="detail-label">📝 Motivo:</span>
                    <span className="detail-value">{cita.motivo}</span>
                  </div>
                  {cita.fechaCreacion && (
                    <div className="detail-row">
                      <span className="detail-label">📋 Creada:</span>
                      <span className="detail-value">
                        {new Date(cita.fechaCreacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-citas">
              <p>No hay citas en el historial todavía.</p>
            </div>
          )}
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

          <div className="estadisticas-section">
            <h3 className="subsection-title">Estadísticas de Citas</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{citasProgramadas.length}</div>
                <div className="stat-label">Citas Próximas</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{historialCitas.filter(c => c.estado === 'Completada').length}</div>
                <div className="stat-label">Citas Completadas</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{historialCitas.filter(c => c.estado === 'Cancelada').length}</div>
                <div className="stat-label">Citas Canceladas</div>
              </div>
            </div>
          </div>
          
          <button className="edit-profile-button">Editar Perfil</button>
        </div>
      </div>
    </div>
  );

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
      {/* Sidebar Navigation - SIN MENÚ HORARIOS */}
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
        </div>
      </main>

      {/* 🔥 MODAL PARA NUEVA CITA - CON DOCENTES REALES */}
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
            
            <form onSubmit={handleCreateCita} className="cita-form">
              {/* 🚨 ALERTA SI NO HAY DOCENTES */}
              {docentesDisponibles.length === 0 && (
                <div className="no-users-alert">
                  <p>⚠️ <strong>No hay docentes registrados</strong></p>
                  <p>No se pueden crear citas hasta que haya docentes registrados en la plataforma.</p>
                </div>
              )}
              
              {/* ✅ CAMPO DOCENTE */}
              <div className="form-group">
                <label className="form-label">
                  Seleccionar Docente
                  {loadingDocentes && <span className="loading-text"> (Cargando...)</span>}
                </label>
                <select
                  name="docenteId"
                  value={newCita.docenteId}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={docentesDisponibles.length === 0 || loadingDocentes}
                >
                  <option value="">
                    {docentesDisponibles.length === 0 
                      ? "NO HAY DOCENTES REGISTRADOS" 
                      : "Seleccionar docente"}
                  </option>
                  {docentesDisponibles.map(docente => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nombre || docente.name} - {docente.materia || docente.subject} ({docente.grado || docente.grade})
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  💡 Selecciona el docente con quien deseas agendar la cita
                </small>
              </div>

              {/* 🔥 HORARIO DEL DOCENTE SELECCIONADO */}
              {newCita.docenteId && (
                <div className="horario-docente-section">
                  <h4 className="horario-title">
                    📅 Horario Disponible - Semana Actual ({semanaActual})
                    {loadingHorario && <span className="loading-text"> (Cargando...)</span>}
                  </h4>
                  
                  {loadingHorario ? (
                    <div className="loading-horario">
                      <div className="loading-spinner"></div>
                      <p>Cargando horario del docente...</p>
                    </div>
                  ) : Object.keys(horarioDocenteSeleccionado).length > 0 ? (
                    <div className="horario-grid">
                      {diasSemana.map(dia => {
                        const horasDisponiblesDelDia = obtenerHorasDisponiblesPorDia(dia);
                        const fechaDia = obtenerFechaDelDia(dia);
                        const esPasado = new Date(fechaDia) < new Date().setHours(0, 0, 0, 0);
                        
                        return (
                          <div key={dia} className={`dia-horario ${horasDisponiblesDelDia.length === 0 || esPasado ? 'no-disponible' : ''}`}>
                            <div className="dia-header-horario">
                              <h5>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h5>
                              <small>{new Date(fechaDia).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}</small>
                              {esPasado && <span className="dia-pasado">Pasado</span>}
                            </div>
                            
                            <div className="horas-disponibles">
                              {horasDisponiblesDelDia.length > 0 && !esPasado ? (
                                horasDisponiblesDelDia.map(hora => {
                                  const estaOcupado = !verificarDisponibilidadHora(dia, hora);
                                  return (
                                    <button
                                      key={hora}
                                      type="button"
                                      className={`hora-slot ${newCita.dia === dia && newCita.hora === hora ? 'selected' : ''} ${estaOcupado ? 'ocupado' : ''}`}
                                      onClick={() => {
                                        if (!estaOcupado) {
                                          setNewCita({ ...newCita, dia, hora });
                                        }
                                      }}
                                      disabled={estaOcupado}
                                    >
                                      <span className="hora-time">{hora}</span>
                                      <span className="hora-status">
                                        {estaOcupado ? '❌ Ocupado' : '✅ Libre'}
                                      </span>
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="no-horas">
                                  {esPasado ? 'Día pasado' : 'Sin horarios disponibles'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="no-horario-encontrado">
                      <p>⚠️ El docente no ha configurado su horario de disponibilidad.</p>
                      <p>Contacta directamente al docente para coordinar la cita.</p>
                    </div>
                  )}
                </div>
              )}

              {/* 🔥 INFORMACIÓN DE LA CITA SELECCIONADA */}
              {newCita.dia && newCita.hora && (
                <div className="cita-seleccionada">
                  <h4 className="selection-title">📋 Cita Seleccionada</h4>
                  <div className="selection-details">
                    <div className="selection-item">
                      <span className="selection-label">Día:</span>
                      <span className="selection-value">{newCita.dia.charAt(0).toUpperCase() + newCita.dia.slice(1)}</span>
                    </div>
                    <div className="selection-item">
                      <span className="selection-label">Fecha:</span>
                      <span className="selection-value">{formatearFecha(obtenerFechaDelDia(newCita.dia))}</span>
                    </div>
                    <div className="selection-item">
                      <span className="selection-label">Hora:</span>
                      <span className="selection-value">{newCita.hora} - {obtenerHoraFin(newCita.hora)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Motivo de la Cita</label>
                <textarea
                  name="motivo"
                  value={newCita.motivo}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="3"
                  placeholder="Describe el motivo de la reunión con el docente..."
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowNewCitaModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading || docentesDisponibles.length === 0}
                >
                  {loading ? 'Agendando...' : 'Agendar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔥 MODAL PARA EDITAR CITA */}
      {showEditCitaModal && selectedCita && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Editar Cita</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditCitaModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const datosActualizados = {
                motivo: formData.get('motivo')
              };
              handleUpdateCita(selectedCita.id, datosActualizados);
            }} className="cita-form">
              
              <div className="form-group">
                <label className="form-label">Docente</label>
                <input
                  type="text"
                  value={`${selectedCita.docenteName} - ${selectedCita.docenteMateria}`}
                  className="form-input"
                  disabled
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Fecha</label>
                  <input
                    type="text"
                    value={formatearFecha(selectedCita.fecha)}
                    className="form-input"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <input
                    type="text"
                    value={selectedCita.hora}
                    className="form-input"
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <input
                  type="text"
                  value={selectedCita.estado}
                  className="form-input"
                  disabled
                />
                <small className="form-help">
                  💡 Solo el docente puede cambiar el estado de la cita
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Motivo de la Cita</label>
                <textarea
                  name="motivo"
                  defaultValue={selectedCita.motivo}
                  className="form-textarea"
                  rows="3"
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowEditCitaModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Motivo'}
                </button>
                <button 
                  type="button" 
                  className="delete-button"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
                      handleDeleteCita(selectedCita.id);
                      setShowEditCitaModal(false);
                    }
                  }}
                  disabled={loading}
                >
                  Eliminar Cita
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
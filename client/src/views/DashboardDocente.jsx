import React, { useState, useEffect } from 'react';
import '../css/DashboardDocente.css';
import { useAuth } from '../context/AuthContext';
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
// 🔥 IMPORTAR FIRESTORE
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig'; // Ajusta la ruta según tu estructura

function DashboardDocente() {
  const [activeSection, setActiveSection] = useState('calendario');
  const { user, logout } = useAuth();

  // 🔥 DATOS DINÁMICOS DEL DOCENTE
  const docenteData = {
    name: user?.name || 'Docente',
    email: user?.email || '',
    subject: user?.materia || user?.subject || 'Materia no asignada',
    grade: user?.grado || user?.grade || 'Grado no asignado',
    phone: user?.telefono || user?.phone || 'No disponible'
  };

  // 🔄 ESTADOS PARA HORARIOS Y CITAS (Cambio a horarios por hora completa)
  const [horarioDocente, setHorarioDocente] = useState({
    lunes: {},
    martes: {},
    miercoles: {},
    jueves: {},
    viernes: {}
  });

  const [citasSemanaActual, setCitasSemanaActual] = useState([]);
  const [historialCitas, setHistorialCitas] = useState([]);
  const [semanaActual, setSemanaActual] = useState('');
  
  // 👥 NUEVO: Estados para usuarios/padres
  const [usuariosPadres, setUsuariosPadres] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  
  // Estados para modales
  const [showNewCitaModal, setShowNewCitaModal] = useState(false);
  const [showEditHorarioModal, setShowEditHorarioModal] = useState(false);
  const [showEditCitaModal, setShowEditCitaModal] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  
  // 🔄 CAMPO ESTUDIANTE REMOVIDO
  const [newCita, setNewCita] = useState({
    padreId: '',
    dia: '',
    hora: '',
    motivo: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
  
  // 🕐 HORARIOS DISPONIBLES (8:00 AM - 2:00 PM, cada hora)
  const horasDisponibles = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'
  ];

  // 🔥 FUNCIONES FIRESTORE PARA USUARIOS/PADRES

  const cargarUsuariosPadres = async () => {
    try {
      setLoadingUsuarios(true);
      console.log('🔍 Buscando usuarios padres en colección "usuarios"...');
      
      const usuariosRef = collection(db, 'usuarios'); // ✅ Colección correcta
      const q = query(usuariosRef, where('role', '==', 'padre')); // ✅ Campo 'role' no 'rol'
      
      const usuariosSnap = await getDocs(q);
      const padres = [];
      
      console.log(`📊 Documentos encontrados: ${usuariosSnap.size}`);
      
      usuariosSnap.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        console.log('👤 Usuario encontrado:', userData);
        padres.push(userData);
      });
      
      setUsuariosPadres(padres);
      console.log('✅ Usuarios padres cargados:', padres.length, 'padres encontrados');
      
      if (padres.length === 0) {
        console.log('⚠️ No se encontraron usuarios con role="padre"');
        // Intentar búsqueda alternativa con 'rol'
        await buscarConRolAlternativo();
      }
      
    } catch (error) {
      console.error('❌ Error al cargar usuarios padres:', error);
      setError('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // 🔄 FUNCIÓN ALTERNATIVA PARA BUSCAR CON 'rol' EN LUGAR DE 'role'
  const buscarConRolAlternativo = async () => {
    try {
      console.log('🔍 Intentando búsqueda alternativa con campo "rol"...');
      
      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('rol', '==', 'padre')); // Campo 'rol'
      
      const usuariosSnap = await getDocs(q);
      const padres = [];
      
      console.log(`📊 Documentos encontrados con 'rol': ${usuariosSnap.size}`);
      
      usuariosSnap.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        console.log('👤 Usuario encontrado (rol):', userData);
        padres.push(userData);
      });
      
      if (padres.length > 0) {
        setUsuariosPadres(padres);
        console.log('✅ Usuarios encontrados con campo "rol":', padres.length);
      } else {
        // Si tampoco encuentra con 'rol', intentar cargar todos y filtrar
        await cargarTodosLosUsuarios();
      }
      
    } catch (error) {
      console.error('❌ Error en búsqueda alternativa:', error);
    }
  };

  // 🔍 FUNCIÓN DE ÚLTIMO RECURSO: CARGAR TODOS Y FILTRAR
  const cargarTodosLosUsuarios = async () => {
    try {
      console.log('🔍 Cargando todos los usuarios para debug...');
      
      const usuariosRef = collection(db, 'usuarios');
      const usuariosSnap = await getDocs(usuariosRef);
      
      console.log(`📊 Total documentos en colección: ${usuariosSnap.size}`);
      
      const todosUsuarios = [];
      usuariosSnap.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        todosUsuarios.push(userData);
        console.log('📋 Usuario:', userData);
      });
      
      // Filtrar padres manualmente
      const padres = todosUsuarios.filter(usuario => 
        usuario.role === 'padre' || usuario.rol === 'padre'
      );
      
      console.log('👥 Padres filtrados manualmente:', padres);
      
      if (padres.length > 0) {
        setUsuariosPadres(padres);
        console.log('✅ Padres cargados mediante filtro manual:', padres.length);
      }
      
    } catch (error) {
      console.error('❌ Error al cargar todos los usuarios:', error);
    }
  };

  const obtenerDatosPadre = (padreId) => {
    return usuariosPadres.find(padre => padre.id === padreId);
  };

  // 🔥 FUNCIONES FIRESTORE PARA HORARIOS

  const cargarHorarioDesdeFirestore = async () => {
    try {
      setLoading(true);
      const horarioRef = doc(db, 'horarios_docentes', user.uid);
      const horarioSnap = await getDoc(horarioRef);
      
      if (horarioSnap.exists()) {
        const horarioData = horarioSnap.data();
        setHorarioDocente(horarioData.horario);
        console.log('✅ Horario cargado desde Firestore:', horarioData.horario);
      } else {
        // Si no existe, crear horario por defecto
        const horarioDefault = inicializarHorarioDefault();
        await guardarHorarioEnFirestore(horarioDefault);
        setHorarioDocente(horarioDefault);
        console.log('🆕 Horario por defecto creado');
      }
    } catch (error) {
      console.error('❌ Error al cargar horario:', error);
      setError('Error al cargar horario: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarHorarioEnFirestore = async (horario = horarioDocente) => {
    try {
      setLoading(true);
      const horarioRef = doc(db, 'horarios_docentes', user.uid);
      
      await setDoc(horarioRef, {
        docenteId: user.uid,
        docenteEmail: user.email,
        docenteName: user.name,
        horario: horario,
        fechaActualizacion: new Date().toISOString(),
        materia: docenteData.subject,
        grado: docenteData.grade
      });
      
      console.log('✅ Horario guardado en Firestore');
      setError('');
      
    } catch (error) {
      console.error('❌ Error al guardar horario:', error);
      setError('Error al guardar horario: ' + error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const inicializarHorarioDefault = () => {
    const horarioDefault = {};
    diasSemana.forEach(dia => {
      horarioDefault[dia] = {};
      horasDisponibles.forEach(hora => {
        // Por defecto, todas las horas están disponibles excepto el receso (10:00-11:00)
        horarioDefault[dia][hora] = hora !== '10:00'; // 10:00 es receso
      });
    });
    return horarioDefault;
  };

  // 🔥 FUNCIONES FIRESTORE PARA CITAS

  const cargarCitasDesdeFirestore = async () => {
    try {
      const citasRef = collection(db, 'citas');
      
      // 🔧 CONSULTA SIMPLIFICADA (sin orderBy) para evitar error de índice
      const q = query(
        citasRef, 
        where('docenteId', '==', user.uid),
        where('semana', '==', obtenerSemanaActual())
      );
      
      const citasSnap = await getDocs(q);
      const citas = [];
      
      citasSnap.forEach((doc) => {
        citas.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // 🔄 ORDENAR MANUALMENTE en el cliente
      citas.sort((a, b) => {
        // Ordenar por día de la semana y luego por hora
        const ordenDias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
        const diaA = ordenDias.indexOf(a.dia);
        const diaB = ordenDias.indexOf(b.dia);
        
        if (diaA !== diaB) {
          return diaA - diaB;
        }
        
        // Si es el mismo día, ordenar por hora
        return a.hora.localeCompare(b.hora);
      });
      
      setCitasSemanaActual(citas);
      console.log('✅ Citas cargadas desde Firestore:', citas);
      
    } catch (error) {
      console.error('❌ Error al cargar citas:', error);
      setError('Error al cargar citas: ' + error.message);
    }
  };

  // 🔥 NUEVA FUNCIÓN PARA CARGAR HISTORIAL COMPLETO
  const cargarHistorialCompleto = async () => {
    try {
      setLoading(true);
      const citasRef = collection(db, 'citas');
      
      // 📋 CONSULTA PARA TODAS LAS CITAS DEL DOCENTE (SIN FILTRO DE SEMANA)
      const q = query(
        citasRef, 
        where('docenteId', '==', user.uid)
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
        // Ordenar por fecha de creación descendente
        const fechaA = new Date(a.fechaCreacion || a.fecha || 0);
        const fechaB = new Date(b.fechaCreacion || b.fecha || 0);
        return fechaB - fechaA;
      });
      
      setHistorialCitas(todasLasCitas);
      console.log('✅ Historial completo cargado:', todasLasCitas.length, 'citas encontradas');
      
    } catch (error) {
      console.error('❌ Error al cargar historial completo:', error);
      setError('Error al cargar historial: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarCitaEnFirestore = async (citaData) => {
    try {
      const citasRef = collection(db, 'citas');
      
      // 📝 OBTENER DATOS COMPLETOS DEL PADRE (SIN ESTUDIANTE)
      const datosPadre = obtenerDatosPadre(citaData.padreId);
      
      const citaCompleta = {
        // IDs de referencia
        docenteId: user.uid,
        padreId: citaData.padreId,
        
        // Datos del docente
        docenteEmail: user.email,
        docenteName: user.name,
        docenteMateria: docenteData.subject,
        docenteGrado: docenteData.grade,
        
        // Datos del padre (desnormalizados para consultas rápidas)
        padreNombre: datosPadre?.nombre || datosPadre?.name || 'Nombre no disponible',
        padreEmail: datosPadre?.email || '',
        padreTelefono: datosPadre?.telefono || datosPadre?.phone || '',
        
        // Datos de la cita
        dia: citaData.dia,
        hora: citaData.hora,
        horaFin: obtenerHoraFin(citaData.hora),
        motivo: citaData.motivo,
        estado: 'Confirmada',
        
        // Datos temporales y de seguimiento
        fecha: obtenerFechaDelDia(citaData.dia),
        semana: obtenerSemanaActual(),
        año: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        
        // Metadatos
        fechaCreacion: new Date().toISOString(),
        creadoPor: user.uid
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

  // 🔥 FUNCIONES UTILITARIAS
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

  const verificarDisponibilidadHora = (dia, hora) => {
    // Verificar si el horario del docente permite esa hora
    if (!horarioDocente[dia]?.[hora]) {
      return false;
    }
    
    // Verificar si ya hay una cita en ese horario
    return !citasSemanaActual.some(cita => 
      cita.dia === dia && cita.hora === hora && cita.estado !== 'Cancelada'
    );
  };

  const obtenerHorasDisponiblesPorDia = (dia) => {
    return horasDisponibles.filter(hora => horarioDocente[dia]?.[hora] === true);
  };

  // 🔥 EFECTOS
  useEffect(() => {
    if (user?.uid) {
      setSemanaActual(obtenerSemanaActual());
      cargarHorarioDesdeFirestore();
      cargarUsuariosPadres(); // 👥 CARGAR USUARIOS AL INICIAR
      cargarHistorialCompleto(); // 📋 CARGAR HISTORIAL COMPLETO AL INICIAR
      verificarNuevaSemana();
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid && Object.keys(horarioDocente).length > 0) {
      cargarCitasDesdeFirestore();
    }
  }, [user?.uid, horarioDocente]);

  // 🔄 NUEVO EFECTO PARA CARGAR HISTORIAL CUANDO SE CAMBIE A ESA SECCIÓN
  useEffect(() => {
    if (activeSection === 'historial' && user?.uid) {
      cargarHistorialCompleto();
    }
  }, [activeSection, user?.uid]);

  const verificarNuevaSemana = () => {
    const ultimaSemana = localStorage.getItem('ultimaSemanaDocente');
    const semanaActualStr = obtenerSemanaActual();
    
    if (ultimaSemana && ultimaSemana !== semanaActualStr) {
      // Es una nueva semana, las citas se moverán automáticamente por la consulta de Firestore
      console.log('🔄 Nueva semana detectada:', semanaActualStr);
    }
    
    localStorage.setItem('ultimaSemanaDocente', semanaActualStr);
  };

  // 🔥 CRUD PARA CITAS
  const handleCreateCita = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // 🚫 VALIDAR QUE HAYA USUARIOS DISPONIBLES
      if (usuariosPadres.length === 0) {
        setError('No hay usuarios registrados. No se pueden crear citas.');
        return;
      }
      
      // 🚫 VALIDAR CAMPOS REQUERIDOS (SIN ESTUDIANTE)
      if (!newCita.padreId) {
        setError('Debe seleccionar un padre de familia');
        return;
      }
      
      // Verificar disponibilidad
      if (!verificarDisponibilidadHora(newCita.dia, newCita.hora)) {
        setError('Ya hay una cita programada en ese horario o no está disponible');
        return;
      }

      // Guardar en Firestore y obtener datos completos
      const citaCompleta = await guardarCitaEnFirestore(newCita);
      
      // Actualizar estado local
      setCitasSemanaActual(prev => [...prev, citaCompleta]);
      setNewCita({ padreId: '', dia: '', hora: '', motivo: '' }); // SIN ESTUDIANTE
      setShowNewCitaModal(false);
      setError('');
      
      console.log('✅ Cita creada exitosamente');
      
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
      
      setCitasSemanaActual(prev => 
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
      setCitasSemanaActual(prev => prev.filter(cita => cita.id !== citaId));
      setError('');
      
    } catch (error) {
      setError('Error al eliminar la cita: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstadoCita = async (citaId, nuevoEstado) => {
    await handleUpdateCita(citaId, { estado: nuevoEstado });
  };

  // 🔥 CRUD PARA HORARIOS
  const handleToggleHorario = (dia, hora) => {
    setHorarioDocente(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [hora]: !prev[dia][hora]
      }
    }));
  };

  const guardarHorario = async () => {
    try {
      await guardarHorarioEnFirestore();
      setShowEditHorarioModal(false);
    } catch (error) {
      // Error ya manejado en guardarHorarioEnFirestore
    }
  };

  // 🔥 FUNCIONES AUXILIARES
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

  const getCitasPorDia = (dia) => {
    return citasSemanaActual.filter(cita => cita.dia === dia);
  };

  const getCitaPorDiaYHora = (dia, hora) => {
    return citasSemanaActual.find(cita => cita.dia === dia && cita.hora === hora);
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
    setNewCita({ ...newCita, [name]: value });
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
  const renderCalendarioSemanal = () => (
    <div className="calendario-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Calendario Semanal</h2>
          <p className="semana-actual">Semana del {semanaActual}</p>
        </div>
        <button 
          className="new-cita-button"
          onClick={() => setShowNewCitaModal(true)}
          disabled={loading}
        >
          + Nueva Cita
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}
      
      <div className="calendario-grid">
        {diasSemana.map(dia => {
          const citasDelDia = getCitasPorDia(dia);
          const horasDisponiblesDelDia = obtenerHorasDisponiblesPorDia(dia);
          
          return (
            <div key={dia} className={`dia-card ${horasDisponiblesDelDia.length === 0 ? 'no-disponible' : ''}`}>
              <div className="dia-header">
                <h3 className="dia-nombre">{dia.charAt(0).toUpperCase() + dia.slice(1)}</h3>
                <span className="citas-count">{citasDelDia.length} citas</span>
                <span className="horario-dia-info">
                  {horasDisponiblesDelDia.length} horas disponibles
                </span>
              </div>
              
              <div className="citas-dia">
                {horasDisponiblesDelDia.length > 0 ? (
                  citasDelDia.length > 0 ? (
                    citasDelDia.map(cita => (
                      <div key={cita.id} className="cita-mini">
                        <div className="cita-time">{cita.hora} - {obtenerHoraFin(cita.hora)}</div>
                        <div className="cita-info">
                          <div className="cita-padre-mini">{cita.padreNombre}</div>
                          <div className="cita-motivo-mini">{cita.motivo}</div>
                          <span className={`status-mini ${cita.estado.toLowerCase()}`}>
                            {cita.estado}
                          </span>
                        </div>
                        <div className="cita-actions-mini">
                          <button 
                            onClick={() => {
                              setSelectedCita(cita);
                              setShowEditCitaModal(true);
                            }}
                            className="action-mini edit"
                            title="Editar"
                          >
                            <PencilIcon className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCita(cita.id)}
                            className="action-mini delete"
                            title="Eliminar"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                          {cita.estado === 'Confirmada' && (
                            <>
                              <button 
                                onClick={() => handleCambiarEstadoCita(cita.id, 'Completada')}
                                className="action-mini complete"
                                title="Completar"
                              >
                                <CheckIcon className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={() => handleCambiarEstadoCita(cita.id, 'Cancelada')}
                                className="action-mini cancel"
                                title="Cancelar"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-citas">Sin citas programadas</div>
                  )
                ) : (
                  <div className="dia-no-disponible">No disponible</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderHorarios = () => (
    <div className="horarios-section">
      <div className="section-header">
        <h2 className="section-title">Mi Horario de Disponibilidad</h2>
        <button 
          className="edit-schedule-button"
          onClick={() => setShowEditHorarioModal(true)}
        >
          Modificar Horario
        </button>
      </div>
      
      {/* 🗓️ TABLA DE HORARIOS TIPO CALENDARIO */}
      <div className="horario-calendario">
        <div className="horario-table">
          <div className="table-header">
            <div className="hora-header">Hora</div>
            {diasSemana.map(dia => (
              <div key={dia} className="dia-header-table">
                {dia.charAt(0).toUpperCase() + dia.slice(1)}
              </div>
            ))}
          </div>
          
          {horasDisponibles.map(hora => (
            <div key={hora} className="table-row">
              <div className="hora-cell">
                <span className="hora-inicio">{hora}</span>
                <span className="hora-fin">{obtenerHoraFin(hora)}</span>
              </div>
              
              {diasSemana.map(dia => {
                const estaDisponible = horarioDocente[dia]?.[hora];
                const cita = getCitaPorDiaYHora(dia, hora);
                
                return (
                  <div 
                    key={`${dia}-${hora}`} 
                    className={`horario-cell ${estaDisponible ? 'disponible' : 'no-disponible'} ${cita ? 'ocupado' : ''}`}
                  >
                    {cita ? (
                      <div className="cita-en-horario">
                        <div className="cita-info-table">
                          <div className="cita-padre-table">{cita.padreNombre}</div>
                          <div className="cita-estado-table">{cita.estado}</div>
                        </div>
                      </div>
                    ) : estaDisponible ? (
                      <div className="disponible-indicator">
                        <span>✓ Disponible</span>
                      </div>
                    ) : (
                      <div className="no-disponible-indicator">
                        <span>✗ No disponible</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      <div className="disponibilidad-section">
        <h3 className="subsection-title">Información sobre Horarios</h3>
        <div className="disponibilidad-info">
          <ul className="horarios-lista">
            <li>🕐 Horario base: 8:00 AM - 3:00 PM (Lunes a Viernes)</li>
            <li>⏰ Cada cita dura 1 hora completa</li>
            <li>☕ Receso sugerido: 10:00 AM - 11:00 AM</li>
            <li>💾 Tu horario se guarda automáticamente en la nube</li>
            <li>🔄 El calendario se reinicia cada semana automáticamente</li>
          </ul>
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

  const renderHistorial = () => (
    <div className="historial-section">
      <div className="section-header">
        <h2 className="section-title">Historial de Citas</h2>
        <div className="historial-stats">
          <span className="stats-item">Total: {historialCitas.length} citas</span>
          <button 
            className="refresh-button"
            onClick={cargarHistorialCompleto}
            disabled={loading}
            title="Actualizar historial"
          >
            {loading ? '🔄' : '↻'} Actualizar
          </button>
        </div>
      </div>
      
      <div className="historial-filters">
        <select className="filter-select">
          <option>Todas las citas</option>
          <option>Completadas</option>
          <option>Canceladas</option>
          <option>Confirmadas</option>
        </select>
        <input type="date" className="filter-date" placeholder="Filtrar por fecha" />
        <div className="filter-info">
          <small>📊 Mostrando todas las citas de todas las semanas</small>
        </div>
      </div>
      
      {loading && (
        <div className="loading-historial">
          <div className="loading-spinner"></div>
          <p>Cargando historial completo...</p>
        </div>
      )}
      
      <div className="citas-list">
        {historialCitas.length > 0 ? (
          historialCitas.map(cita => (
            <div key={cita.id} className="cita-card historial">
              <div className="cita-header">
                <div className="cita-info">
                  <h3 className="cita-padre">{cita.padreNombre}</h3>
                  <p className="cita-email">{cita.padreEmail}</p>
                </div>
                <span className={`status-badge ${cita.estado.toLowerCase()}`}>
                  {cita.estado}
                </span>
              </div>
              
              <div className="cita-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Semana:</span>
                  <span className="detail-value">{cita.semana}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📆 Día:</span>
                  <span className="detail-value">{cita.dia.charAt(0).toUpperCase() + cita.dia.slice(1)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🕐 Hora:</span>
                  <span className="detail-value">{cita.hora} - {obtenerHoraFin(cita.hora)}</span>
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
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>No hay citas en el historial</h3>
            <p>Las citas que programes aparecerán aquí para consulta futura.</p>
            <button 
              className="create-first-cita-button"
              onClick={() => setActiveSection('calendario')}
            >
              Programar Primera Cita
            </button>
          </div>
        )}
      </div>
    </div>
  );

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

      {/* 🔥 MODAL PARA NUEVA CITA - SIN CAMPO ESTUDIANTE */}
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
            
            <form onSubmit={handleCreateCita} className="cita-form">
              {/* 🚨 ALERTA SI NO HAY USUARIOS */}
              {usuariosPadres.length === 0 && (
                <div className="no-users-alert">
                  <p>⚠️ <strong>No hay usuarios registrados</strong></p>
                  <p>No se pueden crear citas hasta que haya padres de familia registrados en la plataforma.</p>
                </div>
              )}
              
              {/* ✅ SOLO CAMPO PADRE - SIN ESTUDIANTE */}
              <div className="form-group">
                <label className="form-label">
                  Padre/Madre de Familia
                  {loadingUsuarios && <span className="loading-text"> (Cargando...)</span>}
                </label>
                <select
                  name="padreId"
                  value={newCita.padreId}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={usuariosPadres.length === 0 || loadingUsuarios}
                >
                  <option value="">
                    {usuariosPadres.length === 0 
                      ? "NO HAY USUARIOS REGISTRADOS" 
                      : "Seleccionar padre/madre"}
                  </option>
                  {usuariosPadres.map(padre => (
                    <option key={padre.id} value={padre.id}>
                      {padre.nombre || padre.name} - {padre.email}
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  💡 La cita se programará directamente con el padre de familia
                </small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Día</label>
                  <select
                    name="dia"
                    value={newCita.dia}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Seleccionar día</option>
                    {diasSemana.map(dia => {
                      const horasDisponibles = obtenerHorasDisponiblesPorDia(dia);
                      return (
                        <option 
                          key={dia} 
                          value={dia}
                          disabled={horasDisponibles.length === 0}
                        >
                          {dia.charAt(0).toUpperCase() + dia.slice(1)} 
                          {horasDisponibles.length > 0 
                            ? ` (${horasDisponibles.length} horas disponibles)`
                            : ' (No disponible)'
                          }
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <select
                    name="hora"
                    value={newCita.hora}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled={!newCita.dia}
                  >
                    <option value="">Seleccionar hora</option>
                    {newCita.dia && obtenerHorasDisponiblesPorDia(newCita.dia).map(hora => (
                      <option 
                        key={hora} 
                        value={hora}
                        disabled={!verificarDisponibilidadHora(newCita.dia, hora)}
                      >
                        {hora} - {obtenerHoraFin(hora)} {!verificarDisponibilidadHora(newCita.dia, hora) && '(Ocupado)'}
                      </option>
                    ))}
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
                  required
                  placeholder="Describa el motivo de la reunión con el padre de familia..."
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
                  disabled={loading || usuariosPadres.length === 0}
                >
                  {loading ? 'Programando...' : 'Programar Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar horario */}
      {showEditHorarioModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2 className="modal-title">Modificar Horario de Disponibilidad</h2>
              <button 
                className="close-button"
                onClick={() => setShowEditHorarioModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="horario-form">
              <p className="form-description">
                Selecciona las horas en las que estarás disponible para recibir citas. Cada cita dura 1 hora.
              </p>
              
              {/* 🗓️ TABLA INTERACTIVA PARA EDITAR HORARIOS */}
              <div className="horario-edit-table">
                <div className="table-header">
                  <div className="hora-header">Hora</div>
                  {diasSemana.map(dia => (
                    <div key={dia} className="dia-header-edit">
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </div>
                  ))}
                </div>
                
                {horasDisponibles.map(hora => (
                  <div key={hora} className="table-row-edit">
                    <div className="hora-cell-edit">
                      <span className="hora-range">{hora} - {obtenerHoraFin(hora)}</span>
                    </div>
                    
                    {diasSemana.map(dia => (
                      <div key={`${dia}-${hora}`} className="horario-cell-edit">
                        <label className="horario-checkbox">
                          <input
                            type="checkbox"
                            checked={horarioDocente[dia]?.[hora] || false}
                            onChange={() => handleToggleHorario(dia, hora)}
                            className="checkbox-input"
                          />
                          <span className="checkbox-custom"></span>
                          <span className="checkbox-label">
                            {horarioDocente[dia]?.[hora] ? 'Disponible' : 'No disponible'}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="horario-actions">
                <button 
                  type="button"
                  className="preset-button"
                  onClick={() => {
                    // Preset: Horario completo (excepto receso)
                    const nuevoHorario = {};
                    diasSemana.forEach(dia => {
                      nuevoHorario[dia] = {};
                      horasDisponibles.forEach(hora => {
                        nuevoHorario[dia][hora] = hora !== '10:00'; // Excluir receso
                      });
                    });
                    setHorarioDocente(nuevoHorario);
                  }}
                >
                  🕐 Horario Completo
                </button>
                
                <button 
                  type="button"
                  className="preset-button"
                  onClick={() => {
                    // Preset: Solo mañanas
                    const nuevoHorario = {};
                    diasSemana.forEach(dia => {
                      nuevoHorario[dia] = {};
                      horasDisponibles.forEach(hora => {
                        const horaNum = parseInt(hora.split(':')[0]);
                        nuevoHorario[dia][hora] = horaNum >= 8 && horaNum <= 11 && hora !== '10:00';
                      });
                    });
                    setHorarioDocente(nuevoHorario);
                  }}
                >
                  🌅 Solo Mañanas
                </button>
                
                <button 
                  type="button"
                  className="preset-button"
                  onClick={() => {
                    // Preset: Limpiar todo
                    const nuevoHorario = {};
                    diasSemana.forEach(dia => {
                      nuevoHorario[dia] = {};
                      horasDisponibles.forEach(hora => {
                        nuevoHorario[dia][hora] = false;
                      });
                    });
                    setHorarioDocente(nuevoHorario);
                  }}
                >
                  🗑️ Limpiar Todo
                </button>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowEditHorarioModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="submit-button"
                  onClick={guardarHorario}
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar Horario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 MODAL PARA EDITAR CITA - SIN CAMPO ESTUDIANTE */}
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
                padreNombre: formData.get('padre'),
                motivo: formData.get('motivo'),
                estado: formData.get('estado')
              };
              handleUpdateCita(selectedCita.id, datosActualizados);
            }} className="cita-form">
              
              <div className="form-group">
                <label className="form-label">Nombre del Padre/Madre</label>
                <input
                  type="text"
                  name="padre"
                  defaultValue={selectedCita.padreNombre}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Día</label>
                  <input
                    type="text"
                    value={selectedCita.dia.charAt(0).toUpperCase() + selectedCita.dia.slice(1)}
                    className="form-input"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hora</label>
                  <input
                    type="text"
                    value={`${selectedCita.hora} - ${obtenerHoraFin(selectedCita.hora)}`}
                    className="form-input"
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Estado</label>
                <select
                  name="estado"
                  defaultValue={selectedCita.estado}
                  className="form-input"
                  required
                >
                  <option value="Confirmada">Confirmada</option>
                  <option value="Completada">Completada</option>
                  <option value="Cancelada">Cancelada</option>
                  <option value="Reprogramada">Reprogramada</option>
                </select>
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
                  {loading ? 'Actualizando...' : 'Actualizar Cita'}
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
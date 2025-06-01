import './App.css';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Ajusta la ruta según tu estructura
import ProtectedRoute from './context/ProtectedRoute'; // Ajusta la ruta según tu estructura
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import DashboardDocente from './views/DashboardDocente';
import DashboardAdministrador from './views/DashboardAdministrador';
import DashboardPadre from './views/DashboardPadre';

// 🔥 COMPONENTE PARA REDIRIGIR AUTOMÁTICAMENTE SEGÚN EL ROL
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 Dashboard - Estado actual:', { 
      user, 
      loading, 
      userRole: user?.role,
      userType: user?.type 
    });

    if (!loading && user) {
      const userRole = user.role || user.type;
      console.log('🚀 Redirigiendo usuario con rol:', userRole);
      
      switch (userRole) {
        case 'padre':
          console.log('📱 Redirigiendo a dashboard-padre');
          navigate('/dashboard-padre', { replace: true });
          break;
          
        case 'docente':
          console.log('👨‍🏫 Redirigiendo a dashboard-docente');
          navigate('/dashboard-docente', { replace: true });
          break;
          
        case 'administrador':
          console.log('⚡ Redirigiendo a dashboard-administrador');
          navigate('/dashboard-administrador', { replace: true });
          break;
          
        default:
          console.error('❌ Rol no reconocido:', userRole);
          console.log('👤 Datos completos del usuario:', user);
          // Por defecto, mostrar mensaje de error
          break;
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '5px solid #f3f3f3',
          borderTop: '5px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>
          Cargando información del usuario...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h2>Dashboard General</h2>
      <p>Determinando tipo de usuario...</p>
      {user && (
        <div style={{ marginTop: '20px', padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
          <p><strong>Debug Info:</strong></p>
          <p>Nombre: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>Type: {user.type}</p>
          <pre style={{ fontSize: '12px', marginTop: '10px' }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas protegidas con roles específicos */}
          <Route 
            path="/dashboard-docente" 
            element={
              <ProtectedRoute allowedRoles={['docente']}>
                <DashboardDocente />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard-administrador" 
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <DashboardAdministrador />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dashboard-padre" 
            element={
              <ProtectedRoute allowedRoles={['padre']}>
                <DashboardPadre />
              </ProtectedRoute>
            } 
          />

          {/* Ruta para cualquier usuario autenticado - AHORA CON REDIRECCIÓN AUTOMÁTICA */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
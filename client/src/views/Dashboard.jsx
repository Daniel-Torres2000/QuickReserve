import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
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
        case 'parent':
          console.log('📱 Redirigiendo a dashboard-padre');
          navigate('/dashboard-padre', { replace: true });
          break;
          
        case 'docente':
        case 'teacher':
          console.log('👨‍🏫 Redirigiendo a dashboard-docente');
          navigate('/dashboard-docente', { replace: true });
          break;
          
        case 'administrador':
        case 'admin':
        case 'administrator':
          console.log('⚡ Redirigiendo a dashboard-administrador');
          navigate('/dashboard-administrador', { replace: true });
          break;
          
        default:
          console.error('❌ Rol no reconocido:', userRole);
          console.log('👤 Datos completos del usuario:', user);
          // Por defecto, redirigir a padre si no se reconoce el rol
          navigate('/dashboard-padre', { replace: true });
      }
    } else if (!loading && !user) {
      console.log('🚫 No hay usuario, redirigiendo a login');
      navigate('/login', { replace: true });
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

export default Dashboard;
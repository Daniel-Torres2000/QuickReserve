import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute - Verificando acceso:', {
    user: user?.name,
    userRole: user?.role || user?.type,
    loading,
    allowedRoles
  });

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
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '15px', color: '#666' }}>
          Verificando permisos...
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

  if (!user) {
    console.log('🚫 No hay usuario autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Si no se especifican roles permitidos, cualquier usuario autenticado puede acceder
  if (allowedRoles.length === 0) {
    console.log('✅ Acceso permitido - Sin restricciones de rol');
    return children;
  }

  // Verificar si el rol del usuario está en los roles permitidos
  const userRole = user.role || user.type;
  const hasPermission = allowedRoles.includes(userRole);

  console.log('🔍 Verificando permisos:', {
    userRole,
    allowedRoles,
    hasPermission
  });

  if (!hasPermission) {
    console.log('❌ Acceso denegado, redirigiendo a dashboard principal');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ Acceso permitido');
  return children;
};

export default ProtectedRoute;
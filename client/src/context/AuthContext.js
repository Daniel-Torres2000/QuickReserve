import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Usuario autenticado en Firebase
          // Intentar obtener datos del localStorage/sessionStorage
          let userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
          
          if (userData) {
            userData = JSON.parse(userData);
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Si no hay datos guardados, limpiar todo
            console.log('Usuario autenticado en Firebase pero sin datos guardados');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // Usuario no autenticado
          setUser(null);
          setIsAuthenticated(false);
          // Limpiar almacenamiento
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const login = (userData, token, remember = false) => {
    try {
      setUser(userData);
      setIsAuthenticated(true);
      
      // Guardar en localStorage o sessionStorage según "remember"
      if (remember) {
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userData', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Error al iniciar sesión');
    }
  };

  const logout = async () => {
    try {
      // Cerrar sesión en Firebase
      await auth.signOut();
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Limpiar almacenamiento
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userData');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const updateUser = (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      setUser(updatedUser);
      
      // Actualizar en el almacenamiento correspondiente
      if (localStorage.getItem('userData')) {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('userData')) {
        sessionStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user && user.role === role;
  };

  // Verificar si el usuario tiene alguno de los roles especificados
  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  // Obtener token actual
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    hasRole,
    hasAnyRole,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
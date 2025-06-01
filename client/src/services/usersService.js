// src/services/usersService.js
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase/firebaseConfig';

// Colección de usuarios en Firestore
const USERS_COLLECTION = 'usuarios';

// Generar contraseña temporal aleatoria
const generateTempPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// CREATE - Crear nuevo usuario
export const createUser = async (userData) => {
  try {
    const tempPassword = generateTempPassword();
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, tempPassword);
    const uid = userCredential.user.uid;
    
    // Preparar datos del usuario para Firestore
    const userDoc = {
      uid,
      nombre: userData.nombre,
      apellido: userData.apellido,
      name: `${userData.nombre} ${userData.apellido}`, // Nombre completo
      email: userData.email,
      telefono: userData.telefono,
      role: userData.role,
      isActive: true,
      mustChangePassword: true,
      tempPassword: tempPassword,
      createdAt: serverTimestamp()
    };
    
    // Guardar en Firestore
    const docRef = await addDoc(collection(db, USERS_COLLECTION), userDoc);
    
    // Retornar el usuario creado con su ID
    return {
      id: docRef.id,
      ...userDoc,
      createdAt: new Date() // Para mostrar inmediatamente
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(`Error al crear usuario: ${error.message}`);
  }
};

// READ - Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const q = query(collection(db, USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
        // Convertir timestamp a fecha legible
        fechaRegistro: doc.data().createdAt?.toDate().toLocaleDateString('es-ES') || 'N/A'
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error(`Error al obtener usuarios: ${error.message}`);
  }
};

// READ - Obtener usuario por ID
export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error(`Error al obtener usuario: ${error.message}`);
  }
};

// READ - Filtrar usuarios por rol
export const getUsersByRole = async (role) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION), 
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
        fechaRegistro: doc.data().createdAt?.toDate().toLocaleDateString('es-ES') || 'N/A'
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw new Error(`Error al filtrar usuarios: ${error.message}`);
  }
};

// READ - Filtrar usuarios por estado
export const getUsersByStatus = async (isActive) => {
  try {
    const q = query(
      collection(db, USERS_COLLECTION), 
      where('isActive', '==', isActive),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
        fechaRegistro: doc.data().createdAt?.toDate().toLocaleDateString('es-ES') || 'N/A'
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error getting users by status:', error);
    throw new Error(`Error al filtrar usuarios: ${error.message}`);
  }
};

// UPDATE - Actualizar usuario
export const updateUser = async (userId, userData) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    
    // Preparar datos actualizados
    const updateData = {
      ...userData,
      name: userData.nombre && userData.apellido ? `${userData.nombre} ${userData.apellido}` : userData.name,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updateData);
    
    // Retornar los datos actualizados
    return {
      id: userId,
      ...updateData,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error(`Error al actualizar usuario: ${error.message}`);
  }
};

// UPDATE - Cambiar estado de usuario (activar/desactivar)
export const toggleUserStatus = async (userId, currentStatus) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const newStatus = !currentStatus;
    
    await updateDoc(docRef, {
      isActive: newStatus,
      updatedAt: serverTimestamp()
    });
    
    return newStatus;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw new Error(`Error al cambiar estado del usuario: ${error.message}`);
  }
};

// UPDATE - Resetear contraseña de usuario
export const resetUserPassword = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const newTempPassword = generateTempPassword();
    
    await updateDoc(docRef, {
      tempPassword: newTempPassword,
      mustChangePassword: true,
      updatedAt: serverTimestamp()
    });
    
    return newTempPassword;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error(`Error al resetear contraseña: ${error.message}`);
  }
};

// DELETE - Eliminar usuario
export const deleteUser = async (userId) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error(`Error al eliminar usuario: ${error.message}`);
  }
};

// STATS - Obtener estadísticas de usuarios
export const getUserStats = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    
    const stats = {
      totalUsuarios: 0,
      docentesActivos: 0,
      coordinadores: 0,
      administradores: 0,
      padres: 0,
      usuariosActivos: 0,
      usuariosInactivos: 0
    };
    
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      stats.totalUsuarios++;
      
      // Contar por rol
      if (userData.role === 'docente') stats.docentesActivos++;
      else if (userData.role === 'coordinador') stats.coordinadores++;
      else if (userData.role === 'administrador') stats.administradores++;
      else if (userData.role === 'padre') stats.padres++;
      
      // Contar por estado
      if (userData.isActive) stats.usuariosActivos++;
      else stats.usuariosInactivos++;
    });
    
    return stats;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new Error(`Error al obtener estadísticas: ${error.message}`);
  }
};
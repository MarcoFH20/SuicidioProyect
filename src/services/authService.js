import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Iniciar sesión y obtener datos de Firestore
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 🔍 Buscar en Firestore al usuario por UID
    const userRef = doc(db, 'usuarios', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        error: 'El usuario no está registrado en la base de datos.',
      };
    }

    const userData = userSnap.data();

    // ✅ Devuelve tanto el user como su rol
    return {
      success: true,
      user: user,
      rol: userData.rol?.toLowerCase() || null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Cerrar sesión del usuario actual
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Escuchar si hay un usuario autenticado
 */
export function onUserStateChange(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

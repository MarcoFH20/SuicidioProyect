import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  startAfter,
  startAt,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './firebase';

const storage = getStorage();

// === 🕹️ JUEGOS ===

export async function obtenerJuegos() {
  const juegosRef = collection(db, 'juegos');
  const snapshot = await getDocs(juegosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function crearJuego(datos) {
  const juegosRef = collection(db, 'juegos');
  const docRef = await addDoc(juegosRef, datos);
  return docRef.id;
}

export async function actualizarJuego(id, datos) {
  const docRef = doc(db, 'juegos', id);
  await updateDoc(docRef, datos);
}

export async function eliminarJuego(id) {
  const docRef = doc(db, 'juegos', id);
  await deleteDoc(docRef);
}

// === 👤 USUARIOS ===

export async function obtenerUsuarios(limitNumber = 10, cursor = null, reverse = false) {
  const usuariosRef = collection(db, 'usuarios');
  let q;

  if (cursor) {
    if (!reverse) {
      q = query(usuariosRef, orderBy('nombres'), startAfter(cursor), limit(limitNumber));
    } else {
      q = query(usuariosRef, orderBy('nombres'), startAt(cursor), limit(limitNumber));
    }
  } else {
    q = query(usuariosRef, orderBy('nombres'), limit(limitNumber));
  }

  const snapshot = await getDocs(q);
  const usuarios = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      uid: doc.id,
      nombres: data.nombres || "",
      apellidos: data.apellidos || "",
      email: data.email || "",
      rol: data.rol || "usuario",
      telefono: data.telefono || "",
      juegoAsignado: data.juegoAsignado || ""
    };
  });

  return {
    usuarios,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    firstDoc: snapshot.docs[0] || null,
  };
}

export async function crearUsuario(datos) {
  if (!datos.uid) throw new Error("No se proporcionó UID para el usuario");
  const docRef = doc(db, 'usuarios', datos.uid);
  await setDoc(docRef, datos);
  return { success: true };
}

export async function actualizarUsuario(id, datos) {
  const docRef = doc(db, "usuarios", id);
  await updateDoc(docRef, datos);
}

export async function eliminarUsuario(id) {
  const docRef = doc(db, "usuarios", id);
  await deleteDoc(docRef);
}

// === 🎟️ TICKETS ===

export async function obtenerTickets() {
  const ticketsRef = collection(db, 'tickets');
  const snapshot = await getDocs(ticketsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function obtenerTicketPorSerie(serie) {
  const ticketsRef = collection(db, 'tickets');
  const q = query(ticketsRef, where('serie', '==', serie));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function crearTicket(datos) {
  const ticketsRef = collection(db, 'tickets');
  const docRef = await addDoc(ticketsRef, datos);
  return docRef.id;
}

export async function actualizarTicket(id, datos) {
  const docRef = doc(db, 'tickets', id);
  await updateDoc(docRef, datos);
}

// === 📅 EVENTOS ===

export async function obtenerEventos() {
  const eventosRef = collection(db, 'eventos');
  const snapshot = await getDocs(eventosRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// === 📌 RESERVAS ===

export async function obtenerReservas() {
  const reservasRef = collection(db, 'reservas');
  const snapshot = await getDocs(reservasRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

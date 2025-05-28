import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export async function getUsuarios() {
  try {
    const usuariosRef = collection(db, "usuarios");
    const snapshot = await getDocs(usuariosRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}

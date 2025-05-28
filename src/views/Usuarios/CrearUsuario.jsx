import React, { useState } from 'react';
import { crearUsuario } from '@services/firestoreService'; // tu servicio Firestore
import { auth } from '@services/firebase'; // o ruta correcta
import { createUserWithEmailAndPassword } from 'firebase/auth';

const CrearUsuario = ({ onClose, onUsuarioCreado }) => {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    rol: 'usuario',
    telefono: '',
    juegoAsignado: '',
    password: '',  // agregar contraseña para crear el usuario en Auth
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const uid = userCredential.user.uid;

      // 2. Crear usuario en Firestore con UID
      const userData = { ...form };
      delete userData.password; // no guardes la contraseña en Firestore
      userData.uid = uid;        // importante enviar el UID

      await crearUsuario(userData);

      setLoading(false);
      onUsuarioCreado(); // refrescar lista
      onClose();
    } catch (err) {
      setError(err.message || 'Error creando usuario. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Crear Nuevo Usuario</h3>
        <form onSubmit={handleSubmit}>
          <label>Nombres:</label>
          <input name="nombres" value={form.nombres} onChange={handleChange} required />

          <label>Apellidos:</label>
          <input name="apellidos" value={form.apellidos} onChange={handleChange} required />

          <label>Email:</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />

          <label>Contraseña:</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />

          <label>Rol:</label>
          <select name="rol" value={form.rol} onChange={handleChange} required>
            <option value="admin">Admin</option>
            <option value="operador">Operador</option>
            <option value="usuario">Usuario</option>
          </select>

          <label>Teléfono:</label>
          <input name="telefono" value={form.telefono} onChange={handleChange} />

          <label>Juego Asignado:</label>
          <input name="juegoAsignado" value={form.juegoAsignado} onChange={handleChange} />

          {error && <p className="error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default CrearUsuario;

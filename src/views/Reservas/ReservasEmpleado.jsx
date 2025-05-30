// src/views/ReservasEmpleado.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import './ReservasEmpleado.css';

const ReservasEmpleado = () => {
  const [reservas, setReservas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    const obtenerReservas = async () => {
      const snapshot = await getDocs(collection(db, 'reservas_salones'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservas(lista);
    };
    obtenerReservas();
  }, []);

  const actualizarEstado = async (id, nuevoEstado) => {
    await updateDoc(doc(db, 'reservas_salones', id), { estado: nuevoEstado });
    setReservas(prev =>
      prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r)
    );
  };

  const reservasFiltradas = reservas.filter(r =>
    filtroEstado === 'todos' ? true : r.estado === filtroEstado
  );

  return (
    <main className="reservas-empleado">
      <section className="usuario-header">
        <h2>📅 Gestión de Reservas</h2>
        <p>Desde aquí puedes ver y actualizar el estado de reservas de salones.</p>
      </section>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="estado">Filtrar por estado: </label>
        <select
          id="estado"
          value={filtroEstado}
          onChange={e => setFiltroEstado(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
          <option value="finalizada">Finalizada</option>
        </select>
      </div>

      <table className="tabla-reservas">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Fecha</th>
            <th>Salón</th>
            <th>Personas</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservasFiltradas.map(reserva => (
            <tr key={reserva.id}>
              <td>{reserva.nombreUsuario}</td>
              <td>{reserva.email}</td>
              <td>{reserva.telefono}</td>
              <td>{
                reserva.timestamp?.seconds
                  ? new Date(reserva.timestamp.seconds * 1000).toLocaleDateString('es-GT')
                  : reserva.fecha || '—'
              }</td>
              <td>{reserva.salon}</td>
              <td>{reserva.personas}</td>
              <td>
                <span
                  style={{
                    color:
                      reserva.estado === 'confirmada' ? 'green' :
                      reserva.estado === 'finalizada' ? 'blue' : 'crimson'
                  }}
                >
                  {reserva.estado}
                </span>
              </td>
              <td>
                {reserva.estado === 'confirmada' && (
                  <>
                    <button
                      onClick={() => actualizarEstado(reserva.id, 'finalizada')}
                      style={{ marginRight: '5px', backgroundColor: 'blue', color: 'white' }}
                    >
                      Finalizar
                    </button>
                    <button
                      onClick={() => actualizarEstado(reserva.id, 'cancelada')}
                      style={{ backgroundColor: 'crimson', color: 'white' }}
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => window.location.href = '/inicio'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Volver al Menú Principal
        </button>
      </div>
    </main>
  );
};

export default ReservasEmpleado;
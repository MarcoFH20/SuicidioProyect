// src/views/Admin/ReservasAdmin.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './ReservasAdmin.css';
import { useNavigate } from 'react-router-dom';

const ReservasAdmin = () => {
  const [reservas, setReservas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroSalon, setFiltroSalon] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerReservas = async () => {
      const snapshot = await getDocs(collection(db, 'reservas_salones'));
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservas(lista);
    };
    obtenerReservas();
  }, []);

  const eliminarReserva = async (id) => {
    const confirmacion = confirm('¿Estás seguro que deseas eliminar esta reserva?');
    if (!confirmacion) return;
    await deleteDoc(doc(db, 'reservas_salones', id));
    setReservas(prev => prev.filter(r => r.id !== id));
  };

  const exportarCSV = () => {
    const encabezado = ['Nombre', 'Correo', 'Teléfono', 'Fecha', 'Salón', 'Personas', 'Estado'];
    const filas = reservasFiltradas.map(r => [
      r.nombreUsuario, r.email, r.telefono,
      r.timestamp?.seconds ? new Date(r.timestamp.seconds * 1000).toLocaleDateString('es-GT') : r.fecha,
      r.salon, r.personas, r.estado
    ]);
    const contenido = [encabezado, ...filas].map(e => e.join(',')).join('\n');

    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reservas.csv';
    a.click();
  };

  const exportarPDF = () => {
    const docPDF = new jsPDF();
    docPDF.text('Historial de Reservas', 14, 10);
    autoTable(docPDF, {
      startY: 20,
      head: [['Nombre', 'Correo', 'Teléfono', 'Fecha', 'Salón', 'Personas', 'Estado']],
      body: reservasFiltradas.map(r => [
        r.nombreUsuario, r.email, r.telefono,
        r.timestamp?.seconds ? new Date(r.timestamp.seconds * 1000).toLocaleDateString('es-GT') : r.fecha,
        r.salon, r.personas, r.estado
      ])
    });
    docPDF.save('reservas.pdf');
  };

  const reservasFiltradas = reservas.filter(r => {
    const cumpleEstado = filtroEstado === 'todos' || r.estado === filtroEstado;
    const cumpleSalon = filtroSalon === 'todos' || r.salon === filtroSalon;
    const cumpleFecha = !filtroFecha || (r.timestamp?.seconds && new Date(r.timestamp.seconds * 1000).toLocaleDateString('en-CA') === filtroFecha);
    return cumpleEstado && cumpleSalon && cumpleFecha;
  });

  return (
    <main className="reservas-empleado">
      <section className="usuario-header">
        <h2>📊 Gestión de Reservas</h2>
        <p>Desde aquí puedes consultar, filtrar y exportar el historial de reservas.</p>
      </section>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          <label htmlFor="estado">Estado: </label>
          <select id="estado" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
            <option value="finalizada">Finalizada</option>
          </select>
        </div>
        <div>
          <label htmlFor="salon">Salón: </label>
          <select id="salon" value={filtroSalon} onChange={e => setFiltroSalon(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="Salón Grande">Salón Grande</option>
            <option value="Salón Mediano">Salón Mediano</option>
            <option value="Salón Pequeño">Salón Pequeño</option>
          </select>
        </div>
        <div>
          <label htmlFor="fecha">Fecha: </label>
          <input type="date" id="fecha" value={filtroFecha} onChange={e => setFiltroFecha(e.target.value)} />
        </div>
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
                <span style={{
                  color:
                    reserva.estado === 'confirmada' ? 'green' :
                    reserva.estado === 'finalizada' ? 'blue' : 'crimson'
                }}>{reserva.estado}</span>
              </td>
              <td>
                <button
                  onClick={() => eliminarReserva(reserva.id)}
                  style={{ backgroundColor: 'darkred', color: 'white' }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button onClick={exportarCSV} style={{ marginRight: '1rem' }}>Exportar a CSV</button>
        <button onClick={exportarPDF} style={{ marginRight: '1rem' }}>Exportar a PDF</button>
        <button onClick={() => navigate('/dashboard')} style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 20px', borderRadius: '6px', border: 'none' }}>
          ← Volver al Menú Principal
        </button>
      </div>
    </main>
  );
};

export default ReservasAdmin;

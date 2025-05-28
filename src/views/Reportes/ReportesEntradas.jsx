import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Tooltip,
  Cell,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#6b7280'];

const ReportesEntradas = () => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipoEntrada, setFiltroTipoEntrada] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [pagina, setPagina] = useState(1);
  const porPagina = 5;

  useEffect(() => {
    const obtener = async () => {
      try {
        const snap = await getDocs(collection(db, 'reportes'));
        const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReportes(lista);
      } catch (error) {
        console.error('Error al obtener reportes:', error);
      }
    };
    obtener();
  }, []);

  const abrirModal = (reporte) => {
    setDetalleSeleccionado(reporte);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setDetalleSeleccionado(null);
  };

  const filtrar = () => {
    return reportes.filter((r) => {
      const esModulo = r.modulo === 'entradas';
      const esTipo = filtroTipo ? r.tipo === filtroTipo : true;
      const esEstado = filtroEstado ? r.estado === filtroEstado : true;
      const esTipoEntrada = filtroTipoEntrada ? r.tipoEntrada === filtroTipoEntrada : true;

      let fechaBase = r.exportado_en || r.fecha;
      if (!fechaBase) return false;
      const fecha = new Date(fechaBase);
      if (isNaN(fecha.getTime())) return false;

      const ahora = new Date();
      const porDefectoInicio = new Date();
      porDefectoInicio.setMonth(ahora.getMonth() - 1);

      const inicio = fechaInicio ? new Date(fechaInicio) : porDefectoInicio;
      const fin = fechaFin ? new Date(fechaFin) : ahora;

      return fecha.getTime() >= inicio.getTime() && fecha.getTime() <= fin.getTime()
        && esModulo && esTipo && esEstado && esTipoEntrada;
    });
  };

  const exportarExcel = () => {
    const filtrados = filtrar();
    if (filtrados.length === 0) return alert('No hay datos para exportar');

    const data = filtrados.map((r) => ({
      Tipo: r.tipo || '-',
      Descripción: r.descripcion || '-',
      Estado: r.estado || '-',
      Serie: r.serie || '-',
      TipoEntrada: r.tipoEntrada || '-',
      FechaEmision: r.fecha_emision || '-',
      FechaValidacion: r.fecha_validacion || '-',
      Fecha:
        r.exportado_en
          ? new Date(r.exportado_en).toLocaleString()
          : r.fecha
            ? new Date(r.fecha).toLocaleString()
            : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reportes Entradas');
    XLSX.writeFile(wb, 'ReportesEntradas.xlsx');
  };

  const exportarPDF = () => {
    const filtrados = filtrar();
    if (filtrados.length === 0) return alert('No hay datos para exportar');

    const docu = new jsPDF();
    docu.text('Reportes de Entradas', 14, 16);

    const rows = filtrados.map((r) => [
      r.tipo || '-',
      r.descripcion || '-',
      r.estado || '-',
      r.serie || '-',
      r.tipoEntrada || '-',
      r.fecha_emision || '-',
      r.fecha_validacion || '-',
      r.exportado_en
        ? new Date(r.exportado_en).toLocaleString()
        : r.fecha
          ? new Date(r.fecha).toLocaleString()
          : '-',
    ]);

    autoTable(docu, {
      head: [
        [
          'Tipo',
          'Descripción',
          'Estado',
          'Serie',
          'Tipo Entrada',
          'Fecha Emisión',
          'Fecha Validación',
          'Fecha',
        ],
      ],
      body: rows,
      startY: 20,
    });

    docu.save('ReportesEntradas.pdf');
  };

  const reportesFiltrados = filtrar();
  const totalPaginas = Math.ceil(reportesFiltrados.length / porPagina);
  const paginaActual = reportesFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Resumen para gráficas
  const resumenEstado = reportes.filter((r) => r.modulo === 'entradas').reduce((acc, r) => {
    const estado = r.estado || 'desconocido';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {});

  const dataResumen = Object.entries(resumenEstado).map(([name, value]) => ({ name, value }));

  return (
    <div className="usuarios-container">
      <h3 style={{ marginBottom: '0.5rem' }}>Reportes de Entradas</h3>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
          <option value="manual">Manual</option>
        </select>

        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="valido">Válido</option>
          <option value="usado">Usado</option>
        </select>

        <select value={filtroTipoEntrada} onChange={(e) => setFiltroTipoEntrada(e.target.value)}>
          <option value="">Todos los tipos de entrada</option>
          <option value="Entrada General">Entrada General</option>
          <option value="Entrada VIP">Entrada VIP</option>
          <option value="Entrada Niño">Entrada Niño</option>
        </select>

        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />

        <button onClick={exportarExcel}>Exportar Excel</button>
        <button onClick={exportarPDF}>Exportar PDF</button>
      </div>

      <div style={{ width: '100%', height: 300, marginBottom: '2rem' }}>
        <ResponsiveContainer>
          <BarChart data={dataResumen}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ width: '100%', height: 300, marginBottom: '2rem' }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={dataResumen}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {dataResumen.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <table className="usuarios-tabla">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Serie</th>
            <th>Tipo Entrada</th>
            <th>Fecha Emisión</th>
            <th>Fecha Validación</th>
            <th>Fecha</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {paginaActual.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center' }}>
                No hay reportes
              </td>
            </tr>
          ) : (
            paginaActual.map((r) => (
              <tr key={r.id}>
                <td>{r.tipo || '-'}</td>
                <td>{r.descripcion || '-'}</td>
                <td>{r.estado || '-'}</td>
                <td>{r.serie || '-'}</td>
                <td>{r.tipoEntrada || '-'}</td>
                <td>{r.fecha_emision || '-'}</td>
                <td>{r.fecha_validacion || '-'}</td>
                <td>
                  {r.exportado_en
                    ? new Date(r.exportado_en).toLocaleString()
                    : r.fecha
                      ? new Date(r.fecha).toLocaleString()
                      : '-'}
                </td>
                <td>
                  <button
                    onClick={() => abrirModal(r)}
                    style={{
                      padding: '4px 8px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal para detalles */}
      <Modal
        isOpen={modalAbierto}
        onRequestClose={cerrarModal}
        contentLabel="Detalles del Reporte"
        style={{
          content: {
            maxWidth: '600px',
            width: '90%',
            margin: 'auto',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            background: '#fff',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          },
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>🎟️ Detalles del Reporte</h2>
        {detalleSeleccionado && (
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: '1.6rem' }}>
            <li>
              <strong>🧾 Tipo:</strong> {detalleSeleccionado.tipo}
            </li>
            <li>
              <strong>📜 Descripción:</strong> {detalleSeleccionado.descripcion}
            </li>
            <li>
              <strong>🔒 Estado:</strong> {detalleSeleccionado.estado}
            </li>
            <li>
              <strong>🔢 Serie:</strong> {detalleSeleccionado.serie}
            </li>
            <li>
              <strong>🎫 Tipo Entrada:</strong> {detalleSeleccionado.tipoEntrada}
            </li>
            <li>
              <strong>📅 Fecha Emisión:</strong> {detalleSeleccionado.fecha_emision || '-'}
            </li>
            <li>
              <strong>✅ Fecha Validación:</strong> {detalleSeleccionado.fecha_validacion || '-'}
            </li>
            <li>
              <strong>🕓 Fecha:</strong>{' '}
              {new Date(detalleSeleccionado.fecha || detalleSeleccionado.exportado_en).toLocaleString()}
            </li>
          </ul>
        )}
        <button
          onClick={cerrarModal}
          style={{
            marginTop: '1.5rem',
            display: 'block',
            width: '100%',
            padding: '0.6rem',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Cerrar
        </button>
      </Modal>
    </div>
  );
};

export default ReportesEntradas;

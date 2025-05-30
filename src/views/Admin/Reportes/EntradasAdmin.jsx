import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // 👈 ESTA es la forma correcta
import { useNavigate } from 'react-router-dom';

const EntradasAdmin = () => {
  const [boletos, setBoletos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [busquedaSerie, setBusquedaSerie] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerBoletos = async () => {
      const querySnapshot = await getDocs(collection(db, 'boletos'));
      const datos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBoletos(datos);
    };

    obtenerBoletos();
  }, []);

  // 🔍 Aplicar filtros y búsqueda
  const filtrarBoletos = boletos.filter(b =>
    (filtroTipo === '' || b.tipo === filtroTipo) &&
    (filtroEstado === '' || b.estado === filtroEstado) &&
    (busquedaSerie === '' || b.serie.toLowerCase().includes(busquedaSerie.toLowerCase()))
  );

  const totalPaginas = Math.ceil(filtrarBoletos.length / itemsPorPagina);

  const boletosPaginados = filtrarBoletos.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );


  const exportarPDF = () => {
  const doc = new jsPDF();
    doc.text('Historial de Entradas', 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [['Serie', 'Tipo', 'Fecha Emisión', 'Fecha Validación', 'Estado']],
      body: filtrarBoletos.map(b => [
      b.serie,
      b.tipo,
      b.fecha_emision || '—',
      b.fecha_entrada_parque || '—',
      b.estado
    ])
  });
  doc.save('entradas.pdf');
};

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', color: '#ff6b00' }}>🎟️ Historial de Entradas</h2>
      <p style={{ textAlign: 'center' }}>Desde aquí puedes ver y administrar los boletos validados del sistema.</p>

      {/* Filtros */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        <div>
          <label><strong>Tipo:</strong> </label>
          <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPaginaActual(1); }}>
            <option value="">Todos</option>
            <option value="Entrada VIP">Entrada VIP</option>
            <option value="Entrada General">Entrada General</option>
            <option value="Entrada Niño">Entrada Niño</option>
          </select>
        </div>

        <div>
          <label><strong>Estado:</strong> </label>
          <select value={filtroEstado} onChange={e => { setFiltroEstado(e.target.value); setPaginaActual(1); }}>
            <option value="">Todos</option>
            <option value="valido">Válido</option>
            <option value="usado">Usado</option>
            <option value="vencido">Vencido</option>
          </select>
        </div>

        <div>
          <label><strong>Buscar por serie:</strong> </label>
          <input
            type="text"
            value={busquedaSerie}
            onChange={(e) => { setBusquedaSerie(e.target.value); setPaginaActual(1); }}
            placeholder="Ej: GEN-abc123..."
            style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>

      {/* Tabla */}
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden' }}>
          <thead style={{ backgroundColor: '#007bff', color: 'white' }}>
            <tr>
              <th style={{ padding: '12px' }}>Serie</th>
              <th style={{ padding: '12px' }}>Tipo</th>
              <th style={{ padding: '12px' }}>Fecha Emisión</th>
              <th style={{ padding: '12px' }}>Fecha Validación</th>
              <th style={{ padding: '12px' }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {boletosPaginados.map(boleto => (
              <tr key={boleto.id} style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                <td style={{ padding: '10px' }}>{boleto.serie}</td>
                <td style={{ padding: '10px' }}>{boleto.tipo}</td>
                <td style={{ padding: '10px' }}>{boleto.fecha_emision || '—'}</td>
                <td style={{ padding: '10px' }}>{boleto.fecha_entrada_parque || '—'}</td>
                <td style={{ padding: '10px' }}>{boleto.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
        <button
          onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
          style={{
            padding: '8px 16px',
            marginRight: '10px',
            backgroundColor: paginaActual === 1 ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: paginaActual === 1 ? 'default' : 'pointer'
          }}
        >
          ← Anterior
        </button>

        <span style={{ margin: '0 15px', fontWeight: 'bold' }}>
          Página {paginaActual} de {totalPaginas}
        </span>

        <button
          onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
          disabled={paginaActual === totalPaginas}
          style={{
            padding: '8px 16px',
            marginLeft: '10px',
            backgroundColor: paginaActual === totalPaginas ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: paginaActual === totalPaginas ? 'default' : 'pointer'
          }}
        >
          Siguiente →
        </button>
      </div>

      {/* Exportar */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <CSVLink
          data={filtrarBoletos}
          filename="entradas.csv"
          className="btn btn-outline-primary"
          style={{ marginRight: '1rem', padding: '10px 20px', border: '1px solid #007bff', color: '#007bff', borderRadius: '6px', textDecoration: 'none' }}
        >
          Exportar a CSV
        </CSVLink>

        <button
          onClick={exportarPDF}
          style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Exportar a PDF
        </button>
      </div>

      {/* Botón volver */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ← Volver al Menú Principal
        </button>
      </div>
    </div>
  );
};

export default EntradasAdmin;

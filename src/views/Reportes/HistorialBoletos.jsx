import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/services/firebase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const HistorialBoletos = () => {
  const [boletos, setBoletos] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const fetchBoletos = async () => {
      try {
        const snap = await getDocs(collection(db, 'boletos'));
        const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const usados = lista.filter(b => b.estado === 'usado');
        setBoletos(usados);
      } catch (error) {
        console.error('Error obteniendo boletos usados:', error);
      }
    };
    fetchBoletos();
  }, []);

  const filtrados = boletos.filter(b =>
    JSON.stringify(b).toLowerCase().includes(filtro.toLowerCase())
  );

  const exportarExcel = () => {
    const data = filtrados.map(b => ({
      Tipo: b.tipo,
      Serie: b.serie,
      'Fecha Emision': b.fecha_emision,
      'Fecha Validacion': b.fecha_validacion,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BoletosUsados');
    XLSX.writeFile(wb, 'Historial_Boletos_Usados.xlsx');
  };

  const exportarPDF = () => {
    const docu = new jsPDF();
    docu.text('Historial de Boletos Usados', 14, 16);
    const rows = filtrados.map(b => [
      b.tipo,
      b.serie,
      b.fecha_emision,
      b.fecha_validacion,
    ]);
    autoTable(docu, {
      head: [['Tipo', 'Serie', 'Fecha Emision', 'Fecha Validacion']],
      body: rows,
      startY: 20,
    });
    docu.save('Historial_Boletos_Usados.pdf');
  };

  return (
    <section className="usuarios-container">
      <h2>🎟️ Historial de Boletos Usados</h2>
      <p>Consulta todos los boletos que han sido validados en el sistema.</p>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar en el historial..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ padding: '0.5rem', marginRight: '1rem', width: '40%' }}
        />
        <button onClick={exportarExcel} style={{ marginRight: '0.5rem' }}>
          📥 Exportar Excel
        </button>
        <button onClick={exportarPDF}>
          🧾 Exportar PDF
        </button>
      </div>

      <table className="usuarios-tabla">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Serie</th>
            <th>Fecha Emision</th>
            <th>Fecha Validacion</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>No hay boletos usados</td>
            </tr>
          ) : (
            filtrados.map(b => (
              <tr key={b.id}>
                <td>{b.tipo}</td>
                <td>{b.serie}</td>
                <td>{b.fecha_emision}</td>
                <td>{b.fecha_validacion || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};

export default HistorialBoletos;

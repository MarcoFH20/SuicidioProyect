import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import ReportesJuegos from '../Juegos/ReportesJuegos';
import ReportesEntradas from './ReportesEntradas';

const Reportes = () => {
  const [moduloActivo, setModuloActivo] = useState('juegos');
  const navigate = useNavigate(); // Hook para navegación

  return (
    <div className="usuarios-container" style={{ padding: '1rem' }}>
      <h2>Reportes Generales</h2>
      <p style={{ marginBottom: '0.5rem' }}>
        Selecciona un módulo para ver sus reportes específicos
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <button
          className={moduloActivo === 'juegos' ? 'boton-primario' : ''}
          onClick={() => setModuloActivo('juegos')}
          style={{ marginRight: '10px' }}
        >
          Reportes de Juegos
        </button>

        <button
          className={moduloActivo === 'entradas' ? 'boton-primario' : ''}
          onClick={() => setModuloActivo('entradas')}
          style={{ marginRight: '10px' }}
        >
          Reportes de Entradas
        </button>

        {/* Botón para volver al menú principal usando navigate */}
        <button onClick={() => navigate('/inicio')}>Volver al Inicio</button>
      </div>

      {moduloActivo === 'juegos' && <ReportesJuegos />}
      {moduloActivo === 'entradas' && <ReportesEntradas />}
    </div>
  );
};

export default Reportes;

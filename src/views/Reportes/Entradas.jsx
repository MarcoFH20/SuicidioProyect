// src/views/Reportes/Entradas.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Entradas.css';

const Entradas = () => {
  const navigate = useNavigate();

  return (
    <main className="entradas-container">
      <section className="entradas-bienvenida">
        <h2>🎟️ Vista de Entradas</h2>
        <p>Aquí se mostrarán las entradas escaneadas o registradas.</p>

        <button
          className="btn-volver"
          onClick={() => navigate('/inicio')}
          style={{
            marginTop: '30px',
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🔙 Volver al Menú Principal
        </button>
      </section>
    </main>
  );
};

export default Entradas;

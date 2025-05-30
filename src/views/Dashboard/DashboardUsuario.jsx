// src/views/Dashboard/DashboardUsuario.jsx
import React from 'react';
import './DashboardUsuario.css';
import { useNavigate } from 'react-router-dom';

const DashboardUsuario = () => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <main className="usuario-dashboard">
      <section className="usuario-header">
        <h2>🎟️ Bienvenido al panel <span>de Empleado</span></h2>
        <p>Explora las funciones disponibles según tu rol en el parque.</p>
      </section>

      <div className="usuario-modulos">
        <div className="usuario-card" onClick={() => navigate('/juegos')}>
          <h3>🎮 Juegos</h3>
          <p>Accede a los juegos que estás operando.</p>
        </div>

        <div className="usuario-card" onClick={() => navigate('/reportes/escaner')}>
          <h3>🔹 Escáner</h3>
          <p>Escanea los boletos de ingreso con código QR.</p>
        </div>

        <div className="usuario-card" onClick={() => navigate('/reservas')}>
          <h3>🏠 Reservas</h3>
          <p>Consulta y gestiona las reservas de salones.</p>
        </div>

        <div className="usuario-card" onClick={cerrarSesion}>
          <h3>🚪 Cerrar sesión</h3>
          <p>Salir del sistema y volver al inicio.</p>
        </div>
      </div>
    </main>
  );
};

export default DashboardUsuario;

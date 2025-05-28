// src/views/Inicio/Inicio.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layoutBase/Header';
import NavBar from '../../components/layoutBase/NavBar';
import Footer from '../../components/layoutBase/Footer';
import './Inicio.css';

const Inicio = () => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <NavBar rol={localStorage.getItem('rol')} />

      <div className="inicio-container">
        <h2>Bienvenido a <span>Diversión Infinita 🎠</span></h2>
        <p className="descripcion">
          Explora las funciones disponibles desde el panel superior. <br />
          Podrás visualizar juegos activos, escanear boletos y consultar entradas registradas.
        </p>

        <div className="tarjetas-usuario">
          <div className="tarjeta">
            🎮 <h3>Juegos</h3>
            <p>Consulta la lista de juegos disponibles en el parque.</p>
            <button onClick={() => navigate('/juegos')}>Ir a Juegos</button>
          </div>

          <div className="tarjeta">
            📷 <h3>Escáner</h3>
            <p>Escanea los boletos de acceso de los visitantes.</p>
            <button onClick={() => navigate('/reportes/escaner')}>Ir a Escáner</button>
          </div>

          <div className="tarjeta">
            🎫 <h3>Entradas</h3>
            <p>Revisa las entradas registradas y su estado.</p>
            <button onClick={() => navigate('/reportes/entradas')}>Ver Entradas</button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Inicio;

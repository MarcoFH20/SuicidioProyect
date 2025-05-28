// src/views/Juegos/Juegos.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { db } from '@/services/firebase';
import EscanerJuego from '@/components/layoutBase/EscanerJuego';
import './Juegos.css';

// Importa las imágenes locales
import MontañaRusaImg from '@/assets/MontañaRusa.jpg';
import RuletaImg from '@/assets/Ruleta.jpg';
import AutosChoconesImg from '@/assets/AutosChocones.jpg';
import CarruselImg from '@/assets/Carrusel.jpg';
import TrenecitoImg from '@/assets/Trenecito.jpg';

const imagenesMuestra = {
  "Montaña Rusa": MontañaRusaImg,
  "Ruleta": RuletaImg,
  "AutosChocones": AutosChoconesImg,
  "Carrusel": CarruselImg,
  "Trenecito": TrenecitoImg,
  "default": MontañaRusaImg,
};

const Juegos = () => {
  const [juegos, setJuegos] = useState([]);
  const [juegoSeleccionado, setJuegoSeleccionado] = useState(null);
  const navigate = useNavigate(); // Usa el hook aquí

  useEffect(() => {
    const fetchJuegos = async () => {
      const juegosSnapshot = await getDocs(collection(db, 'juegos'));
      const juegosList = juegosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJuegos(juegosList);
    };
    fetchJuegos();
  }, []);

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'activo': return '#d1fae5';
      case 'mantenimiento': return '#e5e7eb';
      case 'fuera de servicio': return '#fee2e2';
      default: return '#f3f4f6';
    }
  };

  return (
    <main className="juegos-container">
      {!juegoSeleccionado ? (
        <>
          <section className="juegos-bienvenida">
            <h2>📈 Juegos Disponibles</h2>
            <p>Selecciona un juego para gestionar su acceso y control.</p>
          </section>

          <div className="juegos-grid">
            {juegos.map(juego => (
              <div
                key={juego.id}
                className="juego-card"
                onClick={() => juego.estado === 'activo' && setJuegoSeleccionado(juego)}
                style={{ backgroundColor: obtenerColorEstado(juego.estado), cursor: juego.estado === 'activo' ? 'pointer' : 'not-allowed' }}
              >
                <img src={imagenesMuestra[juego.nombre] || imagenesMuestra.default} alt={juego.nombre} className="juego-img" />
                <h3>{juego.nombre}</h3>
                <p>{juego.descripcion || 'Sin descripción.'}</p>
                <p><strong>🎮 Tipo:</strong> {juego.tipo || 'General'}</p>
                <p><strong>👥 Capacidad:</strong> {juego.capacidad_minima} - {juego.capacidad_maxima}</p>
                <p><strong>🔁 Ciclos:</strong> {juego.ciclos_actuales || 0}</p>
                <p><strong>⚙️ Estado:</strong> {juego.estado}</p>
              </div>
            ))}
          </div>

          {/* Botón para volver al menú principal */}
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
        </>
      ) : (
        <>
          <button className="btn-volver-inicio" onClick={() => setJuegoSeleccionado(null)}>
            ⬅️ Volver a la lista de juegos
          </button>
          <EscanerJuego juegoId={juegoSeleccionado.id} />
        </>
      )}
    </main>
  );
};

export default Juegos;

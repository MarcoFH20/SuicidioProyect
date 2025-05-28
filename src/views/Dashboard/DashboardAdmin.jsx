// src/views/Dashboard/DashboardAdmin.jsx
import React from 'react';
import './DashboardAdmin.css';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

const DashboardAdmin = () => {
  const navigate = useNavigate();

  const cerrarSesion = () => {
    localStorage.removeItem('rol');
    navigate('/');
  };

  const inicializarAsientosTodosLosJuegos = async () => {
    const confirmacion = confirm('¿Deseas inicializar los asientos de todos los juegos? Esto reemplazará los actuales.');

    if (!confirmacion) return;

    try {
      const juegosSnapshot = await getDocs(collection(db, 'juegos'));

      for (const juegoDoc of juegosSnapshot.docs) {
        const juegoData = juegoDoc.data();
        const capacidad = juegoData.capacidad_maxima;

        if (!capacidad || isNaN(capacidad)) {
          console.warn(`❌ El juego "${juegoData.nombre}" no tiene capacidad válida.`);
          continue;
        }

        const asientos = {};
        for (let i = 1; i <= capacidad; i++) {
          asientos[`A${i}`] = 'libre';
        }

        await updateDoc(doc(db, 'juegos', juegoDoc.id), { asientos });
        console.log(`✅ Asientos inicializados para: ${juegoData.nombre}`);
      }

      alert('✅ Asientos inicializados correctamente para todos los juegos.');
    } catch (error) {
      console.error('⚠️ Error al inicializar asientos:', error);
      alert('❌ Ocurrió un error al inicializar los asientos.');
    }
  };

  return (
    <main className="admin-dashboard">
      <section className="admin-header">
        <h2>Bienvenido al panel <span>Administrativo</span> 👨‍💼</h2>
        <p>Gestiona usuarios, juegos, reportes y más desde este panel central.</p>
      </section>

      <div className="admin-modules">
        <div className="admin-card" onClick={() => navigate('/usuarios')}>
          <h3>👥 Usuarios</h3>
          <p>Administra los usuarios del sistema.</p>
        </div>

        <div className="admin-card" onClick={() => navigate('/reportes')}>
          <h3>📊 Reportes</h3>
          <p>Revisa estadísticas, entradas y escaneos.</p>
        </div>

        <div className="admin-card" onClick={() => navigate('/reportes/escaner-admin')}>
          <h3>🔍 Escáner Admin</h3>
          <p>Accede al módulo de validación de boletos desde el rol administrativo.</p>
        </div>

        <div className="admin-card" onClick={() => navigate('/Admin/juegos')}>
          <h3>🎮 Juegos</h3>
          <p>Gestiona los juegos activos y operadores asignados.</p>
        </div>

        <div className="admin-card" onClick={cerrarSesion}>
          <h3>🚪 Cerrar sesión</h3>
          <p>Salir del sistema y volver al inicio.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={inicializarAsientosTodosLosJuegos}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🛠️ Inicializar Asientos de Juegos
        </button>
      </div>
    </main>
  );
};

export default DashboardAdmin;

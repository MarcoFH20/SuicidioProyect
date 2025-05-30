import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/firebase';
import Swal from 'sweetalert2';
import './JuegosAdmin.css';

import MontañaRusaImg from '@/assets/MontañaRusa.jpg';
import RuletaImg from '@/assets/Ruleta.jpg';
import AutosChoconesImg from '@/assets/AutosChocones.jpg';
import CarruselImg from '@/assets/Carrusel.jpg';
import TrenecitoImg from '@/assets/Trenecito.jpg';
import TazasVoladorasImg from '@/assets/tazas-voladoras.jpg';
import DragoncitoImg from '@/assets/Dragoncito.jpg'

import { subirImagenDesdeFrontend } from '@/services/uploadService';

const imagenesMuestra = {
  "Montaña Rusa": MontañaRusaImg,
  "Ruleta": RuletaImg,
  "AutosChocones": AutosChoconesImg,
  "Carrusel": CarruselImg,
  "Trenecito": TrenecitoImg,
  "Tazas Voladoras": TazasVoladorasImg,
  "Dragoncito": DragoncitoImg,
  "default": MontañaRusaImg,
};

const JuegosAdmin = () => {
  const [juegos, setJuegos] = useState([]);
  const [juegosFiltrados, setJuegosFiltrados] = useState([]);
  const [crearModo, setCrearModo] = useState(false);
  const [editarModo, setEditarModo] = useState(false);
  const [juegoEditando, setJuegoEditando] = useState(null);

  const [formJuego, setFormJuego] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    capacidad_minima: '',
    capacidad_maxima: '',
    ciclos_actuales: 0,
    estado: 'activo',
  });

  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    cargarJuegos();
  }, []);

  useEffect(() => {
    let filtrados = juegos;
    if (busqueda.trim() !== '') {
      const busquedaLower = busqueda.toLowerCase();
      filtrados = filtrados.filter(j =>
        j.nombre.toLowerCase().includes(busquedaLower) ||
        (j.tipo && j.tipo.toLowerCase().includes(busquedaLower))
      );
    }
    if (filtroEstado !== '') {
      filtrados = filtrados.filter(j => j.estado === filtroEstado);
    }
    setJuegosFiltrados(filtrados);
  }, [busqueda, filtroEstado, juegos]);

  const cargarJuegos = async () => {
    const juegosSnapshot = await getDocs(collection(db, 'juegos'));
    const juegosList = juegosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setJuegos(juegosList);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormJuego(prev => ({ ...prev, [name]: value }));
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    setArchivoImagen(file);
    setPreviewImagen(URL.createObjectURL(file));
  };

  const abrirCrear = () => {
    setFormJuego({
      nombre: '',
      descripcion: '',
      tipo: '',
      capacidad_minima: '',
      capacidad_maxima: '',
      ciclos_actuales: 0,
      estado: 'activo',
    });
    setArchivoImagen(null);
    setPreviewImagen(null);
    setCrearModo(true);
    setEditarModo(false);
    setJuegoEditando(null);
  };

  const abrirEditar = (juego) => {
    setFormJuego({
      nombre: juego.nombre,
      descripcion: juego.descripcion || '',
      tipo: juego.tipo,
      capacidad_minima: juego.capacidad_minima,
      capacidad_maxima: juego.capacidad_maxima,
      ciclos_actuales: juego.ciclos_actuales || 0,
      estado: juego.estado,
    });
    setArchivoImagen(null);
    setPreviewImagen(juego.imagenURL || null);
    setJuegoEditando(juego);
    setEditarModo(true);
    setCrearModo(false);
  };

  const handleCrearJuego = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      let urlImagen = null;
      if (archivoImagen) {
        urlImagen = await subirImagenDesdeFrontend(archivoImagen);
      }
      await addDoc(collection(db, 'juegos'), {
        ...formJuego,
        capacidad_minima: Number(formJuego.capacidad_minima),
        capacidad_maxima: Number(formJuego.capacidad_maxima),
        ciclos_actuales: Number(formJuego.ciclos_actuales),
        imagenURL: urlImagen || null,
      });
      Swal.fire('Éxito', 'Juego creado correctamente', 'success');
      setCrearModo(false);
      cargarJuegos();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleEditarJuego = async (e) => {
    e.preventDefault();
    if (!juegoEditando) return;
    setCargando(true);
    try {
      let urlImagen = null;
      if (archivoImagen) {
        urlImagen = await subirImagenDesdeFrontend(archivoImagen);
      }
      const juegoRef = doc(db, 'juegos', juegoEditando.id);
      const datosActualizados = {
        ...formJuego,
        capacidad_minima: Number(formJuego.capacidad_minima),
        capacidad_maxima: Number(formJuego.capacidad_maxima),
        ciclos_actuales: Number(formJuego.ciclos_actuales),
      };
      if (urlImagen) {
        datosActualizados.imagenURL = urlImagen;
      }
      await updateDoc(juegoRef, datosActualizados);
      Swal.fire('Éxito', 'Juego actualizado correctamente', 'success');
      setEditarModo(false);
      setJuegoEditando(null);
      cargarJuegos();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarJuego = (juego) => {
    Swal.fire({
      title: `¿Eliminar "${juego.nombre}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, 'juegos', juego.id));
          Swal.fire('Eliminado', 'El juego fue eliminado', 'success');
          cargarJuegos();
        } catch (error) {
          Swal.fire('Error', error.message, 'error');
        }
      }
    });
  };

  return (
    <main className="juegos-container">
      <section className="juegos-bienvenida">
        <h2>🎮 Gestión de Juegos - Admin</h2>
        <p>Desde aquí puedes crear, editar y eliminar juegos.</p>
      </section>

      {!crearModo && !editarModo && (
        <>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="Buscar por nombre o tipo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '1rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                width: '250px',
              }}
            />
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: '1rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                width: '180px',
              }}
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="fuera de servicio">Fuera de servicio</option>
            </select>
          </div>

          <button className="btn-crear" onClick={abrirCrear}>➕ Crear Nuevo Juego</button>
          <div className="juegos-grid">
            {juegosFiltrados.map(juego => (
              <div
                key={juego.id}
                className="juego-card"
                style={{ cursor: 'default', backgroundColor: '#fff' }}
              >
                <img
                  src={juego.imagenURL || imagenesMuestra[juego.nombre] || imagenesMuestra.default}
                  alt={juego.nombre}
                  className="juego-img"
                />
                <h3>{juego.nombre}</h3>
                <p>{juego.descripcion || 'Sin descripción.'}</p>
                <p><strong>Tipo:</strong> {juego.tipo || 'General'}</p>
                <p><strong>Capacidad:</strong> {juego.capacidad_minima} - {juego.capacidad_maxima}</p>
                <p><strong>Ciclos actuales:</strong> {juego.ciclos_actuales || 0}</p>
                <p><strong>Estado:</strong> {juego.estado}</p>

                <div style={{ marginTop: '10px' }}>
                  <button className="btn-editar" onClick={() => abrirEditar(juego)}>✏️ Editar</button>
                  <button className="btn-eliminar" onClick={() => handleEliminarJuego(juego)} style={{ marginLeft: '10px' }}>🗑️ Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {(crearModo || editarModo) && (
        <form className="form-crear-juego" onSubmit={crearModo ? handleCrearJuego : handleEditarJuego}>
          <h3>{crearModo ? 'Crear Nuevo Juego' : 'Editar Juego'}</h3>

          <label>Nombre*:</label>
          <input type="text" name="nombre" value={formJuego.nombre} onChange={handleInputChange} required />

          <label>Descripción:</label>
          <textarea name="descripcion" value={formJuego.descripcion} onChange={handleInputChange} />

          <label>Tipo*:</label>
          <input type="text" name="tipo" value={formJuego.tipo} onChange={handleInputChange} required />

          <label>Capacidad mínima*:</label>
          <input type="number" name="capacidad_minima" value={formJuego.capacidad_minima} onChange={handleInputChange} required min={0} />

          <label>Capacidad máxima*:</label>
          <input type="number" name="capacidad_maxima" value={formJuego.capacidad_maxima} onChange={handleInputChange} required min={0} />

          <label>Ciclos actuales:</label>
          <input type="number" name="ciclos_actuales" value={formJuego.ciclos_actuales} onChange={handleInputChange} min={0} />

          <label>Estado:</label>
          <select name="estado" value={formJuego.estado} onChange={handleInputChange}>
            <option value="activo">Activo</option>
            <option value="mantenimiento">Mantenimiento</option>
            <option value="fuera de servicio">Fuera de servicio</option>
          </select>

          <label>Imagen (opcional):</label>
          <input type="file" accept="image/*" onChange={handleArchivoChange} />
          {previewImagen && (
            <img
              src={previewImagen}
              alt="Preview"
              style={{ width: '120px', height: '80px', objectFit: 'cover', marginTop: '10px', borderRadius: '8px' }}
            />
          )}

          {cargando ? (
            <p style={{ color: '#555', marginTop: '15px' }}>⏳ Subiendo imagen y guardando datos...</p>
          ) : (
            <div style={{ marginTop: '15px' }}>
              <button type="submit" className="btn-guardar" disabled={cargando}>
                {crearModo ? 'Crear Juego' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => {
                  setCrearModo(false);
                  setEditarModo(false);
                  setArchivoImagen(null);
                  setPreviewImagen(null);
                }}
                style={{ marginLeft: '10px' }}
                disabled={cargando}
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      )}

      <button
        className="btn-volver"
        onClick={() => navigate('/inicio')}
        style={{ marginTop: '30px' }}
      >
        🔙 Volver al Menú Principal
      </button>
    </main>
  );
};

export default JuegosAdmin;

// Archivo: EscanerJuego.jsx
import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useNavigate } from 'react-router-dom';

function EscanerJuego({ juegoId }) {
  const [mensaje, setMensaje] = useState('');
  const [color, setColor] = useState('black');
  const [asientos, setAsientos] = useState([]);
  const [capacidadMax, setCapacidadMax] = useState(0);
  const [capacidadMin, setCapacidadMin] = useState(0);
  const [ocupados, setOcupados] = useState(0);
  const scannerRef = useRef(null);
  const [scannerActivo, setScannerActivo] = useState(false);
  const [duracion, setDuracion] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    cargarAsientos();
    return () => detenerScanner();
  }, []);

  const cargarAsientos = async () => {
    const juegoSnap = await getDoc(doc(db, 'juegos', juegoId));
    const juego = juegoSnap.data();
    const asientosArray = Object.entries(juego.asientos || {}).map(([clave, estado]) => ({ numero: clave, estado }));
    setAsientos(asientosArray);
    setCapacidadMax(juego.capacidad_maxima);
    setCapacidadMin(juego.capacidad_minima);
    setDuracion(juego.duracion_ciclo || 5);
    setOcupados(asientosArray.filter(a => a.estado === 'ocupado').length);
  };

  const iniciarScanner = () => {
    if (scannerActivo) return;
    const qrCodeScanner = new Html5Qrcode("qr-reader-juego");
    scannerRef.current = qrCodeScanner;
    qrCodeScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      handleScanSuccess,
      () => {}
    ).then(() => {
      setScannerActivo(true);
    }).catch(console.error);
  };

  const detenerScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setScannerActivo(false);
      }).catch(console.error);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    detenerScanner();
    let datosQR;

    try {
      datosQR = JSON.parse(decodedText);
    } catch {
      setMensaje('❌ QR no válido');
      setColor('crimson');
      return;
    }

    const serie = datosQR.serie;
    const q = query(collection(db, 'boletos'), where('serie', '==', serie));
    const res = await getDocs(q);

    if (res.empty) {
      setMensaje('❌ Boleto no encontrado');
      setColor('crimson');
      return;
    }

    const boletoDoc = res.docs[0];
    const data = boletoDoc.data();

    if (data.estado !== 'usado') {
      setMensaje('⚠️ Primero debe validar su boleto en la entrada');
      setColor('orange');
      return;
    }

    if (!data.acceso_juegos || data.acceso_juegos.toLowerCase() !== 'sí') {
      setMensaje('⛔ Este boleto no permite subir a juegos');
      setColor('gray');
      return;
    }

    if (data.juegos_maximos !== 'ilimitados') {
      const restantes = parseInt(data.juegos_maximos);
      if (restantes <= 0 || isNaN(restantes)) {
        setMensaje('🚫 Este boleto ya no tiene juegos disponibles');
        setColor('gray');
        return;
      }
      await updateDoc(doc(db, 'boletos', boletoDoc.id), {
        juegos_maximos: restantes - 1
      });
    }

    const juegoSnap = await getDoc(doc(db, 'juegos', juegoId));
    const juego = juegoSnap.data();

    const libre = Object.entries(juego.asientos).find(([_, v]) => v === 'libre');
    if (!libre) {
      setMensaje('❌ No hay asientos disponibles');
      setColor('gray');
      return;
    }

    const [clave, _] = libre;
    const nuevosAsientos = { ...juego.asientos, [clave]: 'ocupado' };
    await updateDoc(doc(db, 'juegos', juegoId), { asientos: nuevosAsientos });
    cargarAsientos();

    setMensaje(`✅ Acceso al juego concedido. Asiento ${clave} asignado.`);
    setColor('green');

    setTimeout(() => {
      setMensaje('');
      iniciarScanner();
    }, 3000);
  };

  const iniciarCiclo = async () => {
    const juegoRef = doc(db, 'juegos', juegoId);
    const snap = await getDoc(juegoRef);
    const juego = snap.data();
    const ocupadosCount = Object.values(juego.asientos).filter(v => v === 'ocupado').length;

    if (ocupadosCount < Number(juego.capacidad_minima)) {
      Swal.fire({
        icon: 'warning',
        title: 'No se puede iniciar el ciclo',
        text: `Se requieren al menos ${juego.capacidad_minima} personas.`,
        confirmButtonColor: '#f97316'
      });
      return;
    }

    setProgreso(0);
    let progresoTemp = 0;
    const incremento = 100 / (duracion * 10);
    const timer = setInterval(() => {
      progresoTemp += incremento;
      setProgreso(progresoTemp);
      if (progresoTemp >= 100) {
        clearInterval(timer);
        ejecutarCiclo(juegoRef, juego, ocupadosCount);
      }
    }, 100);
  };

  const ejecutarCiclo = async (juegoRef, juego, ocupadosCount) => {
    const nuevosAsientos = {};
    Object.keys(juego.asientos).forEach(key => {
      nuevosAsientos[key] = 'libre';
    });

    const nuevosCiclos = (juego.ciclos_actuales || 0) + 1;
    const maxCiclos = juego.mantenimiento_cada || 9999;
    const nuevoEstado = nuevosCiclos >= maxCiclos ? 'mantenimiento' : juego.estado;

    await updateDoc(juegoRef, {
      asientos: nuevosAsientos,
      ciclos_actuales: nuevosCiclos,
      estado: nuevoEstado
    });

    await addDoc(collection(db, 'juegos', juegoId, 'historial_ciclos'), {
      fecha_inicio: new Date().toISOString(),
      cantidad_personas: ocupadosCount,
      usuario: 'admin'
    });

    setProgreso(0);
    cargarAsientos();
    setMensaje('');

    Swal.fire({
      icon: 'success',
      title: 'Ciclo finalizado',
      text: `Ciclo completado con ${ocupadosCount} personas.`,
      confirmButtonColor: '#10b981'
    });
  };

  return (
    <section className="escaner-bienvenida">
      <h2>🎮 Escáner de Juegos</h2>
      <p>Valida boletos que tienen acceso a juegos y asigna asiento disponible.</p>

      {!scannerActivo ? (
        <button className="btn-activar" onClick={iniciarScanner}>Activar escáner</button>
      ) : (
        <button className="btn-detener" onClick={detenerScanner}>Detener escáner</button>
      )}

      <div id="qr-reader-juego" style={{ width: '300px', margin: '1rem auto' }}></div>
      {mensaje && <p className="mensaje-estado" style={{ color }}>{mensaje}</p>}

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={iniciarCiclo}
          style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          🎢 Iniciar Ciclo
        </button>
        <div style={{ marginTop: '10px', width: '100%', backgroundColor: '#eee', height: '10px', borderRadius: '5px' }}>
          <div style={{ width: `${progreso}%`, backgroundColor: '#10b981', height: '10px', borderRadius: '5px', transition: 'width 0.1s linear' }}></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2rem', justifyContent: 'center' }}>
        {asientos.map((a, i) => (
          <div key={i} style={{
            padding: '6px 12px',
            borderRadius: '4px',
            backgroundColor: a.estado === 'ocupado' ? '#ef4444' : '#10b981',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {a.numero}: {a.estado}
          </div>
        ))}
      </div>
    </section>
  );
}

export default EscanerJuego;
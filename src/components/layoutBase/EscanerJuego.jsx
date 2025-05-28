// Archivo: EscanerJuego.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';

function EscanerJuego({ juegoId }) {
  const [mensaje, setMensaje] = useState('');
  const [color, setColor] = useState('black');
  const [asientos, setAsientos] = useState([]);
  const [capacidadMax, setCapacidadMax] = useState(0);
  const [capacidadMin, setCapacidadMin] = useState(0);
  const [ocupados, setOcupados] = useState(0);
  const [scannerActivo, setScannerActivo] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [encargado, setEncargado] = useState(null);
  let scanner = null;

  useEffect(() => {
    cargarAsientos();
    cargarHistorial();
    cargarEncargado();
    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, []);

  const iniciarScanner = () => {
    const qrContainerId = 'qr-reader-juego';
    const qrContainer = document.getElementById(qrContainerId);
    if (qrContainer && qrContainer.innerHTML.trim() !== '') return;

    scanner = new Html5QrcodeScanner(qrContainerId, { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scanner.render(handleScanSuccess, () => {});
    setScannerActivo(true);
  };

  const cargarAsientos = async () => {
    const juegoRef = doc(db, 'juegos', juegoId);
    const snap = await getDoc(juegoRef);
    const juego = snap.data();

    if (juego.estado === 'mantenimiento') {
      setMensaje('🛠️ Este juego está en mantenimiento.');
      setColor('gray');
      return;
    }

    const asientosArray = Object.entries(juego.asientos || {}).map(([clave, estado]) => ({ numero: clave.replace('A', ''), estado }));
    setAsientos(asientosArray);
    setCapacidadMax(juego.capacidad_maxima);
    setCapacidadMin(juego.capacidad_minima);
    setOcupados(asientosArray.filter(a => a.estado === 'ocupado').length);
  };

  const cargarHistorial = async () => {
    const historialRef = collection(db, 'juegos', juegoId, 'historial_ciclos');
    const querySnapshot = await getDocs(historialRef);
    const data = querySnapshot.docs.map(doc => doc.data());
    setHistorial(data);
  };

  const cargarEncargado = async () => {
    const usuariosRef = collection(db, 'usuarios');
    const q = query(usuariosRef, where('juego_asignado', '==', juegoId));
    const res = await getDocs(q);
    if (!res.empty) {
      const encargado = res.docs[0].data();
      setEncargado(`${encargado.nombres} ${encargado.apellidos}`);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    if (ocupados >= capacidadMax) {
      setMensaje('🚫 Capacidad máxima alcanzada. No se permiten más ingresos.');
      setColor('gray');
      return;
    }

    const boletosRef = collection(db, 'boletos');
    const q = query(boletosRef, where('serie', '==', decodedText));
    const res = await getDocs(q);

    if (res.empty) {
      setMensaje('❌ Boleto no encontrado');
      setColor('crimson');
      return;
    }

    const boletoDoc = res.docs[0];
    const data = boletoDoc.data();

    if (data.estado !== 'usado') {
      setMensaje('⚠️ El boleto debe estar validado en la entrada del parque');
      setColor('orange');
      return;
    }

    const juegoRef = doc(db, 'juegos', juegoId);
    const juegoSnap = await getDoc(juegoRef);
    const juego = juegoSnap.data();

    const claveLibre = Object.entries(juego.asientos).find(([_, estado]) => estado === 'libre');
    if (!claveLibre) {
      setMensaje('❌ No hay asientos disponibles');
      setColor('gray');
      return;
    }

    const [clave, _] = claveLibre;
    const nuevosAsientos = { ...juego.asientos, [clave]: 'ocupado' };

    await updateDoc(juegoRef, { asientos: nuevosAsientos });
    cargarAsientos();
    setMensaje(`✅ Asiento ${clave} asignado correctamente.`);
    setColor('green');
  };

  const iniciarCiclo = async () => {
    const juegoRef = doc(db, 'juegos', juegoId);
    const snap = await getDoc(juegoRef);
    const juego = snap.data();
    const ocupadosCount = Object.values(juego.asientos).filter(v => v === 'ocupado').length;

    if (ocupadosCount >= Number(juego.capacidad_minima)) {
      const nuevosAsientos = {};
      Object.keys(juego.asientos).forEach(key => {
        nuevosAsientos[key] = 'libre';
      });

      const nuevosCiclos = (juego.ciclos_actuales || 0) + 1;

      await updateDoc(juegoRef, {
        asientos: nuevosAsientos,
        ciclos_actuales: nuevosCiclos
      });

      await addDoc(collection(db, 'juegos', juegoId, 'historial_ciclos'), {
        fecha_inicio: new Date().toISOString(),
        cantidad_personas: ocupadosCount,
        usuario: 'admin'
      });

      await addDoc(collection(db, 'reportes'), {
        tipo: 'ciclo_iniciado',
        modulo: 'juegos',
        fecha: new Date().toISOString(),
        nombreJuego: juego.nombre,
        cantidad_personas: ocupadosCount,
        nuevo_ciclo: nuevosCiclos,
        usuario: 'admin'
      });

      cargarAsientos();
      setMensaje(`✔️ Ciclo iniciado correctamente con ${ocupadosCount} personas.`);
      setColor('green');
      cargarHistorial();
    } else {
      const min = Number(juego.capacidad_minima);
      setMensaje(`❌ Se requieren al menos ${min} personas para iniciar el ciclo.`);
      setColor('red');
      Swal.fire({
        icon: 'warning',
        title: 'No se puede iniciar el ciclo',
        text: `Se requieren al menos ${min} personas.`,
        confirmButtonColor: '#f97316'
      });
    }
  };

  return (
    <div>
      <h3>Escáner de Juego</h3>
      <p><strong>Ocupados:</strong> {ocupados} / {capacidadMax}</p>
      {encargado && <p><strong>Encargado:</strong> {encargado}</p>}

      {!scannerActivo && (
        <button onClick={iniciarScanner} style={{ padding: '6px 14px', marginBottom: '1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px' }}>
          📷 Activar cámara
        </button>
      )}

      <div id="qr-reader-juego" style={{ marginBottom: '1rem' }}></div>
      <p style={{ color, fontWeight: 'bold' }}>{mensaje}</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
        {asientos.map((a, i) => (
          <div key={i} style={{
            padding: '6px 12px',
            borderRadius: '4px',
            backgroundColor: a.estado === 'ocupado' ? '#ef4444' : '#10b981',
            color: 'white',
            fontWeight: 'bold'
          }}>
            A{a.numero}: {a.estado}
          </div>
        ))}
      </div>

      <button onClick={iniciarCiclo} style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        🎢 Iniciar ciclo
      </button>

      {historial.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4>📊 Historial de Ciclos</h4>
          <ul>
            {historial.map((h, i) => (
              <li key={i}>
                {new Date(h.fecha_inicio).toLocaleString()} — {h.cantidad_personas} personas
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default EscanerJuego;
  
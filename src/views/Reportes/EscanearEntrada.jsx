// src/views/Reportes/EscanearEntrada.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useNavigate } from 'react-router-dom';
import './EscanearEntrada.css';

const EscanearEntrada = () => {
  const [mensaje, setMensaje] = useState('');
  const [color, setColor] = useState('black');
  const [scannerActivo, setScannerActivo] = useState(false);
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  const iniciarScanner = () => {
    if (scannerActivo) return;

    const qrCodeScanner = new Html5Qrcode("qr-reader");
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
    let datosQR;

    try {
      datosQR = JSON.parse(decodedText);
      console.log("Texto escaneado:", datosQR);
    } catch (error) {
      setMensaje('❌ QR no válido');
      setColor('crimson');
      return;
    }

    const serie = datosQR.serie;

    if (!serie) {
      setMensaje('❌ Serie no encontrada en QR');
      setColor('crimson');
      return;
    }

    const q = query(collection(db, 'boletos'), where('serie', '==', serie));
    const res = await getDocs(q);

    if (res.empty) {
      setMensaje('❌ Boleto no encontrado');
      setColor('crimson');
      return;
    }

    const boletoDoc = res.docs[0];
    const data = boletoDoc.data();

    if (data.estado === 'usado') {
      setMensaje('⚠️ Boleto ya fue utilizado');
      setColor('orange');
    } else if (data.acceso_parque?.toLowerCase() !== 'sí') {
      setMensaje('⛔ Sin acceso al parque');
      setColor('gray');
    } else {
      await updateDoc(doc(db, 'boletos', boletoDoc.id), { estado: 'usado' });
      setMensaje('✅ Acceso al parque concedido');
      setColor('green');
    }
  };

  useEffect(() => {
    return () => detenerScanner();
  }, []);

  return (
    <section className="escaner-bienvenida">
      <h2>📲 Escaneo de Entradas</h2>
      <p>Apunta el código QR y valida automáticamente el acceso al parque.</p>

      {!scannerActivo ? (
        <button className="btn-activar" onClick={iniciarScanner}>Activar escáner</button>
      ) : (
        <button className="btn-detener" onClick={detenerScanner}>Detener escáner</button>
      )}

      <div id="qr-reader" style={{ width: '300px', margin: '1rem auto' }}></div>
      {mensaje && <p className="mensaje-estado" style={{ color }}>{mensaje}</p>}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => navigate('/inicio')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          🔙 Volver al Menú Principal
        </button>
      </div>
    </section>
  );
};

export default EscanearEntrada;

// src/views/Reportes/EscanearEntrada.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@services/firebase';
import successSound from '@assets/success.mp3';
import errorSound from '@assets/error.mp3';
import './EscanearEntrada.css';
import { useNavigate } from 'react-router-dom'; // ✅ import necesario

const EscanearEntrada = () => {
  const [mensaje, setMensaje] = useState('');
  const [color, setColor] = useState('black');
  const [scannerActivo, setScannerActivo] = useState(false);
  const scannerRef = useRef(null);
  const successAudio = useRef(null);
  const errorAudio = useRef(null);
  const navigate = useNavigate(); // ✅ inicializar navegación

  const iniciarScanner = () => {
    if (scannerActivo) return;

    successAudio.current = new Audio(successSound);
    errorAudio.current = new Audio(errorSound);

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
    const q = query(collection(db, 'boletos'), where('serie', '==', decodedText));
    const res = await getDocs(q);

    if (res.empty) {
      setMensaje('❌ Boleto no encontrado');
      setColor('crimson');
      errorAudio.current?.play();
      return;
    }

    const boletoDoc = res.docs[0];
    const data = boletoDoc.data();
    const hoy = new Date();
    const fechaVal = new Date(data.fecha_validacion);

    if (data.estado === 'usado') {
      setMensaje('⚠️ Boleto ya fue utilizado');
      setColor('orange');
      errorAudio.current?.play();
    } else if (hoy > fechaVal) {
      setMensaje('⏰ Boleto vencido');
      setColor('gray');
      errorAudio.current?.play();
    } else {
      await updateDoc(doc(db, 'boletos', boletoDoc.id), { estado: 'usado' });
      setMensaje('✅ Boleto válido y registrado como usado');
      setColor('green');
      successAudio.current?.play();
    }
  };

  useEffect(() => () => detenerScanner(), []);

  return (
    <section className="escaner-bienvenida">
      <h2>📲 Escaneo de Entradas</h2>
      <p>Apunta el código QR y valida automáticamente el estado del boleto.</p>

      {!scannerActivo ? (
        <button className="btn-activar" onClick={iniciarScanner}>Activar escáner</button>
      ) : (
        <button className="btn-detener" onClick={detenerScanner}>Detener escáner</button>
      )}

      <div id="qr-reader" style={{ width: '300px', margin: '1rem auto' }}></div>
      {mensaje && <p className="mensaje-estado" style={{ color }}>{mensaje}</p>}

      {/* ✅ Botón para volver al menú */}
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

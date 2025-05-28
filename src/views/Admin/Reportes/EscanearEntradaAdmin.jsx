// src/views/Admin/Reportes/EscanearEntradaAdmin.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@services/firebase';
import successSound from '@/assets/success.mp3';
import errorSound from '@/assets/error.mp3';
import './EscanearEntradaAdmin.css';

const EscanearEntradaAdmin = () => {
  const [mensaje, setMensaje] = useState('');
  const [color, setColor] = useState('black');
  const [scannerActivo, setScannerActivo] = useState(false);
  const scannerRef = useRef(null);
  const successAudio = useRef(null);
  const errorAudio = useRef(null);
  const navigate = useNavigate();

  const iniciarScanner = () => {
    if (scannerActivo) return;

    successAudio.current = new Audio(successSound);
    errorAudio.current = new Audio(errorSound);

    const qrCodeScanner = new Html5Qrcode('qr-reader');
    scannerRef.current = qrCodeScanner;

    qrCodeScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      handleScanSuccess,
      handleScanError
    ).then(() => {
      setScannerActivo(true);
    }).catch((err) => {
      console.error('Error iniciando escáner:', err);
    });
  };

  const detenerScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current.clear();
        setScannerActivo(false);
      }).catch((err) => {
        console.error('Error al detener escáner:', err);
      });
    }
  };

  const handleScanSuccess = async (decodedText) => {
    const boletosRef = collection(db, 'boletos');
    const q = query(boletosRef, where('serie', '==', decodedText));
    const res = await getDocs(q);

    if (res.empty) {
      setMensaje('❌ Boleto no encontrado');
      setColor('crimson');
      errorAudio.current?.play();
      return;
    }

    const boletoDoc = res.docs[0];
    const data = boletoDoc.data();

    if (data.estado === 'usado') {
      setMensaje('⚠️ Ya fue utilizado');
      setColor('orange');
      errorAudio.current?.play();
    } else {
      await updateDoc(doc(db, 'boletos', boletoDoc.id), { estado: 'usado' });
      setMensaje('✅ Validado correctamente');
      setColor('green');
      successAudio.current?.play();
    }
  };

  const handleScanError = (err) => {
    // silencioso
  };

  useEffect(() => {
    return () => detenerScanner();
  }, []);

  return (
    <main className="admin-escaner-container">
      <h2>🛂 Escanear Entrada (Admin)</h2>
      <p className="mensaje-estado" style={{ color }}>{mensaje}</p>

      {!scannerActivo && (
        <button className="btn-activar" onClick={iniciarScanner}>Activar escáner</button>
      )}

      {scannerActivo && (
        <button className="btn-detener" onClick={detenerScanner}>Detener escáner</button>
      )}

      <div id="qr-reader" style={{ width: '300px', margin: '1rem auto' }}></div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="btn-volver-inicio" onClick={() => navigate('/dashboard')}>
          ⬅️ Volver al Menú Principal
        </button>
      </div>
    </main>
  );
};

export default EscanearEntradaAdmin;

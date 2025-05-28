import React from 'react';
import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children, rolPermitido }) => {
  const rol = localStorage.getItem('rol');

  if (!rol) {
    return <Navigate to="/" replace />;
  }

  if (rolPermitido && rol !== rolPermitido) {
    return <Navigate to={rol === 'admin' ? '/dashboard' : '/juegos'} replace />;
  }

  return children;
};

export default RutaProtegida;

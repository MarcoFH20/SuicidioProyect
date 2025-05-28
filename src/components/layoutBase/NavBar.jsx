import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NavBar = ({ rol }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('rol');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        {rol === 'admin' && (
          <>
            <NavLink to="/dashboard">Inicio</NavLink>
            <NavLink to="/usuarios">Usuarios</NavLink>
            <NavLink to="/reportes">Reportes</NavLink>
            <NavLink to="/reportes/escaner-admin">Escáner</NavLink>
            <NavLink to="/juegos">Juegos</NavLink>
          </>
        )}

        {rol === 'usuario' && (
          <>
            <NavLink to="/inicio">Inicio</NavLink>
            <NavLink to="/juegos">Juegos</NavLink>
            <NavLink to="/reportes/escaner">Escáner</NavLink>
            <NavLink to="/reportes/entradas">Entradas</NavLink>
          </>
        )}
      </div>

      <button onClick={handleLogout}>Cerrar sesión</button>
    </nav>
  );
};

export default NavBar;

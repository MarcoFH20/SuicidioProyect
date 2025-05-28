import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';
import fondoParque from '../../assets/fondo-parque.png';
import Header from '../../components/layoutBase/Header';
import Footer from '../../components/layoutBase/Footer';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      const res = await loginUser(email, password);
      console.log('ROL OBTENIDO:', res.rol);

      if (res.success && res.rol) {
        const rol = res.rol.toLowerCase();

        localStorage.setItem('rol', rol);
        setError('');

        if (rol === 'admin') {
          navigate('/dashboard');
        } else if (rol === 'usuario') {
          navigate('/inicio');
        } else {
          setError('Rol no válido');
        }
      } else {
        setError('Correo o contraseña incorrectos');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error en el servidor');
    }
  };

  return (
    <>
      <Header />
      <div className="main-login-wrapper">
        <div className="login-container">
          <div className="login-form">
            <h2>Parque Diversión Infinita</h2>
            <p>Inicio de sesión</p>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="remember">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Recordarme</label>
              </div>
              {error && <p className="error">{error}</p>}
              <button type="submit">Iniciar sesión</button>
            </form>
            <a href="#" className="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>
          <div className="login-image">
            <img src={fondoParque} alt="Parque de diversiones" />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;

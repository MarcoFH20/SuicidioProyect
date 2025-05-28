// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './views/Login/Login';
import Juegos from './views/Juegos/Juegos';
import Usuarios from './views/Usuarios/Usuarios';
import Reportes from './views/Reportes/Reportes';
import Entradas from './views/Reportes/Entradas';
import EscanearEntrada from './views/Reportes/EscanearEntrada';
import DashboardUsuario from './views/Dashboard/DashboardUsuario';
import DashboardAdmin from './views/Dashboard/DashboardAdmin';
import EscanearEntradaAdmin from './views/Admin/Reportes/EscanearEntradaAdmin';
import JuegosAdmin from './views/Admin/Juegos/JuegosAdmin'; // ✅ AÑADIDO
import RutaProtegida from './components/shared/RutaProtegida';
import LayoutUsuario from './components/layoutBase/LayoutUsuario';
import LayoutAdmin from './components/layoutBase/LayoutAdmin';

function App() {
  return (
    <Router>
      <Routes>
        {/* RUTA PÚBLICA */}
        <Route path="/" element={<Login />} />

        {/* RUTAS ADMIN (con layout admin) */}
        <Route
          element={
            <RutaProtegida rolPermitido="admin">
              <LayoutAdmin />
            </RutaProtegida>
          }
        >
          <Route path="/dashboard" element={<DashboardAdmin />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/reportes/escaner-admin" element={<EscanearEntradaAdmin />} />
          <Route path="/admin/juegos" element={<JuegosAdmin />} /> {/* ✅ NUEVO */}
        </Route>

        {/* RUTAS USUARIO (con layout usuario) */}
        <Route
          element={
            <RutaProtegida rolPermitido="usuario">
              <LayoutUsuario />
            </RutaProtegida>
          }
        >
          <Route path="/inicio" element={<DashboardUsuario />} />
          <Route path="/juegos" element={<Juegos />} />
          <Route path="/reportes/entradas" element={<Entradas />} />
          <Route path="/reportes/escaner" element={<EscanearEntrada />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

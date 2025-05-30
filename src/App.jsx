// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './views/Login/Login';
import Juegos from './views/Juegos/Juegos';
import Usuarios from './views/Usuarios/Usuarios';
import Reportes from './views/Reportes/Reportes';
import EscanearEntrada from './views/Reportes/EscanearEntrada';
import DashboardUsuario from './views/Dashboard/DashboardUsuario';
import DashboardAdmin from './views/Dashboard/DashboardAdmin';
import EntradasAdmin from './views/Admin/Reportes/EntradasAdmin';
import ReservasAdmin from './views/Admin/Reservas/ReservasAdmin'
import JuegosAdmin from './views/Admin/Juegos/JuegosAdmin'; // ✅ AÑADIDO
import RutaProtegida from './components/shared/RutaProtegida';
import LayoutUsuario from './components/layoutBase/LayoutUsuario';
import LayoutAdmin from './components/layoutBase/LayoutAdmin';
import ReservasEmpleado from './views/Reservas/ReservasEmpleado';



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
          <Route path="/admin/entradas" element={<EntradasAdmin />} />
          <Route path="/admin/juegos" element={<JuegosAdmin />} /> {/* ✅ NUEVO */}
          <Route path="/Admin/reservas" element={<ReservasAdmin />} />
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
          <Route path="/reservas" element={<ReservasEmpleado />} />
          <Route path="/reportes/escaner" element={<EscanearEntrada />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

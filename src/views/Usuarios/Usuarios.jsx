import React, { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom";
import {
  obtenerUsuarios, // Modificado para paginación (ver abajo)
  obtenerJuegos,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "@services/firestoreService";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@services/firebase";
import Swal from "sweetalert2";
import "./Usuarios.css";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [juegos, setJuegos] = useState([]);
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "", // Solo para creación
    rol: "",
    telefono: "",
    juegoAsignado: "",
  });
  const [editing, setEditing] = useState(false);
  const [currentUid, setCurrentUid] = useState(null);
  const [creating, setCreating] = useState(false);

  // Paginación:
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [pageStack, setPageStack] = useState([]); // para historial de páginas

  const navigate = useNavigate();

  // Carga inicial y juegos
  useEffect(() => {
    async function fetchData() {
      const juegosData = await obtenerJuegos();
      setJuegos(juegosData);
      await cargarUsuariosInicial();
    }
    fetchData();
  }, []);

  // Función para cargar la primera página
  const cargarUsuariosInicial = async () => {
    const { usuarios, lastDoc, firstDoc } = await obtenerUsuarios(10, null);
    setUsuarios(usuarios);
    setLastDoc(lastDoc);
    setFirstDoc(firstDoc);
    setPageStack([]);
  };

  // Cargar página siguiente
  const cargarUsuariosSiguiente = async () => {
    if (!lastDoc) return; // No hay más páginas
    const { usuarios, lastDoc: newLastDoc, firstDoc: newFirstDoc } = await obtenerUsuarios(10, lastDoc);
    setUsuarios(usuarios);
    setLastDoc(newLastDoc);
    setFirstDoc(newFirstDoc);
    setPageStack(prev => [...prev, firstDoc]); // guardamos el primer doc de la página actual para retroceder
  };

  // Cargar página anterior
  const cargarUsuariosAnterior = async () => {
    if (pageStack.length === 0) return; // no hay página anterior
    const prevFirstDoc = pageStack[pageStack.length - 1];
    const { usuarios, lastDoc: newLastDoc, firstDoc: newFirstDoc } = await obtenerUsuarios(10, prevFirstDoc, true);
    setUsuarios(usuarios);
    setLastDoc(newLastDoc);
    setFirstDoc(newFirstDoc);
    setPageStack(prev => prev.slice(0, prev.length - 1)); // removemos el último cursor
  };

  // Manejo formulario y demás funciones igual que antes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      nombres: "",
      apellidos: "",
      email: "",
      password: "",
      rol: "",
      telefono: "",
      juegoAsignado: "",
    });
    setEditing(false);
    setCreating(false);
    setCurrentUid(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        const updateData = { ...form };
        delete updateData.password;
        await actualizarUsuario(currentUid, updateData);
        Swal.fire("Éxito", "Usuario actualizado correctamente", "success");
      } else {
        if (!form.password) {
          Swal.fire("Error", "La contraseña es obligatoria para crear un usuario", "error");
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const uid = userCredential.user.uid;

        const datos = {
          uid,
          nombres: form.nombres,
          apellidos: form.apellidos,
          email: form.email,
          rol: form.rol,
          telefono: form.telefono,
          juegoAsignado: form.juegoAsignado,
        };

        await crearUsuario(datos);
        Swal.fire("Éxito", "Usuario creado correctamente", "success");
      }

      // Recargar usuarios con paginación, cargando la página inicial
      await cargarUsuariosInicial();
      resetForm();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Swal.fire("Error", "El correo ya está registrado.", "error");
      } else {
        Swal.fire("Error", error.message || "Error creando usuario", "error");
      }
    }
  };

  const handleEdit = (usuario) => {
    setForm({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      password: "",
      rol: usuario.rol,
      telefono: usuario.telefono || "",
      juegoAsignado: usuario.juegoAsignado || "",
    });
    setEditing(true);
    setCreating(true);
    setCurrentUid(usuario.uid);
  };

  const handleDelete = (usuario) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await eliminarUsuario(usuario.uid);
          Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");
          await cargarUsuariosInicial();
        } catch (error) {
          Swal.fire("Error", error.message || "Error eliminando usuario", "error");
        }
      }
    });
  };

  // Filtro de búsqueda (con paginación no ideal para filtro, pero mantenemos para búsqueda local)
  const handleBusqueda = (e) => {
    const filtro = e.target.value.toLowerCase();
    setUsuarios((prevUsuarios) =>
      prevUsuarios.filter((u) =>
        (u.nombres + " " + u.apellidos + " " + u.email + " " + u.rol)
          .toLowerCase()
          .includes(filtro)
      )
    );
  };

  return (
    <main className="usuarios-container">
      <h2>👥 Gestión de Usuarios</h2>
      <p>Desde aquí puedes ver y administrar los usuarios del sistema.</p>

      <input
        className="input-busqueda"
        type="text"
        placeholder="Buscar usuarios por nombre, apellido, email o rol..."
        onChange={handleBusqueda}
      />

      {!creating && (
        <button className="btn-crear" onClick={() => setCreating(true)}>
          ➕ Crear Nuevo Usuario
        </button>
      )}

      {creating && (
        <form className="form-usuario" onSubmit={handleSubmit}>
          <input
            type="text"
            name="nombres"
            placeholder="Nombres"
            value={form.nombres}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="apellidos"
            placeholder="Apellidos"
            value={form.apellidos}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={editing}
          />
          {!editing && (
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              required={!editing}
            />
          )}
          <select name="rol" value={form.rol} onChange={handleChange} required>
            <option value="">Selecciona un rol</option>
            <option value="admin">Admin</option>
            <option value="operador">Operador</option>
            <option value="usuario">Usuario</option>
          </select>
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
          />
          <select
            name="juegoAsignado"
            value={form.juegoAsignado}
            onChange={handleChange}
          >
            <option value="">Selecciona un juego</option>
            {juegos.map((juego) => (
              <option key={juego.id} value={juego.nombre}>
                {juego.nombre}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-guardar">
            {editing ? "Actualizar Usuario" : "Crear Usuario"}
          </button>
          <button type="button" className="btn-cancelar" onClick={resetForm}>
            Cancelar
          </button>
        </form>
      )}

      <table className="usuarios-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Teléfono</th>
            <th>Juego Asignado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.uid}>
              <td>{usuario.nombres}</td>
              <td>{usuario.apellidos}</td>
              <td>{usuario.email}</td>
              <td>{usuario.rol}</td>
              <td>{usuario.telefono}</td>
              <td>{usuario.juegoAsignado || "No asignado"}</td>
              <td>
                <button
                  className="btn-editar"
                  onClick={() => handleEdit(usuario)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="btn-eliminar"
                  onClick={() => handleDelete(usuario)}
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 10 }}>
        <button
          className="btn-paginacion"
          onClick={cargarUsuariosAnterior}
          disabled={pageStack.length === 0}
          style={{ marginRight: 5 }}
        >
          ⬅ Anterior
        </button>
        <button
          className="btn-paginacion"
          onClick={cargarUsuariosSiguiente}
          disabled={!lastDoc}
        >
          Siguiente ➡
        </button>
      </div>

      <button className="btn-volver" onClick={() => navigate("/dashboard")} style={{ marginTop: 15 }}>
        ⬅ Volver al Menú Principal
      </button>
    </main>
  );
};

export default Usuarios;

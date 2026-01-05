import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";

function ModificarTecnicos() {
    const { permisos, setModuloActual, setSubModuloActual, tecnicoSeleccionado, setTecnicoSeleccionado } = useGlobal();
    const [idTecnico, setIdTecnico] = useState("");
    const [datosTecnico, setDatosTecnico] = useState(null);
    const [roles, setRoles] = useState([]);
    const [estados, setEstados] = useState([]);
    const [modificarPermisos, setModificarPermisos] = useState(false);
    const [permisosDisponibles, setPermisosDisponibles] = useState([]);
    const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [rolOriginal, setRolOriginal] = useState(null);

    const tienePermisoModificar = permisos.includes(7); // permiso id=7

    // Buscar técnico manualmente (cuando no viene de ConsultarTecnicos)
    const handleBuscar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost/sigbi_712/api/consulta_7.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_tecnico: idTecnico, id_permiso: 7 })
            });

            const data = await response.json();

            if (data.status === "ok" && data.tecnico) {
                setDatosTecnico(data.tecnico);
                setRoles(data.roles || []);
                setEstados(data.estados || []);
                setRolOriginal(data.tecnico.id_rol);
            } else {
                setError(data.message || "Técnico no encontrado.");
                setTimeout(() => {
                    setModuloActual("Control");
                    setSubModuloActual(null);
                }, 3000);
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // 🔎 Nuevo: cargar técnico automáticamente si viene desde ConsultarTecnicos.jsx
    useEffect(() => {
        if (tecnicoSeleccionado) {
            fetch("http://localhost/sigbi_712/api/consulta_7.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_tecnico: tecnicoSeleccionado, id_permiso: 7 })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok" && data.tecnico) {
                        setDatosTecnico(data.tecnico);
                        setRoles(data.roles || []);
                        setEstados(data.estados || []);
                        setRolOriginal(data.tecnico.id_rol);
                    } else {
                        setError(data.message || "Técnico no encontrado.");
                    }
                })
                .catch(() => setError("Error al cargar técnico."));
        }
    }, [tecnicoSeleccionado]);

    // Cargar permisos si se activa el radioboton
    useEffect(() => {
        if (modificarPermisos && datosTecnico) {
            fetch("http://localhost/sigbi_712/api/consulta_permisos_tecnico.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_tecnico: datosTecnico.id_tecnico, id_permiso: 7 })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok") {
                        setPermisosDisponibles(data.permisos || []);
                        setPermisosSeleccionados(data.permisosSeleccionados || []);
                    }
                })
                .catch(() => setError("Error al cargar permisos."));
        }
    }, [modificarPermisos, datosTecnico]);

    // Modificar técnico
    const handleModificar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const payload = {
                id_tecnico: datosTecnico.id_tecnico,
                id_rol: datosTecnico.id_rol,
                id_estado: datosTecnico.id_estado,
                id_permiso: 7
            };

            if (modificarPermisos) {
                payload.permisos = permisosSeleccionados;
            }

            const response = await fetch("http://localhost/sigbi_712/api/modificar_tecnicos.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("✅ Técnico modificado correctamente.");
            } else {
                setError(data.message || "Error al modificar técnico.");
            }

            setTimeout(() => {
                setModuloActual("Control");
                setSubModuloActual(null);
                setTecnicoSeleccionado(null);
                setLoading(false);
            }, 3000);

        } catch (err) {
            setError("Error de conexión con el servidor.");
            setTimeout(() => {
                setModuloActual("Control");
                setSubModuloActual(null);
                setTecnicoSeleccionado(null);
                setLoading(false);
            }, 3000);
        }
    };

    if (!tienePermisoModificar) {
        return <p>Acceso denegado. No tiene permiso para modificar técnicos.</p>;
    }

    const rolCambio = rolOriginal && datosTecnico && datosTecnico.id_rol !== rolOriginal;

    return (
        <div className="sesion-form">
            {/* Mostrar formulario de búsqueda solo si no hay tecnicoSeleccionado */}
            {!datosTecnico && !tecnicoSeleccionado && (
                <form onSubmit={handleBuscar}>
                    <div className="form-group">
                        <label>ID Técnico</label>
                        <input
                            type="text"
                            value={idTecnico}
                            onChange={(e) => setIdTecnico(e.target.value)}
                            placeholder="Ingresa el ID del técnico"
                        />
                    </div>
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                </form>
            )}

            {datosTecnico && (
                <form onSubmit={handleModificar}>
                    <p><strong>ID Técnico:</strong> {datosTecnico.id_tecnico}</p>

                    <div className="form-group">
                        <label>Rol</label>
                        <select
                            value={datosTecnico.id_rol}
                            onChange={(e) =>
                                setDatosTecnico({ ...datosTecnico, id_rol: e.target.value })
                            }
                            disabled={modificarPermisos} // 🔒 bloqueado si se está editando permisos
                        >
                            {roles.map((rol) => (
                                <option key={rol.id_rol} value={rol.id_rol}>
                                    {rol.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Estado</label>
                        <select
                            value={datosTecnico.id_estado}
                            onChange={(e) =>
                                setDatosTecnico({ ...datosTecnico, id_estado: e.target.value })
                            }
                        >
                            {estados.map((estado) => (
                                <option key={estado.id_estado} value={estado.id_estado}>
                                    {estado.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>¿Desea modificar permisos?</label>
                        <div className="radio-group">
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="modificarPermisos"
                                    value="no"
                                    checked={!modificarPermisos}
                                    onChange={() => setModificarPermisos(false)}
                                    disabled={rolCambio} // 🔒 bloqueado si cambió el rol
                                />
                                No
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="modificarPermisos"
                                    value="si"
                                    checked={modificarPermisos}
                                    onChange={() => setModificarPermisos(true)}
                                    disabled={rolCambio} // 🔒 bloqueado si cambió el rol
                                />
                                Sí
                            </label>
                        </div>
                        {rolCambio && (
                            <p className="info">
                                Los permisos se actualizarán automáticamente según el nuevo rol al guardar.
                            </p>
                        )}
                    </div>

                    {modificarPermisos && !rolCambio && (
                        <div className="tabla-contenedor">
                            <table className="tabla-estandar tabla-permisos">
                                <thead>
                                    <tr>
                                        <th>ID Permiso</th>
                                        <th>Nombre</th>
                                        <th>Asignado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {permisosDisponibles.map((permiso) => (
                                        <tr key={permiso.id_permiso}>
                                            <td>{permiso.id_permiso}</td>
                                            <td>{permiso.nombre}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={permisosSeleccionados.includes(permiso.id_permiso)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setPermisosSeleccionados([
                                                                ...permisosSeleccionados,
                                                                permiso.id_permiso
                                                            ]);
                                                        } else {
                                                            setPermisosSeleccionados(
                                                                permisosSeleccionados.filter(
                                                                    (p) => p !== permiso.id_permiso
                                                                )
                                                            );
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Procesando..." : "Modificar"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ModificarTecnicos;

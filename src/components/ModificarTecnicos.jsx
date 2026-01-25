import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputSelectRol from "./InputSelectRol";
import InputSelectEstados from "./InputSelectEstados";

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

    const tienePermisoModificar = permisos.includes(7); // id_permiso=7 "Modificar Técnicos"

    // Buscar técnico manualmente o directo del subModulo/acción
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
        } catch {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Cargar técnico automáticamente si viene desde ConsultarTecnicos.jsx
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

    // Cargar permisos si se activa el radiobutton
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
                setSuccess("\u2705 Técnico modificado correctamente.");
            } else {
                setError(data.message || "Error al modificar técnico.");
            }

            setTimeout(() => {
                setModuloActual("Control");
                setSubModuloActual(null);
                setTecnicoSeleccionado(null);
                setLoading(false);
            }, 3000);

        } catch {
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
            {!datosTecnico && !tecnicoSeleccionado && (
                <form onSubmit={handleBuscar}>

                    <InputGenerico
                        value={idTecnico}
                        setValue={setIdTecnico}
                        label="Número de empleado"
                        maxLength={7}
                        allowedChars="0-9"
                        placeholder="7120000"
                        title="Debe contener exactamente 7 dígitos numéricos"
                    />

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

                    {/* Reuso de InputSelectRol */}
                    <InputSelectRol
                        roles={roles}
                        idRol={String(datosTecnico.id_rol)}
                        setIdRol={(value) => setDatosTecnico({ ...datosTecnico, id_rol: value })}
                        label="Rol"
                    />

                    <InputSelectEstados
                        estados={estados}
                        idEstado={datosTecnico.id_estado}                  // id_estado real del técnico
                        setIdEstado={(value) => setDatosTecnico({ ...datosTecnico, id_estado: value })}
                        estadoActualText={datosTecnico.estado_actual}      // Texto del estado actual 
                        idEntidad={2}                                      // 2 = Técnicos
                        label="Estado del técnico"
                    />

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
                                    disabled={rolCambio}
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
                                    disabled={rolCambio}
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
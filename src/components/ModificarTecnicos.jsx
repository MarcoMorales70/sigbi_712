import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";
import InputSelectEstados from "./InputSelectEstados";

function ModificarTecnicos() {
    const { permisos, setModuloActual, setSubModuloActual, tecnicoSeleccionado, setTecnicoSeleccionado } = useGlobal();
    const [idTecnico, setIdTecnico] = useState("");
    const [datosTecnico, setDatosTecnico] = useState(null);
    const [modificarPermisos, setModificarPermisos] = useState(false);
    const [permisosDisponibles, setPermisosDisponibles] = useState([]);
    const [permisosSeleccionados, setPermisosSeleccionados] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [rolOriginal, setRolOriginal] = useState(null);

    const tienePermisoModificar = permisos.includes(7); // id_permiso=7 "Modificar Técnicos"

    // Buscar técnico manualmente
    const handleBuscar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/consultar_tecnico_especifico.php?id_tecnico=` + idTecnico,
                { credentials: "include" }
            );

            const data = await response.json();

            if (data.status === "ok" && data.data) {
                setDatosTecnico(data.data);
                setRolOriginal(data.data.id_rol);
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
            fetch(`${API_URL}/consultar_tecnico_especifico.php?id_tecnico=` + tecnicoSeleccionado, {
                credentials: "include"
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok" && data.data) {
                        setDatosTecnico(data.data);
                        setRolOriginal(data.data.id_rol);
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
            fetch(`${API_URL}/consulta_permisos_tecnico.php`, {
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

            const response = await fetch(`${API_URL}/modificar_tecnicos.php`, {
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

                    <InputSelectGenerico
                        idSeleccionado={String(datosTecnico.id_rol)}
                        setIdSeleccionado={(value) => setDatosTecnico({ ...datosTecnico, id_rol: value })}
                        label="Rol"
                        apiUrl={`${API_URL}/consultar_roles.php`}
                        valueField="id_rol"
                        displayField="rol"
                        showDefaultOption={true}
                        defaultOptionText="Seleccione un rol"
                    />

                    <InputSelectEstados
                        idEstado={datosTecnico.id_estado}
                        setIdEstado={(value) => setDatosTecnico({ ...datosTecnico, id_estado: value })}
                        estadoActualText=""
                        idEntidad={2}
                        label="Estado del técnico"
                        apiUrl={`${API_URL}/consultar_estados.php`}
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
                    </div>

                    {rolCambio && (
                        <p className="info">
                            Los permisos se actualizarán automáticamente según el nuevo rol al guardar.
                        </p>
                    )}

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
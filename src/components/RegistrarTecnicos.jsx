import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";

function RegistrarTecnicos() {
    const { setModuloActual, setSubModuloActual, permisos } = useGlobal();

    const [idTecnico, setIdTecnico] = useState("");
    const [roles, setRoles] = useState([]);
    const [estados, setEstados] = useState([]);
    const [idRol, setIdRol] = useState("");
    const [idEstado, setIdEstado] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [success, setSuccess] = useState(false);
    const [codigoTemp, setCodigoTemp] = useState("");

    const tienePermisoRegistrar = permisos.includes(5); // 5 = ID del permiso "Registrar técnicos"

    useEffect(() => {
        if (tienePermisoRegistrar) {
            fetch("http://localhost/sigbi_712/api/consulta_5.php", {
                credentials: "include"
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok") {
                        setRoles(data.roles || []);
                        setEstados(data.estados || []);
                    } else {
                        setMensaje(data.message);
                    }
                })
                .catch(() => setMensaje("Error al cargar listas de roles/estados"));
        }
    }, [tienePermisoRegistrar]);

    const validarIdTecnico = (id) => /^\d{7}$/.test(id);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");

        if (!validarIdTecnico(idTecnico)) {
            return setMensaje("El ID técnico debe contener exactamente 7 dígitos.");
        }
        if (!idRol || !idEstado) {
            return setMensaje("Debe seleccionar rol y estado.");
        }

        try {
            const response = await fetch("http://localhost/sigbi_712/api/registrar_tecnicos.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_tecnico: idTecnico, id_rol: idRol, id_estado: idEstado })
            });
            const data = await response.json();

            if (data.status === "ok") {
                setMensaje(data.message);
                setCodigoTemp(data.codigo_temp); // guardar el código temporal
                setSuccess(true);
            } else if (data.status === "warning") {
                setMensaje("⚠️ " + data.message);
                setCodigoTemp(data.codigo_temp);
                setSuccess(true);
            } else {
                setMensaje("❌ " + data.message);
            }
        } catch {
            setMensaje("Error de conexión con el servidor.");
        }
    };

    if (!tienePermisoRegistrar) {
        return <p>Acceso denegado. No tiene permiso para registrar técnicos.</p>;
    }

    // ✅ Si ya se registró con éxito, ocultamos el formulario y mostramos el código
    if (success) {
        return (
            <div className="sesion-form">
                <p className="success">{mensaje}</p>
                <p><strong>Código temporal generado:</strong> {codigoTemp}</p>
                <button onClick={() => {
                    setModuloActual("Control");
                    setSubModuloActual(null);
                }}>
                    Continuar
                </button>
            </div>
        );
    }

    return (
        <div className="sesion-form">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>ID Técnico</label>
                    <input
                        type="text"
                        value={idTecnico}
                        onChange={(e) => setIdTecnico(e.target.value)}
                        placeholder="Ingresa ID de 7 dígitos"
                    />
                </div>

                <div className="form-group">
                    <label>Rol</label>
                    <select value={idRol} onChange={(e) => setIdRol(e.target.value)}>
                        <option value="">Seleccione un rol</option>
                        {roles.map((rol) => (
                            <option key={rol.id_rol} value={rol.id_rol}>
                                {rol.rol}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Estado</label>
                    <select value={idEstado} onChange={(e) => setIdEstado(e.target.value)}>
                        <option value="">Seleccione un estado</option>
                        {estados.map((estado) => (
                            <option key={estado.id_estado} value={estado.id_estado}>
                                {estado.estado}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ✅ Aquí aplicamos el mismo estilo que en ModificarTecnicos */}
                {mensaje && (
                    <div className={success ? "success" : "error"}>
                        {mensaje}
                    </div>
                )}

                <div className="form-buttons">
                    <button type="submit">Registrar</button>
                </div>
            </form>
        </div>
    );
}

export default RegistrarTecnicos;
import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputSelectRol from "./InputSelectRol";
import InputSelectEstados from "./InputSelectEstados";

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

    const tienePermisoRegistrar = permisos.includes(5); // id_permiso = 5; "Registrar técnicos"

    useEffect(() => {
        if (tienePermisoRegistrar) {
            fetch("http://localhost/sigbi_712/api/consulta_roles_estados.php", { credentials: "include" })
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
                setCodigoTemp(data.codigo_temp);
                setSuccess(true);
            } else if (data.status === "warning") {
                setMensaje("\u26A0" + data.message);
                setCodigoTemp(data.codigo_temp);
                setSuccess(true);
            } else {
                setMensaje("\u274C" + data.message);
            }
        } catch {
            setMensaje("Error de conexión con el servidor.");
        }
    };

    if (!tienePermisoRegistrar) {
        return <p>Acceso denegado. No tiene permiso para registrar técnicos.</p>;
    }

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

                <InputGenerico
                    value={idTecnico}
                    setValue={setIdTecnico}
                    label="Número de empleado"
                    maxLength={7}
                    allowedChars="0-9"
                    placeholder="7120000"
                    title="Debe contener exactamente 7 dígitos numéricos"
                />

                <InputSelectRol
                    roles={roles}
                    idRol={idRol}
                    setIdRol={setIdRol}
                />

                <InputSelectEstados
                    estados={estados} // Array de estados que devuelve la api
                    idEstado={idEstado}     // Estado actual del bien
                    setIdEstado={setIdEstado}
                    estadoActualText="" // Texto del estado actual para mostrar en el input 
                    idEntidad={2}   // Se define la entidad, id_entidad=2; corrsponde a los estados del técnico
                    label="Estado del técnico"  // Etiqueta del input
                />

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
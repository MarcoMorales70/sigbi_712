import React, { useState } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";
import InputSelectEstados from "./InputSelectEstados";

function RegistrarTecnicos() {
    const { setModuloActual, setSubModuloActual, permisos } = useGlobal();

    const [idTecnico, setIdTecnico] = useState("");
    const [idRol, setIdRol] = useState("");
    const [idEstado, setIdEstado] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [success, setSuccess] = useState(false);
    const [codigoTemp, setCodigoTemp] = useState("");

    const tienePermisoRegistrar = permisos.includes(5); // id_permiso = 5; "Registrar técnicos"

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
            const response = await fetch(`${API_URL}/registrar_tecnicos.php`, {
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
                setMensaje("\u26A0 " + data.message);
                setCodigoTemp(data.codigo_temp);
                setSuccess(true);
            } else {
                setMensaje("\u274C " + data.message);
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

                <InputSelectGenerico
                    idSeleccionado={idRol}
                    setIdSeleccionado={setIdRol}
                    label="Rol"
                    apiUrl={`${API_URL}/consultar_roles.php`}
                    valueField="id_rol"
                    displayField="rol"
                    showDefaultOption={true}
                    defaultOptionText="Seleccione un rol"
                />

                <InputSelectEstados
                    idEstado={idEstado}
                    setIdEstado={setIdEstado}
                    estadoActualText=""
                    idEntidad={2}
                    label="Estado del técnico"
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
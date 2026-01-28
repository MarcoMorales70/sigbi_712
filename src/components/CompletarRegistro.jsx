import React, { useState } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputContrasena from "./InputContrasena";

function CompletarRegistro() {

    const [idTecnico, setIdTecnico] = useState("");
    const [codigoTemp, setCodigoTemp] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [contrasenaConfirmacion, setContrasenaConfirmacion] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Validaciones
    const validarInputs = () => {
        if (!/^\d{7}$/.test(idTecnico)) {
            return "El ID técnico debe contener exactamente 7 dígitos.";
        }
        if (!/^[A-Z0-9]{6}$/.test(codigoTemp)) {
            return "El código de registro debe tener exactamente 6 caracteres alfanuméricos (A-Z, 0-9).";
        }
        if (contrasena.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres.";
        }
        if (contrasena !== contrasenaConfirmacion) {
            return "Las contraseñas no coinciden.";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        const err = validarInputs();
        if (err) {
            setError(err);
            return;
        }

        try {
            const response = await fetch(`${API_URL} /completar_registro.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_tecnico: idTecnico,
                    codigo_temp: codigoTemp.toUpperCase(),
                    contrasena: contrasena,
                    contrasena_confirmacion: contrasenaConfirmacion,
                }),
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccessMessage("Registro completado. Ahora puede iniciar sesión.");
            } else {
                setError(data.message || "Error al procesar la solicitud.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        }
    };

    return (
        <div className="sesion-form">
            {!successMessage && (
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

                    <InputGenerico
                        value={codigoTemp}
                        setValue={setCodigoTemp}
                        label="Código de registro"
                        maxLength={6}
                        allowedChars="0-9A-Z"
                        transform="uppercase"
                        placeholder="A1B2C3"
                        title="Debe contener exactamente 6 caracteres alfanuméricos"
                    />

                    <InputContrasena
                        contrasena={contrasena}
                        setContrasena={setContrasena}
                        label="Contraseña"
                    />
                    <InputContrasena
                        contrasena={contrasenaConfirmacion}
                        setContrasena={setContrasenaConfirmacion}
                        label="Confirmar contraseña"
                    />

                    {error && <div className="error">{error}</div>}

                    <div className="form-buttons">
                        <button type="submit">Completar registro</button>
                    </div>
                </form>
            )}

            {successMessage && (
                <div className="success">
                    <p>{successMessage}</p>
                </div>
            )}
        </div>
    );
}

export default CompletarRegistro;
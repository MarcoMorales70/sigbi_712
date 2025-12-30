import React, { useState } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";

function CompletarRegistro() {
    const { setModuloActual, setSubModuloActual } = useGlobal();

    const [idTecnico, setIdTecnico] = useState("");
    const [codigoTemp, setCodigoTemp] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [contrasenaConfirmacion, setContrasenaConfirmacion] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // fuerza mayúsculas al escribir el código temporal
    const handleCodigoChange = (e) => {
        const value = e.target.value.toUpperCase();
        setCodigoTemp(value);
    };

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
            const response = await fetch("http://localhost/sigbi_712/api/completar_registro.php", {
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

    const handleRegresar = () => {
        setModuloActual("Autenticación");
        setSubModuloActual(null);
    };

    return (
        <div className="sesion-form">
            {/*<h2>Completar registro</h2>*/}

            {!successMessage && (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>ID Técnico</label>
                        <input
                            type="text"
                            value={idTecnico}
                            onChange={(e) => setIdTecnico(e.target.value)}
                            placeholder="Ejemplo: 1234567"
                            title="Debe contener exactamente 7 dígitos numéricos"
                        />
                    </div>

                    <div className="form-group">
                        <label>Código de registro</label>
                        <input
                            type="text"
                            value={codigoTemp}
                            onChange={handleCodigoChange}
                            placeholder="Ejemplo: ABC123"
                            title="Exactamente 6 caracteres alfanuméricos (A-Z, 0-9)"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder="Ingrese su contraseña"
                            title="Debe tener al menos 8 caracteres"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmar contraseña</label>
                        <input
                            type="password"
                            value={contrasenaConfirmacion}
                            onChange={(e) => setContrasenaConfirmacion(e.target.value)}
                            placeholder="Repita su contraseña"
                            title="Debe coincidir con la contraseña anterior"
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button type="submit">Completar registro</button>
                </form>
            )}

            {successMessage && (
                <div className="success">
                    <p>{successMessage}</p>
                </div>
            )}
            {/*}
            <div style={{ marginTop: "16px" }}>
                <button onClick={handleRegresar}>Regresar al inicio</button>
            </div>
            */}
        </div>
    );
}

export default CompletarRegistro;
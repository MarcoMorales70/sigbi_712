import React, { useState } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";

function RecuperarContrasena() {
    const { setModuloActual, setSubModuloActual } = useGlobal();

    const [idTecnico, setIdTecnico] = useState("");
    const [codigoTemp, setCodigoTemp] = useState("");
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
            return "El código temporal debe tener exactamente 6 caracteres alfanuméricos (A-Z, 0-9).";
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
            const response = await fetch("/api/recuperar_contrasena.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_tecnico: idTecnico,
                    codigo_temp: codigoTemp.toUpperCase(), // aseguramos mayúsculas al enviar
                }),
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccessMessage("Su contraseña ha sido enviada a su correo institucional.");
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
            {/*<h2>Recuperar contraseña</h2>*/}

            {!successMessage && (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>ID Técnico</label>
                        <input
                            type="text"
                            value={idTecnico}
                            onChange={(e) => setIdTecnico(e.target.value)}
                            placeholder="Ingresa tu ID de 7 dígitos"
                            title="Debe contener exactamente 7 dígitos numéricos"
                        />
                    </div>

                    <div className="form-group">
                        <label>Código temporal</label>
                        <input
                            type="text"
                            value={codigoTemp}
                            onChange={handleCodigoChange}
                            placeholder="Ejemplo: ABC123"
                            title="Exactamente 6 caracteres alfanuméricos (A-Z, 0-9)"
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <button type="submit">Recuperar contraseña</button>
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

export default RecuperarContrasena;
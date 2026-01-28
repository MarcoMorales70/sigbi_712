import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";

function ResetPassword() {
    const [idTecnico, setIdTecnico] = useState("");
    const [token, setToken] = useState("");
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Extraer parámetros de la URL, id_tecnico y token
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setIdTecnico(params.get("id_tecnico") || "");
        setToken(params.get("token") || "");
    }, []);

    const validarInputs = () => {
        if (nuevaContrasena.length < 8) {
            return "La contraseña debe tener al menos 8 caracteres.";
        }
        if (nuevaContrasena !== confirmarContrasena) {
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
            const response = await fetch(`${API_URL}/guardar_nueva_contrasena.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_tecnico: idTecnico,
                    token: token,
                    nueva_contrasena: nuevaContrasena,
                }),
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccessMessage("Su contraseña ha sido restablecida correctamente. Ya puede iniciar sesión.");
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
                    <div className="form-group">
                        <label>Nueva contraseña</label>
                        <input
                            type="password"
                            value={nuevaContrasena}
                            onChange={(e) => setNuevaContrasena(e.target.value)}
                            placeholder="Ingrese su nueva contraseña"
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirmar contraseña</label>
                        <input
                            type="password"
                            value={confirmarContrasena}
                            onChange={(e) => setConfirmarContrasena(e.target.value)}
                            placeholder="Repita su nueva contraseña"
                        />
                    </div>

                    {error && <div className="error">{error}</div>}

                    <div className="form-buttons">
                        <button type="submit">Guardar nueva contraseña</button>
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

export default ResetPassword;
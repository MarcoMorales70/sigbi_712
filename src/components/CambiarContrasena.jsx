import React, { useState } from "react";
import "../styles/Formularios.css"; // reutilizamos estilos modernos
import { useGlobal } from "../context/ContenedorGlobal"; // importar el contexto global

function CambiarContrasena() {
    const { logout } = useGlobal();

    const [idTecnico, setIdTecnico] = useState("");
    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNueva, setPasswordNueva] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const validarPassword = (pwd) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-])[A-Za-z\d@$!%*?&_\-]{8,}$/;
        return regex.test(pwd);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!/^\d{7}$/.test(idTecnico)) {
            return setError("El ID técnico debe contener exactamente 7 dígitos.");
        }
        if (!validarPassword(passwordNueva)) {
            return setError(
                "La contraseña nueva debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial."
            );
        }
        if (passwordNueva !== passwordConfirm) {
            return setError("Las contraseñas nuevas no coinciden.");
        }

        try {
            const response = await fetch("http://localhost/sigbi_712/api/cambiar_contrasena.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_tecnico: idTecnico,
                    contrasena_actual: passwordActual,
                    contrasena_nueva: passwordNueva,
                }),
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess(true);
            } else {
                setError(data.message || "Error al cambiar la contraseña.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        }
    };

    if (success) {
        return (
            <div className="sesion-form">
                <h2>Operación exitosa</h2>
                <button onClick={logout}>Continuar</button>
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
                        placeholder="Ingresa tu ID de 7 dígitos"
                        title="Debe contener exactamente 7 dígitos numéricos"
                    />
                </div>

                <div className="form-group">
                    <label>Contraseña actual</label>
                    <input
                        type="password"
                        value={passwordActual}
                        onChange={(e) => setPasswordActual(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                    />
                </div>

                <div className="form-group">
                    <label>Nueva contraseña</label>
                    <input
                        type="password"
                        value={passwordNueva}
                        onChange={(e) => setPasswordNueva(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                        title="Mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial"
                    />
                </div>

                <div className="form-group">
                    <label>Confirmar nueva contraseña</label>
                    <input
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        placeholder="Repite tu nueva contraseña"
                    />
                </div>

                {error && <div className="error">{error}</div>}

                <button type="submit">Cambiar contraseña</button>
            </form>
        </div>
    );
}

export default CambiarContrasena;
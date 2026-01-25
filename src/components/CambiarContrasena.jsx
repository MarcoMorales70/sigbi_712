import React, { useState } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputContrasena from "./InputContrasena";

function CambiarContrasena() {
    const { logout, setModuloActual, setSubModuloActual } = useGlobal();

    const [idTecnico, setIdTecnico] = useState("");
    const [passwordActual, setPasswordActual] = useState("");
    const [passwordNueva, setPasswordNueva] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [error, setError] = useState("");
    const [step, setStep] = useState(1); // Pasos : 1 = ingresar credenciales, 2 = nueva contraseña
    const [success, setSuccess] = useState(false);

    const validarPassword = (pwd) => {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-])[A-Za-z\d@$!%*?&_\-]{8,}$/;
        return regex.test(pwd);
    };

    // Paso 1: validar credenciales
    const handleValidarCredenciales = async (e) => {
        e.preventDefault();
        setError("");

        if (!/^\d{7}$/.test(idTecnico)) {
            return setError("El ID técnico debe contener exactamente 7 dígitos.");
        }

        try {
            const response = await fetch("http://localhost/sigbi_712/api/validar_login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_tecnico: idTecnico,
                    contrasena: passwordActual,
                }),
            });

            const data = await response.json();

            if (data.status === "ok") {
                setStep(2); // Habilitar inputs de nueva contraseña
            } else {
                setError(data.message || "Credenciales incorrectas.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        }
    };

    // Paso 2: cambiar contraseña
    const handleCambiarContrasena = async (e) => {
        e.preventDefault();
        setError("");

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
                credentials: "include",
                body: JSON.stringify({ contrasena_nueva: passwordNueva }),
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess(true);
                await logout(); // cerrar sesión en frontend y backend
                setModuloActual("Autenticación");
                setSubModuloActual(null);
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
                <h2>Contraseña cambiada correctamente</h2>
                <button onClick={() => {
                    setModuloActual("Autenticación");
                    setSubModuloActual(null);
                }}>
                    Continuar
                </button>
            </div>
        );
    }

    return (
        <div className="sesion-form">
            {step === 1 && (
                <form onSubmit={handleValidarCredenciales}>

                    <InputGenerico
                        value={idTecnico}
                        setValue={setIdTecnico}
                        label="Número de empleado"
                        maxLength={7}
                        allowedChars="0-9"
                        placeholder="7120000"
                        title="Debe contener exactamente 7 dígitos numéricos"
                    />

                    <InputContrasena
                        contrasena={passwordActual}
                        setContrasena={setPasswordActual}
                        label="Contraseña actual" />

                    {error && <div className="error">{error}</div>}

                    <div className="form-buttons">
                        <button type="submit">Validar credenciales</button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleCambiarContrasena}>

                    <InputContrasena
                        contrasena={passwordNueva}
                        setContrasena={setPasswordNueva}
                        label="Nueva contraseña"
                    />

                    <InputContrasena
                        contrasena={passwordConfirm}
                        setContrasena={setPasswordConfirm}
                        label="Confirmar nueva contraseña"
                    />

                    {error && <div className="error">{error}</div>}

                    <div className="form-buttons">
                        <button type="submit">Cambiar contraseña</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default CambiarContrasena;
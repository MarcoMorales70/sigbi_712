import React, { useState } from "react";

function InputContrasena({ contrasena, setContrasena, label, readOnly = false }) {
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        mayuscula: false,
        minuscula: false,
        numero: false,
        especial: false
    });

    const validarContrasenaLive = (valor) => {
        setContrasena(valor);
        setPasswordChecks({
            length: valor.length >= 8,
            mayuscula: /[A-Z]/.test(valor),
            minuscula: /[a-z]/.test(valor),
            numero: /\d/.test(valor),
            especial: /[\W_]/.test(valor)
        });
    };

    return (
        <div className="form-group">
            <label htmlFor={label}>{label}</label>
            <input
                type="password"
                id={label}
                value={contrasena}
                onChange={(e) => validarContrasenaLive(e.target.value)}
                readOnly={readOnly}
                maxLength="20"
                placeholder={`Ingresa ${label.toLowerCase()}`}
                title="Mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial"
            />

            {/* Listado de validacion */}
            <ul className="password-requisitos">
                <li style={{ color: passwordChecks.length ? "green" : "red" }}>
                    {passwordChecks.length ? "\u2714" : "\u2718"} Mínimo 8 caracteres
                </li>
                <li style={{ color: passwordChecks.mayuscula ? "green" : "red" }}>
                    {passwordChecks.mayuscula ? "\u2714" : "\u2718"} Al menos una letra mayúscula
                </li>
                <li style={{ color: passwordChecks.minuscula ? "green" : "red" }}>
                    {passwordChecks.minuscula ? "\u2714" : "\u2718"} Al menos una letra minúscula
                </li>
                <li style={{ color: passwordChecks.numero ? "green" : "red" }}>
                    {passwordChecks.numero ? "\u2714" : "\u2718"} Al menos un número
                </li>
                <li style={{ color: passwordChecks.especial ? "green" : "red" }}>
                    {passwordChecks.especial ? "\u2714" : "\u2718"} Al menos un carácter especial
                </li>
            </ul>
        </div>
    );
}

export default InputContrasena;
import React from "react";

function InputCorreo({ correo, setCorreo, label = "Correo electrónico", readOnly = false }) {
    const handleChange = (e) => {
        let value = e.target.value.trim().toLowerCase().slice(0, 100);

        // Permitir solo caracteres válidos para un correo
        // Letras, números, puntos, guiones, guion bajo y arroba
        value = value.replace(/[^a-z0-9@._-]/g, "");

        setCorreo(value);
    };

    // Validación de formato de correo
    const esCorreoValido = (correo) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(correo);
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className="input"
                type="email"
                maxLength={100}
                value={correo}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder="ejemplo@dominio.com"
            />
            {correo && !esCorreoValido(correo) && (
                <div className="error">Formato de correo inválido</div>
            )}
        </div>
    );
}

export default InputCorreo;
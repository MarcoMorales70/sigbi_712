import React, { useState } from "react";

function InputGenerico({
    type = "text",
    value,
    setValue,
    label = "Campo genérico",
    readOnly = false,
    maxLength = 20,
    allowedChars = null,
    allowedValues = null,
    transform = null,
    placeholder = "",
    title = ""
}) {
    const [error, setError] = useState(false);

    // Manejador de cambios
    const handleChange = (e) => {
        let inputValue = e.target.value;

        // Aplicar transformaciones
        if (transform === "uppercase") inputValue = inputValue.toUpperCase();
        if (transform === "lowercase") inputValue = inputValue.toLowerCase();

        // Validar por valores exactos
        if (allowedValues && inputValue !== "") {
            if (!allowedValues.includes(inputValue)) {
                setError(true);
                return;
            }
        }

        // Validar por caracteres
        if (allowedChars) {
            const regex = new RegExp(`^[${allowedChars}]*$`, "i");
            if (!regex.test(inputValue)) {
                setError(true);
                return;
            }
        }

        setError(false);
        setValue(inputValue);
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className={`input ${error ? "input-error" : ""}`}
                type={type}
                maxLength={maxLength}
                value={value}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder={placeholder}
                title={title}
            />
            {error && <small className="error-text">Valor inválido</small>}
        </div>
    );
}

export default InputGenerico;
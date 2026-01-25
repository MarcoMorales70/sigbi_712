import React from "react";

function InputCodigoTemp({ codigoTemp, setCodigoTemp, label = "Código de registro", readOnly = false }) {
    // fuerza mayúsculas y valida que solo sean letras A-Z y números 0-9
    const handleChange = (e) => {
        const value = e.target.value.toUpperCase();
        // solo permitir hasta 6 caracteres alfanuméricos (sin espacios ni especiales)
        if (/^[A-Z0-9]{0,6}$/.test(value)) {
            setCodigoTemp(value);
        }
    };

    return (
        <div className="form-group">
            <label htmlFor="codigoTemp">{label}</label>
            <input
                type="text"
                id="codigoTemp"
                value={codigoTemp}
                onChange={handleChange}
                readOnly={readOnly}
                maxLength="6"
                placeholder="Ejemplo: ABC123"
                title="Exactamente 6 caracteres alfanuméricos (A-Z, 0-9)"
            />
        </div>
    );
}

export default InputCodigoTemp;
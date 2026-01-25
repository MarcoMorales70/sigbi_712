import React from "react";

function InputInventario({ inventario, setInventario, label = "Inventario", readOnly = false }) {
    const handleChange = (e) => {
        // Convertir a mayúsculas
        let value = e.target.value.toUpperCase();

        // Limitar a 35 caracteres
        value = value.slice(0, 35);

        // Solo permitir números, espacios y la letra I
        const regex = /^[0-9I ]*$/;
        if (!regex.test(value)) {
            return; // ignorar caracteres inválidos
        }

        setInventario(value);
    };

    // Validaciones adicionales
    const isValidLength = inventario.length === 35;
    const spacesCount = (inventario.match(/ /g) || []).length;
    const hasSixSpaces = spacesCount === 6;

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className="input"
                type="text"
                maxLength={35}
                value={inventario}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder="09 712 I180000064 079 2020 09 10101"
            />
            {/* Mensajes de validación en tiempo real */}
            {!isValidLength && (
                <div className="error">El inventario debe tener exactamente 35 caracteres.</div>
            )}
            {!hasSixSpaces && (
                <div className="error">El inventario debe contener exactamente 6 espacios internos.</div>
            )}
        </div>
    );
}

export default InputInventario;
import React from "react";

function InputUsuario({ usuario, setUsuario, label = "Nombre(s) del usuario" }) {
    const handleChange = (e) => {
        let value = e.target.value.toUpperCase().slice(0, 50); // Convertir a mayúsculas y limitar a 50 caracteres
        value = value.replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, ""); // Permitir solo letras (incluyendo acentos, Ñ y Ü) y espacios

        setUsuario(value);
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className="input"
                type="text"
                maxLength={50}
                value={usuario}
                onChange={handleChange}
                placeholder="Ingrese nombre(s)"
            />
        </div>
    );
}

export default InputUsuario;
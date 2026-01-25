import React from "react";

function InputApaterno({ aPaterno, setApaterno, label = "Apellido paterno", readOnly = false }) {
    const handleChange = (e) => {
        let value = e.target.value.toUpperCase().slice(0, 50);
        value = value.replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, "");
        setApaterno(value);
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className="input"
                type="text"
                maxLength={50}
                value={aPaterno}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder="Ingrese el apellido paterno"
            />
        </div>
    );
}

export default InputApaterno;
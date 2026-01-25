import React from "react";

function InputAmaterno({ aMaterno, setAmaterno, label = "Apellido materno", readOnly = false }) {
    const handleChange = (e) => {
        let value = e.target.value.toUpperCase().slice(0, 50);
        value = value.replace(/[^A-ZÁÉÍÓÚÜÑ\s]/g, "");
        setAmaterno(value);
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className="input"
                type="text"
                maxLength={50}
                value={aMaterno}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder="Ingrese el apellido materno"
            />
        </div>
    );
}

export default InputAmaterno;
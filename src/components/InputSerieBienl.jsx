import React from "react";

function InputSerieBien({ serieBien, setSerieBien, label = "Serie del bien", readOnly = false }) {
    const handleChange = (e) => {
        // Convertir a mayúsculas y limitar a 50 caracteres
        const value = e.target.value.toUpperCase().slice(0, 50);
        setSerieBien(value);
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className="input"
                type="text"
                maxLength={50}
                value={serieBien}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder="MXL1234ABC"
            />
        </div>
    );
}

export default InputSerieBien;
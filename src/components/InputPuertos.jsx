import React from "react";

function InputPuertos({ puertos, setPuertos, label = "Número de puertos", readOnly = false }) {
    const handleChange = (e) => {
        setPuertos(e.target.value);
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <select
                className="input"
                value={puertos}
                onChange={handleChange}
                disabled={readOnly} // Por ser select elemento html se usa disabled
            >
                <option value="">Seleccione...</option>
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
            </select>
        </div>
    );
}

export default InputPuertos;
import React from "react";

function InputTotalDictamenes({ totalDictamenes, setTotalDictamenes, label = "Total de dictámenes" }) {
    const handleChange = (e) => {
        const value = e.target.value;

        // Solo permitir dígitos o vacío
        if (/^\d*$/.test(value)) {
            setTotalDictamenes(value.slice(0, 2));
        }
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className="input"
                type="text"
                inputMode="numeric"
                maxLength={2}
                pattern="\d{1,2}"
                value={totalDictamenes}
                onChange={handleChange}
                placeholder="Cantidad de dictámenes que integran la baja"
            />
        </div>
    );
}

export default InputTotalDictamenes;
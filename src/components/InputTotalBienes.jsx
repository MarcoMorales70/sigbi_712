import React from "react";

function InputTotalBienes({ totalBienes, setTotalBienes, label = "Total de bienes" }) {
    const handleChange = (e) => {
        const value = e.target.value;

        // Solo permitir dígitos o vacío
        if (/^\d*$/.test(value)) {
            setTotalBienes(value.slice(0, 3)); // mantener como string
        }
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className="input"
                type="text"
                inputMode="numeric"
                maxLength={3}
                pattern="\d{1,3}"
                value={totalBienes}
                onChange={handleChange}
                placeholder="Cantidad de bienes que integran la baja"
            />
        </div>
    );
}

export default InputTotalBienes;
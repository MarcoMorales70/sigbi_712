import React from "react";

function InputIdDictamen({ idDictamen, setIdDictamen, label = "Dictamen", readOnly = false }) {
    const handleChange = (e) => {
        const value = e.target.value;
        // Solo permitir dígitos y limitar a 6
        if (/^\d*$/.test(value)) {
            setIdDictamen(value.slice(0, 6));
        }
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <input
                className="input"
                type="text"
                inputMode="numeric"       // teclado numérico en móviles
                maxLength={6}
                pattern="\d{1,6}"         // máximo 6 dígitos
                value={idDictamen}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder="232425"
            />
        </div>
    );
}

export default InputIdDictamen;
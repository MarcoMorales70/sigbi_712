import React from "react";

function InputIdUsuario({ idUsuario, setIdUsuario, label = "Número de Empleado", readOnly = false }) {
    const validarId = (valor) => {
        if (/^\d{0,7}$/.test(valor)) {
            setIdUsuario(valor);
        }
    };

    return (
        <div className="form-group">
            <label htmlFor={label}>{label}</label>
            <input
                type="text"
                id={label}
                value={idUsuario}
                onChange={(e) => validarId(e.target.value)}
                maxLength="7"
                placeholder={`7123456`}
                title="Debe contener exactamente 7 dígitos numéricos"
                readOnly={readOnly}   // Si readOnly es true, el campo no se podrá editar 
                style={readOnly ? { backgroundColor: "#f0f0f0", color: "#555" } : {}}
            />
        </div>
    );
}

export default InputIdUsuario;
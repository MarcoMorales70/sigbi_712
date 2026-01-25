import React from "react";

function InputSelectUsuarios({ usuarios, value, setValue, label }) {
    return (
        <div className="form-group">
            <label>{label}</label>
            <select
                className="input"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            >
                <option value="">Seleccione {label.toLowerCase()}</option>
                {usuarios.map((u) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                        {u.usuario} {u.a_paterno} {u.a_materno}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectUsuarios;
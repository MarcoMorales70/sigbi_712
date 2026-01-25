import React from "react";

function InputSelectRol({ roles, idRol, setIdRol, label = "Rol" }) {
    return (
        <div className="form-group">
            <label>{label}</label>
            <select value={idRol} onChange={(e) => setIdRol(e.target.value)}>
                <option value="">Seleccione un rol</option>
                {roles.map((rol) => (
                    <option key={rol.id_rol} value={rol.id_rol}>
                        {rol.rol}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectRol;
import React from "react";

function InputSelectPropietarios({ propietarios, idPropietario, setIdPropietario, label = "Propietario" }) {
    const handleChange = (e) => {
        const value = e.target.value;
        // Si no hay selección, guardamos null; si hay, convertimos a número
        setIdPropietario(value === "" ? null : Number(value));
    };

    return (
        <div className="form-group">
            <label>{label}</label>
            <select
                className="input"
                value={idPropietario ?? ""}
                onChange={handleChange}
            >
                <option value="">Seleccione un propietario</option>
                {propietarios.map((p) => (
                    <option key={p.id_propietario} value={p.id_propietario}>
                        {p.propietario}
                    </option>
                ))}
            </select>
        </div >
    );
}

export default InputSelectPropietarios;
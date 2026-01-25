import React from "react";

function InputSelectEstadosTecnicos({ estados, idEstado, setIdEstado, label = "Estado del técnico" }) {
    const estadosTecnicos = estados.filter(e => parseInt(e.id_entidad, 10) === 2); // id_entidad = 2, pertenece a Técnico

    return (
        <div className="form-group">
            <label>{label}</label>
            <select value={idEstado} onChange={(e) => setIdEstado(e.target.value)}>
                <option value="">Seleccione un estado</option>
                {estadosTecnicos.map((estado) => (
                    <option key={estado.id_estado} value={estado.id_estado}>
                        {estado.estado}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectEstadosTecnicos;
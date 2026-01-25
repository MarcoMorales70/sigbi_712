import React, { useMemo } from "react";

function InputSelectEstadosBienes({ estados, idEstado, setIdEstado, estadoActualText, label = "Estado del bien", readOnly = false }) {
    // Lista de estados tal cual vienen del backend
    const opciones = useMemo(() => {
        const lista = [...estados];
        if (idEstado) {
            const existe = lista.some(e => parseInt(e.id_estado, 10) === parseInt(idEstado, 10));
            if (!existe && estadoActualText) {
                lista.unshift({ id_estado: idEstado, estado: estadoActualText });
            }
        }
        return lista;
    }, [estados, idEstado, estadoActualText]);

    return (
        <div className="form-group">
            <label>{label}</label>
            <select
                className="input"
                value={idEstado?.toString() || ""}
                onChange={(e) => setIdEstado(parseInt(e.target.value, 10))}
                disabled={readOnly}
            >
                <option value="">Seleccione un estado</option>
                {opciones.map((estado) => (
                    <option key={estado.id_estado} value={estado.id_estado.toString()}>
                        {estado.estado}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectEstadosBienes;
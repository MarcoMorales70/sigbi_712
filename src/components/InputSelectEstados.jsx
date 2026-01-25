import React, { useMemo } from "react";

function InputSelectEstados({ estados, idEstado, setIdEstado, estadoActualText, idEntidad, label = "Estado", readOnly = false }) {
    // Filtrar estados según la entidad indicada (normalizando a número) en caso de ingresar cadena, así funciona de las dos formas
    const estadosFiltrados = useMemo(() => {
        return estados.filter(e => Number(e.id_entidad) === Number(idEntidad));
    }, [estados, idEntidad]);

    // Si el estado actual no está en la lista, se agregamos
    const opciones = useMemo(() => {
        const lista = [...estadosFiltrados];
        if (idEstado) {
            const existe = lista.some(e => Number(e.id_estado) === Number(idEstado));
            if (!existe && estadoActualText) {
                lista.unshift({ id_estado: idEstado, estado: estadoActualText, id_entidad: idEntidad });
            }
        }
        return lista;
    }, [estadosFiltrados, idEstado, estadoActualText, idEntidad]);

    return (
        <div className="form-group">
            <label>{label}</label>
            <select
                className="input"
                value={idEstado || ""}
                onChange={(e) => setIdEstado(Number(e.target.value))}
                disabled={readOnly}
            >
                <option value="">Seleccione un estado</option>
                {opciones.map((estado) => (
                    <option key={estado.id_estado} value={estado.id_estado}>
                        {estado.estado}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectEstados;
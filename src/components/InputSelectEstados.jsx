import React, { useState, useEffect, useMemo } from "react";
import API_URL from "../config";


function InputSelectEstados({
    idEstado,
    setIdEstado,
    estadoActualText,
    idEntidad,
    label = "Estado",
    readOnly = false,
    apiUrl
}) {
    const url = apiUrl || `${API_URL}/consultar_estados.php`;

    const [estados, setEstados] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Consultar estados desde la API
    useEffect(() => {
        setLoading(true);
        fetch(url, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setEstados(data);
                    setError("");
                } else if (data.estados && Array.isArray(data.estados)) {
                    setEstados(data.estados);
                    setError("");
                } else {
                    setError(data.message || "\u26A0 No se pudieron cargar los estados.");
                }
            })
            .catch(() => setError("\u26A0 Error de conexión al cargar estados."))
            .finally(() => setLoading(false));
    }, [url]);

    // Filtrar estados por entidad
    const estadosFiltrados = useMemo(() => {
        return estados.filter(e => Number(e.id_entidad) === Number(idEntidad));
    }, [estados, idEntidad]);

    // Agregar estado actual si no está en la lista
    const opciones = useMemo(() => {
        const lista = [...estadosFiltrados];
        if (idEstado) {
            const existe = lista.some(e => Number(e.id_estado) === Number(idEstado));
            if (!existe && estadoActualText) {
                lista.unshift({
                    id_estado: idEstado,
                    estado: estadoActualText,
                    id_entidad: idEntidad
                });
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
                disabled={readOnly || loading}
            >
                <option value="">Seleccione un estado</option>
                {opciones.map((estado) => (
                    <option key={estado.id_estado} value={estado.id_estado}>
                        {estado.estado}
                    </option>
                ))}
            </select>

            {loading && <div className="loading">Cargando estados...</div>}
            {error && <div className="error">{error}</div>}
        </div>
    );
}

export default InputSelectEstados;
import React, { useState, useEffect } from "react";

function InputSelectGenerico({
    idSeleccionado,
    setIdSeleccionado,
    label = "Seleccione una opción",
    apiUrl,
    valueField = "id",       // Campo que será el value del <option>
    displayField = "nombre", // Campo que se mostrará en pantalla
    readOnly = false,
    showDefaultOption = true,
    defaultOptionText = "Seleccione una opción",
    onChange = null          // Callback opcional para lógica extra
}) {
    const [opciones, setOpciones] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(apiUrl, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                let lista = [];

                // Detectar si la respuesta es un array directo
                if (Array.isArray(data)) {
                    lista = data;
                }
                // Detectar si viene dentro de "cargos"
                else if (Array.isArray(data.cargos)) {
                    lista = data.cargos;
                }
                // Detectar si viene dentro de "data"
                else if (Array.isArray(data.data)) {
                    lista = data.data;
                }

                if (lista.length > 0) {
                    setOpciones(lista);
                    setError("");
                } else {
                    setError(data.message || "⚠ No se pudieron cargar las opciones.");
                }
            })
            .catch(() => setError("⚠ Error de conexión al cargar opciones."))
            .finally(() => setLoading(false));
    }, [apiUrl]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setIdSeleccionado(newValue);

        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className="form-group">
            <label>{label}</label>

            {readOnly ? (
                <p className="readonly-text">
                    {opciones.find(o => String(o[valueField]) === String(idSeleccionado))?.[displayField] || "—"}
                </p>
            ) : (
                <select
                    className="input"
                    value={idSeleccionado || ""}
                    onChange={handleChange}
                    disabled={loading || readOnly}
                >
                    {showDefaultOption && (
                        <option value="">{defaultOptionText}</option>
                    )}
                    {opciones.map((o) => (
                        <option key={o[valueField]} value={o[valueField]}>
                            {o[displayField]}
                        </option>
                    ))}
                </select>
            )}

            {loading && <div className="loading">Cargando opciones...</div>}
            {error && <div className="error">{error}</div>}
        </div>
    );
}

export default InputSelectGenerico;
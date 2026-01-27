import React, { useState, useEffect } from "react";

function InputSelectGenerico({
    idSeleccionado,
    setIdSeleccionado,
    label = "Etiqueta del input",
    apiUrl, // URL de la api para obtener los arrays
    valueField = "id",       // Campo de referencia o principal
    displayField = "nombre", // Campo que se muestra en pantalla o campos conatenados utilizando en la llamada displayField={(o) => `${o.campo1} - ${o.campo2}`}
    readOnly = false,
    showDefaultOption = true, // Para mostrar el texto por default dentro del input
    defaultOptionText = "Seleccione una opción",
    onChange = null,         // Callback opcional para lógica extra
    dataField = null         // Nombre del array a usar 
}) {
    const [opciones, setOpciones] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Efecto secundario para elegir los diferentes arrays que se pueden procesar
    useEffect(() => {
        setLoading(true);
        fetch(apiUrl, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                let lista = [];

                if (Array.isArray(data)) {
                    // Caso en que la API devuelve directamente un array
                    lista = data;
                } else if (dataField && Array.isArray(data[dataField])) {
                    // Caso en que el padre indicó explícitamente qué campo usar
                    lista = data[dataField];
                } else if (typeof data === "object" && data !== null) {
                    // Caso para buscar automáticamente el primer array en el objeto
                    for (const key in data) {
                        if (Array.isArray(data[key])) {
                            lista = data[key];
                            break;
                        }
                    }
                }

                if (lista.length > 0) {
                    setOpciones(lista);
                    setError("");
                } else {
                    setError(data.message || "\u26A0 No se pudieron cargar las opciones.");
                }
            })
            .catch(() => setError("\u26A0 Error de conexión al cargar opciones."))
            .finally(() => setLoading(false));
    }, [apiUrl, dataField]);

    // Manejador para el nuevo valor
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
                            {typeof displayField === "function"
                                ? displayField(o)
                                : o[displayField]}
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
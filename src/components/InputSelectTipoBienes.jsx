import React, { useState, useEffect } from "react";

function InputSelectTipoBienes({
    idTipo,
    setIdTipo,
    label = "Tipo de bien",
    readOnly = false,
    showDefaultOption = true, // Para mostrar la opción por defecto "Seleccione ...
    defaultOptionText = "Seleccione un tipo", // texto de la opción por defecto
    apiUrl = "http://localhost/sigbi_712/api/consultar_tipo_bienes.php" // URL de la API
}) {
    const [tiposBienes, setTiposBienes] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(apiUrl, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setTiposBienes(data);
                    setError("");
                } else {
                    setError("\u26A0 No se pudieron cargar los tipos de bienes.");
                }
            })
            .catch(() => setError("\u26A0 Error de conexión al cargar tipos de bienes."))
            .finally(() => setLoading(false));
    }, [apiUrl]);

    return (
        <div className="form-group">
            <label>{label}</label>

            {readOnly ? (   // Modo lectura
                <p className="readonly-text">
                    {tiposBienes.find(t => String(t.id_tipo) === String(idTipo))?.tipo_bien || "—"}
                </p>
            ) : (
                <select // Modo editable
                    className="input"
                    value={idTipo || ""}
                    onChange={(e) => setIdTipo(e.target.value)}
                    disabled={loading || readOnly}
                >
                    {showDefaultOption && (
                        <option value="">{defaultOptionText}</option>
                    )}
                    {tiposBienes.map((tipo) => (
                        <option key={tipo.id_tipo} value={tipo.id_tipo}>
                            {tipo.tipo_bien}
                        </option>
                    ))}
                </select>
            )}

            {loading && <div className="loading">Cargando tipos de bienes...</div>}
            {error && <div className="error">{error}</div>}
        </div>
    );
}

export default InputSelectTipoBienes;
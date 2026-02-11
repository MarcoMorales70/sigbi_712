import React, { useState, useEffect } from "react";
import API_URL from "../config";

function InputSelectFallas({ idCategoria, idSeleccionado, setIdSeleccionado }) {
    const [fallas, setFallas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!idCategoria) return;

        const fetchFallas = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(`${API_URL}/consultar_fallas_por_categoria.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ id_categoria: idCategoria }),
                });

                const data = await response.json();
                if (data.status === "ok") {
                    setFallas(data.fallas || []);
                } else {
                    setError(data.message || "Error al consultar fallas.");
                    setFallas([]);
                }
            } catch (err) {
                setError("Error al conectar con el servidor.");
                setFallas([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFallas();
    }, [idCategoria]);

    return (
        <div className="form-group">
            <label>Seleccione la falla</label>
            {loading && <p>Cargando fallas...</p>}
            {error && <p className="error">{error}</p>}
            <select
                value={idSeleccionado || ""}
                onChange={(e) => setIdSeleccionado(e.target.value)}
            >
                <option value="">Seleccione una falla</option>
                {fallas.map((falla) => (
                    <option key={falla.id_falla} value={falla.id_falla}>
                        {falla.falla}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectFallas;
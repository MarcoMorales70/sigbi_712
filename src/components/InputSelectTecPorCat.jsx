import React, { useState, useEffect } from "react";
import API_URL from "../config";

function InputSelectTecPorCat({ idCategoria, idSeleccionado, setIdSeleccionado }) {
    const [tecnicos, setTecnicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!idCategoria) return;

        const fetchTecnicos = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await fetch(`${API_URL}/consultar_tecnicos_por_categoria.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ id_categoria: idCategoria }),
                });

                const data = await response.json();
                if (data.status === "ok") {
                    setTecnicos(data.tecnicos || []);
                } else {
                    setError(data.message || "Error al consultar técnicos.");
                    setTecnicos([]);
                }
            } catch (err) {
                setError("Error al conectar con el servidor.");
            } finally {
                setLoading(false);
            }
        };

        fetchTecnicos();
    }, [idCategoria]);

    return (
        <div className="form-group">
            <label>Seleccione técnico</label>
            {loading && <p>Cargando técnicos...</p>}
            {error && <p className="error">{error}</p>}
            <select
                value={idSeleccionado || ""}
                onChange={(e) => setIdSeleccionado(e.target.value)}
            >
                <option value="">Seleccione un técnico</option>
                {tecnicos.map((tec) => (
                    <option key={tec.id_tecnico} value={tec.id_tecnico}>
                        {`${tec.a_paterno} ${tec.a_materno} ${tec.usuario}`}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectTecPorCat;
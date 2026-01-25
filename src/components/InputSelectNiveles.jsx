import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";

function InputSelectNiveles({ idNivel, setIdNivel, label = "Nivel" }) {
    const [niveles, setNiveles] = useState([]);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_niveles.php", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    setNiveles(data.niveles || []);
                } else {
                    setMensaje(data.message || "No se pudieron cargar los niveles.");
                }
            })
            .catch(() => setMensaje("Error al cargar niveles."));
    }, []);

    return (
        <div className="form-group">
            <label>{label}</label>
            {mensaje && <div className="error">{mensaje}</div>}
            <select
                className="input"
                value={idNivel || ""}
                onChange={(e) => setIdNivel(e.target.value)}
            >
                <option value="">Seleccione un nivel</option>
                {niveles.map((n) => (
                    <option key={n.id_nivel} value={n.id_nivel}>
                        {n.nivel}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectNiveles;
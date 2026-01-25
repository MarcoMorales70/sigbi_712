import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";

function InputSelectEdificios({ idEdificio, setIdEdificio, label = "Edificio", readOnly = false }) {
    const [edificios, setEdificios] = useState([]);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_edificios.php", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    setEdificios(data.edificios || []);
                } else {
                    setMensaje(data.message || "No se pudieron cargar los edificios.");
                }
            })
            .catch(() => setMensaje("Error al cargar edificios."));
    }, []);

    return (
        <div className="form-group">
            <label>{label}</label>
            {mensaje && <div className="error">{mensaje}</div>}
            <select
                className="input"
                value={idEdificio || ""}
                onChange={(e) => setIdEdificio(e.target.value)}
                disabled={readOnly}
            >
                <option value="">Seleccione un edificio</option>
                {edificios.map((e) => (
                    <option key={e.id_edificio} value={e.id_edificio}>
                        {e.edificio}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectEdificios;
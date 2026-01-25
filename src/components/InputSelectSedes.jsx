import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";

function InputSelectSedes({ idSede, setIdSede, label = "Sede" }) {
    const [sedes, setSedes] = useState([]);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_sedes.php", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    setSedes(data.sedes || []);
                } else {
                    setMensaje(data.message || "No se pudieron cargar las sedes.");
                }
            })
            .catch(() => setMensaje("Error al cargar sedes."));
    }, []);

    return (
        <div className="form-group">
            <label>{label}</label>
            {mensaje && <div className="error">{mensaje}</div>}
            <select
                className="input"
                value={idSede || ""}
                onChange={(e) => setIdSede(e.target.value)}
            >
                <option value="">Seleccione una sede</option>
                {sedes.map((s) => (
                    <option key={s.id_sede} value={s.id_sede}>
                        {s.acronimo}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectSedes;
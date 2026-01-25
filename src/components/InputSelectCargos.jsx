import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";

function InputSelectCargos({ idCargo, setIdCargo, label = "Cargo", readOnly = false }) {
    const [cargos, setCargos] = useState([]);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_cargos.php", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    setCargos(data.cargos || []);
                } else {
                    setMensaje(data.message || "No se pudieron cargar los cargos.");
                }
            })
            .catch(() => setMensaje("Error al cargar cargos."));
    }, []);

    return (
        <div className="form-group">
            <label>{label}</label>
            {mensaje && <div className="error">{mensaje}</div>}
            <select
                className="input"
                value={idCargo || ""}
                onChange={(e) => setIdCargo(e.target.value)}
                disabled={readOnly}
            >
                <option value="">Seleccione un cargo</option>
                {cargos.map((c) => (
                    <option key={c.id_cargo} value={c.id_cargo}>
                        {c.cargo}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectCargos;
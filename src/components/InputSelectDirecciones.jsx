import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";

function InputSelectDirecciones({ idDireccion, setIdDireccion, label = "Dirección administrativa", readOnly = false }) {
    const [direcciones, setDirecciones] = useState([]);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_direcciones.php", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    setDirecciones(data.direcciones || []);
                } else {
                    setMensaje(data.message || "No se pudieron cargar las direcciones.");
                }
            })
            .catch(() => setMensaje("Error al cargar direcciones."));
    }, []);

    return (
        <div className="form-group">
            <label>{label}</label>
            {mensaje && <div className="error">{mensaje}</div>}
            <select
                className="input"
                value={idDireccion || ""}
                onChange={(e) => setIdDireccion(e.target.value)}
                disabled={readOnly}
            >
                <option value="">Seleccione una dirección</option>
                {direcciones.map((d) => (
                    <option key={d.id_direccion} value={d.id_direccion}>
                        {d.direccion_a}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectDirecciones;
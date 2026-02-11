import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";

function EliminarSwitch() {
    // Estados iniciales (los puedes ajustar más tarde)
    const [mensaje, setMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Hook global (aunque no lo uses aún)
    const { setModuloActual, setSubModuloActual } = useGlobal();

    useEffect(() => {
        // Aquí irá la lógica de fetch o eliminación
    }, []);

    return (
        <div className="sesion-form">
            <h2>Eliminar Switch</h2>
        </div>
    );
}

export default EliminarSwitch;
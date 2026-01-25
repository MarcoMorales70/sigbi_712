import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";

function EliminarTecnicos() {
    const { tecnicoSeleccionado, setModuloActual, setSubModuloActual } = useGlobal();
    const [idTecnico, setIdTecnico] = useState("");
    const [datosTecnico, setDatosTecnico] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Mecánica, Si viene desde ConsultarTecnicos.jsx y ya hay tecnicoSeleccionado va a cargar directo
    useEffect(() => {
        if (tecnicoSeleccionado) {
            fetch("http://localhost/sigbi_712/api/consulta_9.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_tecnico: tecnicoSeleccionado })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok" && data.tecnico) {
                        setDatosTecnico(data.tecnico);
                    } else {
                        setError(data.message || "Técnico no encontrado.");
                    }
                })
                .catch(() => setError("Error al cargar técnico."));
        }
    }, [tecnicoSeleccionado]);

    // Si se va a buscar el técnico manualmente (no viene de ConsultarTecnicos.jsx)
    const handleBuscar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost/sigbi_712/api/consulta_9.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_tecnico: idTecnico })
            });

            const data = await response.json();

            if (data.status === "ok" && data.tecnico) {
                setDatosTecnico(data.tecnico);
            } else {
                setError(data.message || "Técnico no encontrado.");
            }
        } catch {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Eliminar técnico
    const handleEliminar = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost/sigbi_712/api/eliminar_tecnicos.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_tecnico: tecnicoSeleccionado || idTecnico })
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("\u2705 Técnico eliminado correctamente.");
            } else {
                setError(data.message || "Error al eliminar técnico.");
            }

            setTimeout(() => {
                setModuloActual("Control");
                setSubModuloActual(null);
                setLoading(false);
            }, 3000);

        } catch {
            setError("Error de conexión con el servidor.");
            setTimeout(() => {
                setModuloActual("Control");
                setSubModuloActual(null);
                setLoading(false);
            }, 3000);
        }
    };

    return (
        <div className="sesion-form">
            {/* Mostrar formulario inicial solo si no hay tecnicoSeleccionado */}
            {!datosTecnico && !tecnicoSeleccionado && (
                <form onSubmit={handleBuscar}>

                    <InputGenerico
                        value={idTecnico}
                        setValue={setIdTecnico}
                        label="Número de empleado"
                        maxLength={7}
                        allowedChars="0-9"
                        placeholder="7120000"
                        title="Debe contener exactamente 7 dígitos numéricos"
                    />

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                </form>
            )}

            {datosTecnico && (
                <div>
                    <p>
                        ¿Seguro que deseas eliminar al técnico <strong>{datosTecnico.id_tecnico}</strong>
                        con rol <strong>{datosTecnico.nombre_rol}</strong> y estado <strong>{datosTecnico.nombre_estado}</strong>?
                    </p>
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                    <div className="form-buttons">
                        <button onClick={handleEliminar} disabled={loading}>
                            {loading ? "Eliminando..." : "Eliminar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EliminarTecnicos;
import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";

function EliminarBienes() {
    const { bienSeleccionado, setModuloActual, setSubModuloActual } = useGlobal();
    const [serieBien, setSerieBien] = useState("");
    const [datosBien, setDatosBien] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Cuando de viene desde ConsultarBienes.jsx y ya hay bienSeleccionado se carga directo
    useEffect(() => {
        if (bienSeleccionado) {
            fetch("http://localhost/sigbi_712/api/consulta_20.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ serie_bien: bienSeleccionado })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok" && data.bien) {
                        setDatosBien(data.bien);
                    } else {
                        setError(data.message || "Bien no encontrado.");
                    }
                })
                .catch(() => setError("Error al cargar bien."));
        }
    }, [bienSeleccionado]);

    // Cuando hay que buscar el bien manualmente y no viene de  ConsultarBienes.jsx
    const handleBuscar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost/sigbi_712/api/consulta_20.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ serie_bien: serieBien })
            });

            const data = await response.json();

            if (data.status === "ok" && data.bien) {
                setDatosBien(data.bien);
            } else {
                setError(data.message || "Bien no encontrado.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Eliminar bien
    const handleEliminar = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost/sigbi_712/api/eliminar_bienes.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ serie_bien: bienSeleccionado || serieBien })
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("\u2705 Bien eliminado correctamente.");
            } else {
                setError(data.message || "Error al eliminar bien.");
            }

            setTimeout(() => {
                setModuloActual("Control");
                setSubModuloActual(null);
                setLoading(false);
            }, 3000);

        } catch (err) {
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
            {/* Mostrar formulario inicial solo si no hay bienSeleccionado */}
            {!datosBien && !bienSeleccionado && (
                <form onSubmit={handleBuscar}>

                    <InputGenerico
                        value={serieBien}
                        setValue={setSerieBien}
                        label="Serie del bien a eliminar"
                        maxLength={30}
                        allowedChars="A-Z0-9_\\-"
                        transform="uppercase"
                        placeholder="MXL1234ABC"
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

            {datosBien && (
                <div>
                    <p>
                        ¿Seguro que deseas eliminar el bien con serie <strong>{datosBien.serie_bien}</strong>,
                        marca <strong>{datosBien.marca}</strong>, modelo <strong>{datosBien.modelo}</strong>,
                        usuario <strong>{`${datosBien.a_paterno} ${datosBien.a_materno} ${datosBien.usuario}`}</strong>,
                        y IP <strong>{datosBien.ip || "N/A"}</strong>?
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

export default EliminarBienes;
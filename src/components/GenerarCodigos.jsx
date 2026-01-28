import React, { useState } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";

function GenerarCodigos() {
    const { setModuloActual, setSubModuloActual } = useGlobal();
    const [idTecnico, setIdTecnico] = useState("");
    const [codigoGenerado, setCodigoGenerado] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGenerar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/generar_codigos.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_tecnico: idTecnico, id_permiso: 10 })
            });

            const data = await response.json();

            if (data.status === "ok" && data.codigo) {
                setCodigoGenerado(data.codigo);
                setSuccess("\u2705 Código generado correctamente.");
            } else {
                setError(data.message || "Error al generar código.");
            }
        } catch {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleContinuar = () => {
        setModuloActual("Control");
        setSubModuloActual(null);
    };

    return (
        <div className="sesion-form">
            {!codigoGenerado && (
                <form onSubmit={handleGenerar}>

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
                            {loading ? "Generando..." : "Generar código"}
                        </button>
                    </div>
                </form>
            )}

            {codigoGenerado && (
                <div>
                    <p>El código generado para el técnico <strong>{idTecnico}</strong> es:</p>
                    <h2>{codigoGenerado}</h2>
                    {success && <div className="success">{success}</div>}
                    {error && <div className="error">{error}</div>}
                    <div className="form-buttons">
                        <button onClick={handleContinuar}>Continuar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GenerarCodigos;
import React, { useState } from "react";
import "../styles/Formularios.css";
import InputGenerico from "./InputGenerico";
import Hardware from "./Hardware";

function ReactivarBienes() {
    // Definición de los estados
    const [serieBien, setSerieBien] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [mostrarHardware, setMostrarHardware] = useState(false);

    // Función para activar los estados y validar el ingreso de uns serie
    const handleReactivar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!serieBien.trim()) {
            setError("Debe ingresar la serie del bien.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost/sigbi_712/api/reactivar_bienes.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ serie_bien: serieBien })
            });
            const data = await response.json();
            if (data.status === "ok") {
                setSuccess(data.message);
                setTimeout(() => setMostrarHardware(true), 3000);
            } else {
                setError(data.message || "Error al reactivar el bien.");
                setTimeout(() => setMostrarHardware(true), 3000);
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Render condicional
    if (mostrarHardware) {
        return <Hardware />;
    }

    return (
        <div className="sesion-form">
            <h2>Reactivar Bien</h2>
            <form onSubmit={handleReactivar}>

                <InputGenerico
                    value={serieBien}
                    setValue={setSerieBien}
                    label="Serie del bien a reactivar"
                    maxLength={30}
                    allowedChars="A-Z0-9_\\-"
                    transform="uppercase"
                    placeholder="MXL1234ABC"
                />

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}
                <div className="form-buttons">
                    <button type="submit" disabled={loading}>
                        {loading ? "Reactivando..." : "Reactivar bien"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReactivarBienes;
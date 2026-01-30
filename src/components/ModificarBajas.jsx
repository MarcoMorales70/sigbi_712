import React, { useState, useEffect, useContext } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import Hardware from "./Hardware";
import InputGenerico from "./InputGenerico";
import { useGlobal } from "../context/ContenedorGlobal";

function ModificarBajas() {

    const { moduloActual, setModuloActual, subModuloActual, setSubModuloActual } = useGlobal();
    const [bajas, setBajas] = useState([]);
    const [id_baja_actual, setIdBajaActual] = useState(null);
    const [baja_actual, setBajaActual] = useState("");
    const [dictamenes, setDictamenes] = useState([]);
    const [bienes, setBienes] = useState([]);
    const [bienesFiltrados, setBienesFiltrados] = useState([]);
    const [paso, setPaso] = useState(1);
    const [bloqueados, setBloqueados] = useState({ paso1: false, paso2: false });
    const [serieSeleccionada, setSerieSeleccionada] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Efecto secundario del paso 1, consultar bajas registradas
    useEffect(() => {
        fetch(`${API_URL}/consultar_bajas.php`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (data.status === "ok") {
                    setBajas(data.bajas || []);
                } else {
                    setError(data.message);
                    setTimeout(() => {
                        setModuloActual("hardware");
                        setSubModuloActual(null);
                    }, 3000);
                }
            })
            .catch(() => setError("Error al cargar bajas."));
    }, []);

    // Del paso 2, consultar dictámenes y bienes de la baja asociada
    const handleContinuar = async () => {
        if (!id_baja_actual) return;
        setBloqueados(prev => ({ ...prev, paso1: true }));
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/consulta_23.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_baja_actual })
            });
            const data = await response.json();
            if (data.status === "ok") {
                setDictamenes(data.dictamenes || []);
                setBienes(data.bienes || []);
                setBajaActual(data.baja_actual);
                setPaso(2);
            } else {
                setError(data.message || "Error al consultar dictámenes.");
            }
        } catch {
            setError("Error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Para el paso 3, filtrar bienes por dictamen
    const handleModificarDictamen = (id_dictamen) => {
        setBloqueados(prev => ({ ...prev, paso2: true }));
        const filtrados = bienes.filter(b => b.id_dictamen === id_dictamen);
        setBienesFiltrados(filtrados);
        setPaso(3);
    };

    // Para el paso final, modificar bienes
    const handleModificarBienes = async () => {
        if (!serieSeleccionada) {
            setError("Selecciona un bien para modificar.");
            return;
        }

        setError("");
        setSuccess("");
        setLoading(true);

        try { // Se elimina y etiqueta el bien de la baja eliminada
            const response = await fetch(`${API_URL}/reactivar_bienes.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ serie_bien: serieSeleccionada })
            });
            const data = await response.json();
            if (data.status === "ok") {
                setSuccess("\u2705 Bien eliminado de la baja correctamente.");
                setTimeout(() => {
                    setModuloActual("hardware");
                    setSubModuloActual(null);
                }, 3000);
            } else {
                setError(data.message || "Error al eliminar el bien.");
            }
        } catch {
            setError("Error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Render condicional
    if (moduloActual === "hardware" && subModuloActual === null) {
        return <Hardware />;
    }

    return (
        <div className="sesion-form">
            <h2>Modificar Bajas</h2>

            {/* Paso 1, se genera la tabla de bajas*/}
            {paso === 1 && (
                <>
                    <table className="tabla-estandar seleccion-unica">
                        <thead>
                            <tr>
                                <th>Seleccionar</th>
                                <th>Baja</th>
                                <th>Total Dictámenes</th>
                                <th>Total Bienes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bajas.map(b => (
                                <tr key={b.id_baja}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            disabled={bloqueados.paso1}
                                            checked={id_baja_actual === b.id_baja}
                                            onChange={() =>
                                                setIdBajaActual(id_baja_actual === b.id_baja ? null : b.id_baja)
                                            }
                                        />
                                    </td>
                                    <td>{b.baja}</td>
                                    <td>{b.total_dictamenes}</td>
                                    <td>{b.total_bienes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="acciones">
                        <button onClick={handleContinuar} disabled={!id_baja_actual || bloqueados.paso1 || loading}>
                            {loading ? "Cargando..." : "Continuar"}
                        </button>
                    </div>
                </>
            )}

            {/* Paso 2,  mostrar los dictamenes asociados para elegir 1*/}
            {paso === 2 && (
                <>
                    <InputGenerico
                        value={baja_actual}
                        setValue={setBajaActual}
                        label="Número de baja"
                        readOnly={true}
                        maxLength={20}
                        allowedChars="0-9A-Z /_\-"
                        placeholder="2026/01"
                        title="Máximo 20 caracteres"
                    />

                    {dictamenes.map(d => (
                        <div key={d.id_dictamen} style={{ display: "flex", gap: "10px", alignItems: "center" }}>

                            <InputGenerico
                                value={d.id_dictamen}
                                setValue={() => { }}
                                label="Dictamen"
                                readOnly={true}
                                maxLength={6}
                                allowedChars="0-9"
                                placeholder="123456"
                                title="Máximo 6 dígitos"
                            />

                            <button onClick={() => handleModificarDictamen(d.id_dictamen)} disabled={bloqueados.paso2}>
                                Modificar
                            </button>
                        </div>
                    ))}
                </>
            )}

            {/* Paso 3, se muestran los bienes asociados para poder reactivar*/}
            {paso === 3 && (
                <>
                    <table className="tabla-estandar">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Serie Bien</th>
                                <th>Quitar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bienesFiltrados.map((bien, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{bien.serie_bien}</td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={serieSeleccionada === bien.serie_bien}
                                            onChange={() =>
                                                setSerieSeleccionada(
                                                    serieSeleccionada === bien.serie_bien ? null : bien.serie_bien
                                                )
                                            }
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="acciones">
                        <button onClick={handleModificarBienes} disabled={loading}>
                            {loading ? "Modificando..." : "Modificar"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ModificarBajas;
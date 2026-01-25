import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import Hardware from "./Hardware";

function EliminarBajas({ idBajaInicial, bajaInicial, totalDictamenesInicial, totalBienesInicial }) {
    const [bajas, setBajas] = useState([]);
    const [idBajaSeleccionado, setIdBajaSeleccionado] = useState(idBajaInicial || null);
    const [bajaSeleccionada, setBajaSeleccionada] = useState(bajaInicial || "");
    const [totalDictamenesSel, setTotalDictamenesSel] = useState(totalDictamenesInicial || 0);
    const [totalBienesSel, setTotalBienesSel] = useState(totalBienesInicial || 0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [mostrarHardware, setMostrarHardware] = useState(false);
    const [confirmar, setConfirmar] = useState(!!idBajaInicial);

    // Si no viene una baja seleccionada, cargar listado de bajas
    useEffect(() => {
        if (!idBajaInicial) {
            const fetchBajas = async () => {
                try {
                    const response = await fetch("http://localhost/sigbi_712/api/consultar_bajas.php", {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include"
                    });
                    const data = await response.json();
                    if (data.status === "ok") {
                        if (data.bajas.length === 0) {
                            setError("No existen bajas registradas. Redirigiendo a Hardware...");
                            setTimeout(() => setMostrarHardware(true), 3000);
                        } else {
                            setBajas(data.bajas);
                        }
                    } else {
                        setError(data.message || "Error al consultar bajas.");
                        setTimeout(() => setMostrarHardware(true), 3000);
                    }
                } catch (err) {
                    setError("Error de conexión con el servidor.");
                }
            };
            fetchBajas();
        }
    }, [idBajaInicial]);

    // Función para manejar la selección
    const handleSeleccion = (baja) => {
        setIdBajaSeleccionado(baja.id_baja);
        setBajaSeleccionada(baja.baja);
        setTotalDictamenesSel(baja.total_dictamenes);
        setTotalBienesSel(baja.total_bienes);
        setConfirmar(false);
    };

    const handleEliminar = async () => {
        try {
            const response = await fetch("http://localhost/sigbi_712/api/eliminar_bajas.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_baja_seleccionado: idBajaSeleccionado,
                    baja_seleccionada: bajaSeleccionada
                })
            });
            const data = await response.json();
            if (data.status === "ok") {
                setSuccess("\u2705 Baja eliminada con éxito. Redirigiendo a Hardware...");
                setTimeout(() => setMostrarHardware(true), 3000);
            } else {
                setError(data.message || "Error al eliminar la baja.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        }
    };

    if (mostrarHardware) {
        return <Hardware />;
    }

    return (
        <div className="sesion-form">
            <h2>Eliminar Bajas</h2>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            {/* Si no hay props iniciales y no está en confirmación muestra listado */}
            {!idBajaInicial && !confirmar && (
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
                            {bajas.map((b) => (
                                <tr key={b.id_baja}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={idBajaSeleccionado === b.id_baja}
                                            onChange={() => handleSeleccion(b)}
                                        />
                                    </td>
                                    <td>{b.baja}</td>
                                    <td>{b.total_dictamenes}</td>
                                    <td>{b.total_bienes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="form-buttons">
                        <button
                            type="button"
                            disabled={!idBajaSeleccionado}
                            onClick={() => setConfirmar(true)}
                        >
                            Eliminar
                        </button>
                    </div>
                </>
            )}

            {/* Bloque de confirmación */}
            {confirmar && (
                <div>
                    <p>
                        ¿Seguro que deseas eliminar la baja <strong>{bajaSeleccionada}</strong> que consta de{" "}
                        <strong>{totalDictamenesSel}</strong> dictámenes con un total de{" "}
                        <strong>{totalBienesSel}</strong> bienes?
                    </p>
                    <div className="form-buttons">
                        <button onClick={handleEliminar}>Eliminar</button>
                        {!idBajaInicial && (
                            <button onClick={() => setConfirmar(false)}>Cancelar</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EliminarBajas;
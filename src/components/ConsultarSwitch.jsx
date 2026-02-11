import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";

function ConsultarSwitch() {
    const { setModuloActual, setSubModuloActual, setElementoSeleccionado } = useGlobal();

    const [arraySwitches, setArraySwitches] = useState([]);
    const [switchSeleccionado, setSwitchSeleccionado] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmar, setConfirmar] = useState(false);  // Estado para controlar el mensaje de confirmación de eliminar

    // Función inicial para llenar el array que contendra los switches existentes: arraySwitches
    useEffect(() => {
        const fetchSwitches = async () => {
            setLoading(true);
            setError("");
            setSuccess("");

            try {
                const response = await fetch(`${API_URL}/consultar_switches.php`, {
                    method: "GET",
                    credentials: "include"
                });

                const data = await response.json();

                if (data.status === "ok") {
                    setArraySwitches(data.data);
                    setSuccess("Registros encontrados.");
                } else {
                    setError(data.message || "Error al consultar switches.");
                    setTimeout(() => {
                        setModuloActual("Red");
                        setSubModuloActual(null);
                        setConfirmar(false);
                    }, 2000);
                }
            } catch (err) {
                setError("Error de conexión con el servidor: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSwitches(); // Ejecutar esta función
    }, []);

    const handleSelect = (id) => {
        setSwitchSeleccionado(id);
    };

    // Función para exportar uno o todos los registros
    const handleExportar = () => {
        let registrosParaExportar = [];

        if (switchSeleccionado) {
            const seleccionado = arraySwitches.find(sw => sw.nom_switch === switchSeleccionado);
            if (seleccionado) {
                registrosParaExportar = [seleccionado];  // Se asigna el objeto "seleccionado" 
            }
        } else {
            registrosParaExportar = arraySwitches;  // Se asigna todo el objeto de arrays al array de los registros para exportar
        }

        // Definiendo los encabezados de las columnas para el archivo a exportar
        const headers = [
            "Nombre",
            "Serie",
            "MAC",
            "Puertos",
            "Sede",
            "Edificio",
            "Nivel",
            "Descripción"
        ];

        // Convertir a CSV
        const csvRows = [];
        csvRows.push(headers.join(",")); // La primera fila serán los encabezados

        registrosParaExportar.forEach(sw => {   // Las filas siguientes seran los registros que esten en el array registrosParaExportar
            const row = [
                `"${sw.nom_switch}"`,
                `"${sw.serie_sw}"`,
                `"${sw.mac_sw}"`,
                `"${sw.puertos}"`,
                `"${sw.acronimo}"`,
                `"${sw.edificio}"`,
                `"${sw.nivel}"`,
                `"${sw.desc_switch}"`
            ];
            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");

        // Crear archivo descargable
        const BOM = "\uFEFF"; // Marca de Orden de Bytes para UTF-8
        const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "switches.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función que abre la ventana de confirmación
    const pedirConfirmacionEliminar = () => {
        if (!switchSeleccionado) {
            setError("Por favor selecciona un registro para eliminar.");
            return;
        }
        setConfirmar(true); // Activa el bloque de confirmación
    };

    // Función asincrónica para eliminar un switch
    const handleEliminar = async () => {
        const seleccionado = arraySwitches.find(sw => sw.nom_switch === switchSeleccionado);

        try {
            const response = await fetch(`${API_URL}/eliminar_switches.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom_switch: seleccionado.nom_switch }),
                credentials: "include"
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("Switch eliminado correctamente.");
                setArraySwitches(prev => prev.filter(sw => sw.nom_switch !== seleccionado.nom_switch));

            } else {
                setError("Error al eliminar: " + (data.message || "Error desconocido."));
            }
        } catch (err) {
            setError("Error de conexión con el servidor: " + err.message);
        } finally {
            setTimeout(() => {
                setModuloActual("Red");
                setSubModuloActual(null);
                setConfirmar(false);
            }, 2000);
        }
    };

    // Función para desmarcar
    const handleDesmarcar = () => {
        setSwitchSeleccionado(null);
        setElementoSeleccionado(null);
    };

    // Función para modificar un switch
    const handleModificar = () => {
        if (!switchSeleccionado) {
            alert("Por favor selecciona un switch para modificar.");
            return;
        }

        const seleccionado = arraySwitches.find(sw => sw.nom_switch === switchSeleccionado);

        if (seleccionado) {
            setElementoSeleccionado(seleccionado);
            setModuloActual("Red");
            setSubModuloActual("Modificar Switch");
            setConfirmar(false);
        }
    };

    // Función para modificar los puertos del switch seleccionado
    const handleModificarPuertos = () => {
        if (!switchSeleccionado) {
            alert("Por favor selecciona un switch para modificar.");
            return;
        }

        const seleccionado = arraySwitches.find(sw => sw.nom_switch === switchSeleccionado);

        if (seleccionado) {
            setElementoSeleccionado(seleccionado);
            setModuloActual("Red");
            setSubModuloActual("Modificar Puertos Switch");
            setConfirmar(false);
        }
    };

    return (
        <div className="sesion-form">
            {loading && <p>Cargando switches...</p>}
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            {arraySwitches.length > 0 && (
                <table className="tabla-estandar seleccion-unica">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Nombre</th>
                            <th>Serie</th>
                            <th>Sede</th>
                            <th>Edificio</th>
                            <th>Nivel</th>
                        </tr>
                    </thead>
                    <tbody>
                        {arraySwitches.map((sw, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={switchSeleccionado === sw.nom_switch}
                                        onChange={() => handleSelect(sw.nom_switch)}
                                    />
                                </td>
                                <td>{sw.nom_switch}</td>
                                <td>{sw.serie_sw}</td>
                                <td>{sw.acronimo}</td>
                                <td>{sw.edificio}</td>
                                <td>{sw.nivel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {arraySwitches.length > 0 && (
                <div className="acciones">
                    <button type="button" onClick={handleModificar} disabled={!switchSeleccionado}>Modificar</button>
                    <button type="button" onClick={handleModificarPuertos} disabled={!switchSeleccionado}>Modificar puertos</button>
                    <button type="button" onClick={pedirConfirmacionEliminar} disabled={!switchSeleccionado}>Eliminar</button>
                    <button type="button" onClick={handleExportar}>Exportar</button>
                    <button type="button" onClick={handleDesmarcar} disabled={!switchSeleccionado}>Desmarcar</button>
                </div>
            )}

            {/* Bloque de confirmación */}
            {confirmar && (
                <div className="confirmacion-overlay">
                    <div className="confirmacion-modal">
                        <p>¿Seguro que deseas eliminar el switch <strong>{switchSeleccionado}</strong>?</p>
                        <div className="form-buttons">
                            <button onClick={handleEliminar}>Eliminar</button>
                            <button onClick={() => setConfirmar(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default ConsultarSwitch;
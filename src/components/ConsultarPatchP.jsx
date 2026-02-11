import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";

function ConsultarPatchP() {
    const { setModuloActual, setSubModuloActual, setElementoSeleccionado } = useGlobal();

    const [arrayPatchPanels, setArrayPatchPanels] = useState([]);
    const [patchSeleccionado, setPatchSeleccionado] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmar, setConfirmar] = useState(false);  // Estado para controlar el mensaje de confirmación de eliminar

    // Función inicial para llenar el array que contendra los patch panels existentes: arrayPatchPanels
    useEffect(() => {
        const fetchPatchPanels = async () => {
            setLoading(true);
            setError("");
            setSuccess("");

            try {
                const response = await fetch(`${API_URL}/consultar_patch_panels.php`, {
                    method: "GET",
                    credentials: "include"
                });

                const data = await response.json();

                if (data.status === "ok") {
                    setArrayPatchPanels(data.data);
                    setSuccess("Registros encontrados.");
                } else {
                    setError(data.message || "Error al consultar patch panels.");
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

        fetchPatchPanels(); // Ejecutar esta función
    }, []);

    const handleSelect = (pp) => {
        setPatchSeleccionado(pp);
    };

    // Función para exportar uno o todos los registros
    const handleExportar = () => {
        let registrosParaExportar = [];

        if (patchSeleccionado) {
            const seleccionado = arrayPatchPanels.find(pp => pp.patch === patchSeleccionado);
            if (seleccionado) {
                registrosParaExportar = [seleccionado];  // Se asigna el objeto "seleccionado" exporta un solo patch panel
            }
        } else {
            registrosParaExportar = arrayPatchPanels;  // Se asigna todo el objeto de arrays al array de los registros para exportar
        }

        // Definiendo los encabezados de las columnas para el archivo a exportar
        const headers = [
            "Nombre",
            "Puertos",
            "nodos",
            "Sede",
            "Edificio",
            "Nivel",
            "Descripción"
        ];

        // Convertir a CSV
        const csvRows = [];
        csvRows.push(headers.join(",")); // La primera fila serán los encabezados

        registrosParaExportar.forEach(pp => {   // Las filas siguientes seran los registros que esten en el array registrosParaExportar
            const row = [
                `"${pp.patch}"`,
                `"${pp.puertos}"`,
                `"${pp.nodos}"`,
                `"${pp.acronimo}"`,
                `"${pp.edificio}"`,
                `"${pp.nivel}"`,
                `"${pp.desc_patch}"`
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
        link.setAttribute("download", "patch_panels.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función que abre la ventana de confirmación
    const pedirConfirmacionEliminar = () => {
        if (!patchSeleccionado) {
            setError("Por favor selecciona un registro para eliminar.");
            return;
        }
        setConfirmar(true); // Activa el bloque de confirmación
    };

    // Función asincrónica para eliminar un patch panel
    const handleEliminar = async () => {
        const seleccionado = arrayPatchPanels.find(pp => pp.patch === patchSeleccionado);

        try {
            const response = await fetch(`${API_URL}/eliminar_patch_panels.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ patch: seleccionado.patch }),
                credentials: "include"
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("Patch Panel eliminado correctamente.");
                setArrayPatchPanels(prev => prev.filter(pp => pp.patch !== seleccionado.patch));
                setTimeout(() => {
                    setModuloActual("Red");
                    setSubModuloActual(null);
                    setConfirmar(false);
                }, 2000);
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
        setPatchSeleccionado(null);
        setElementoSeleccionado(null);
    };

    // Función para modificar un patch panel
    const handleModificar = () => {
        if (!patchSeleccionado) {
            alert("Por favor selecciona un patch panel para modificar.");
            return;
        }

        const seleccionado = arrayPatchPanels.find(pp => pp.patch === patchSeleccionado);

        if (seleccionado) {
            setElementoSeleccionado(seleccionado);
            setModuloActual("Red");
            setSubModuloActual("Modificar Patch Panel");
            setConfirmar(false);
        }
    };

    // Función para modificar los puertos del patch panel seleccionado
    const handleModificarPuertos = () => {
        if (!patchSeleccionado) {
            alert("Por favor selecciona un patch panel para modificar.");
            return;
        }

        const seleccionado = arrayPatchPanels.find(pp => pp.patch === patchSeleccionado);

        if (seleccionado) {
            setElementoSeleccionado(seleccionado);
            setModuloActual("Red");
            setSubModuloActual("Modificar Puertos Patch");
            setConfirmar(false);
        }
    };

    return (
        <div className="sesion-form">
            {loading && <p>Cargando patch panels...</p>}
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            {arrayPatchPanels.length > 0 && (
                <table className="tabla-estandar seleccion-unica">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Nombre</th>
                            <th>Sede</th>
                            <th>Edificio</th>
                            <th>Nivel</th>
                        </tr>
                    </thead>
                    <tbody>
                        {arrayPatchPanels.map((pp, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={patchSeleccionado === pp.patch}
                                        onChange={() => handleSelect(pp.patch)}
                                    />
                                </td>
                                <td>{pp.patch}</td>
                                <td>{pp.acronimo}</td>
                                <td>{pp.edificio}</td>
                                <td>{pp.nivel}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {arrayPatchPanels.length > 0 && (
                <div className="acciones">
                    <button type="button" onClick={handleModificar} disabled={!patchSeleccionado}>Modificar</button>
                    <button type="button" onClick={handleModificarPuertos} disabled={!patchSeleccionado}>Modificar puertos</button>
                    <button type="button" onClick={pedirConfirmacionEliminar} disabled={!patchSeleccionado}>Eliminar</button>
                    <button type="button" onClick={handleExportar}>Exportar</button>
                    <button type="button" onClick={handleDesmarcar} disabled={!patchSeleccionado}>Desmarcar</button>
                </div>
            )}

            {/* Bloque de confirmación */}
            {confirmar && (
                <div className="confirmacion-overlay">
                    <div className="confirmacion-modal">
                        <p>¿Seguro que deseas eliminar el patch panel <strong>{patchSeleccionado}</strong>?</p>
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

export default ConsultarPatchP;
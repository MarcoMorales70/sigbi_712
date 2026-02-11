import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputSelectEstados from "./InputSelectEstados";
import InputSelectSiNo from "./InputSelectSiNo";

function ModificarPuertosSwitch() {
    const { setModuloActual, setSubModuloActual, elementoSeleccionado, setElementoSeleccionado } = useGlobal();

    const [arrayPuertosSw, setArrayPuertosSw] = useState([]);
    const [nomTabla, setNomTabla] = useState(elementoSeleccionado.nom_switch);
    const [puertoSw, setPuertoSw] = useState("");
    const [idEstado, setIdEstado] = useState("");
    const [estado, setEstado] = useState("");
    const [voz, setVoz] = useState("");
    const [datos, setDatos] = useState("");
    const [puertoPp, setPuertoPp] = useState("");
    const [notasPsw, setNotasPsw] = useState("");
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [puertoSeleccionado, setPuertoSeleccionado] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    useEffect(() => {
        const fetchPuertos = async () => {
            setLoading(true);
            setError("");
            setSuccess("");

            try {
                if (elementoSeleccionado) {
                    const res = await fetch(`${API_URL}/consultar_puertos_sw.php?nom_switch=` + nomTabla, {
                        credentials: "include"
                    });
                    const data = await res.json();

                    if (data.status === "ok") {
                        setArrayPuertosSw(data.data);
                        setSuccess("Lista de puertos del switch.");
                    } else {
                        setError(data.message || "Error al consultar los puertos.");
                        setTimeout(() => {
                            setModuloActual("Red");
                            setSubModuloActual(null);
                        }, 2000);
                    }
                }
            } catch (err) {
                setError("Error de conexión con el servidor: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPuertos();
    }, []);

    // Se renderiza puertoSeleccionado con el nuevo valor
    const handleSelect = (pt) => {
        setPuertoSeleccionado(pt);
    }

    // Función para exportar uno o todos los puertos
    const handleExportar = () => {
        let puertosParaExportar = [];

        if (puertoSeleccionado) {
            puertosParaExportar = [puertoSeleccionado];  // Se asigna el objeto "seleccionado" para exportar
        } else {
            puertosParaExportar = arrayPuertosSw;  // Se asigna todo el array de puertos al array de los puertos para exportar
        }

        // Definiendo los encabezados de las columnas para el archivo a exportar
        const headers = [
            "Puerto",
            "Estado",
            "Voz",
            "Datos",
            "Puerto PP"
        ];

        // Convertir a CSV
        const csvRows = [];
        csvRows.push(headers.join(",")); // La primera fila serán los encabezados

        puertosParaExportar.forEach(pt => {   // Las filas siguientes seran el o los puertos que esten en el array puertosParaExportar
            const row = [
                `"${pt.puerto_sw}"`,
                `"${pt.estado}"`,
                `"${pt.voz}"`,
                `"${pt.datos}"`,
                `"${pt.puerto_pp}"`
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
        link.setAttribute("download", "puertos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función para desmarcar
    const handleDesmarcar = () => {
        setPuertoSeleccionado(null);
    };

    // Función para mostrar el formulario para modificar un puerto
    const handleModificar = () => {
        if (!puertoSeleccionado) {
            alert("Por favor selecciona un puerto para modificar.");
            return;
        }
        setMostrarFormulario(true);
    };


    const handleCancelar = () => {
        setMostrarFormulario(false);
        setPuertoSeleccionado(null);
    };

    // Efecto de sincronización de estado del puertoSeleccionado
    useEffect(() => {
        if (puertoSeleccionado) {
            setPuertoSw(puertoSeleccionado.puerto_sw || "");
            setIdEstado(puertoSeleccionado.id_estado || "");
            setVoz(puertoSeleccionado.voz || "");
            setDatos(puertoSeleccionado.datos || "");
            setPuertoPp(puertoSeleccionado.puerto_pp || "");
            setNotasPsw(puertoSeleccionado.notas_puerto_sw)
            setEstado(puertoSeleccionado.estado || "");
        }
    }, [puertoSeleccionado]);

    // Función handleSubmit para modificar el puerto
    const handleModificarPuerto = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch(`${API_URL}/modificar_puertos_sw.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    nom_switch: nomTabla,
                    puerto_sw: puertoSw,
                    id_estado: idEstado,
                    voz: voz,
                    datos: datos,
                    puerto_pp: puertoPp,
                    notas_puerto_sw: notasPsw
                })
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("Puerto modificado correctamente.");
                setTimeout(() => {
                    setModuloActual("Red");
                    setSubModuloActual(null);
                }, 2000);
            } else {
                setError(data.message || "Error al modificar el puerto.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {!mostrarFormulario ? (

                <div className="sesion-form">
                    {loading && <p>Cargando puertos...</p>}
                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}

                    {arrayPuertosSw.length > 0 && (
                        <table className="tabla-estandar seleccion-unica">
                            <thead>
                                <tr>
                                    <th>Seleccionar</th>
                                    <th>Puerto</th>
                                    <th>Estado</th>
                                    <th>Voz</th>
                                    <th>Datos</th>
                                    <th>Puerto PP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {arrayPuertosSw.map((pt, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={puertoSeleccionado?.puerto_sw === pt.puerto_sw}
                                                onChange={() => handleSelect(pt)}
                                            />
                                        </td>
                                        <td>{pt.puerto_sw}</td>
                                        <td>{pt.estado}</td>
                                        <td>{pt.voz}</td>
                                        <td>{pt.datos}</td>
                                        <td>{pt.puerto_pp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {arrayPuertosSw.length > 0 && (
                        <div className="acciones">
                            <button type="button" onClick={handleModificar} disabled={!puertoSeleccionado}>Modificar</button>
                            <button type="button" onClick={handleExportar}>Exportar</button>
                            <button type="button" onClick={handleDesmarcar} disabled={!puertoSeleccionado}>Desmarcar</button>
                        </div>
                    )}

                </div>

            ) : (

                <div className="sesion-form">

                    <form onSubmit={handleModificarPuerto}>

                        {success && <div className="success">Datos del puerto</div>}
                        {error && <div className="error">{error}</div>}

                        <InputGenerico
                            value={puertoSw}
                            setValue={setPuertoSw}
                            label="Puerto"
                            readOnly={true}
                            maxLength={12}
                            allowedChars="a-p1-9_sw"
                            transform="lowercase"
                            placeholder=""
                        />

                        <InputSelectEstados
                            idEstado={idEstado}
                            setIdEstado={setIdEstado}
                            estadoActualText={estado}
                            idEntidad={5}
                            label="Estado del puerto"
                            apiUrl={`${API_URL}/consultar_estados.php`}
                        />

                        <InputSelectSiNo
                            value={voz}
                            setValue={setVoz}
                            label="Voz"
                        />

                        <InputSelectSiNo
                            value={datos}
                            setValue={setDatos}
                            label="Datos"
                        />

                        <InputGenerico
                            value={puertoPp}
                            setValue={setPuertoPp}
                            label="Puerto en Patch Panel"
                            readOnly={false}
                            maxLength={12}
                            transform="lowercase"
                            placeholder="pp1_ep_pb_30"
                            title="Respete la nomenclatura"
                        />

                        <InputGenerico
                            value={notasPsw}
                            setValue={setNotasPsw}
                            label="Notas del puerto"
                            readOnly={false}
                            maxLength={255}
                            placeholder="Escriba su texto aquí"
                        />

                        <div className="acciones">
                            <button type="submit">Modificar</button>
                            <button type="botton" onClick={handleCancelar} >Cancelar</button>
                        </div>
                    </form>

                </div>

            )}
        </div>
    );
}

export default ModificarPuertosSwitch;
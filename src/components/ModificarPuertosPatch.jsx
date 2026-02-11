import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputSelectEstados from "./InputSelectEstados";
import InputSelectSiNo from "./InputSelectSiNo";

function ModificarPuertosPatch() {
    const { setModuloActual, setSubModuloActual, elementoSeleccionado, setElementoSeleccionado } = useGlobal();

    const [arrayPuertosPp, setArrayPuertosPp] = useState([]);
    const [nomTabla, setNomTabla] = useState(elementoSeleccionado.patch);
    const [puertoPp, setPuertoPp] = useState("");
    const [idEstado, setIdEstado] = useState("");
    const [estado, setEstado] = useState("");
    const [puertoSw, setPuertoSw] = useState("");
    const [nodo, setNodo] = useState("");
    const [serieBien, setSerieBien] = useState("");
    const [notasPpp, setNotasPpp] = useState("");
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
                    const res = await fetch(`${API_URL}/consultar_puertos_pp.php?patch=` + nomTabla, {
                        credentials: "include"
                    });
                    const data = await res.json();

                    if (data.status === "ok") {
                        setArrayPuertosPp(data.data);
                        setSuccess("Lista de puertos del Patch panel.");
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
            puertosParaExportar = arrayPuertosPp;  // Se asigna todo el array de puertos al array de los puertos para exportar
        }

        // Definiendo los encabezados de las columnas para el archivo a exportar
        const headers = [
            "Puerto",
            "Estado",
            "Puerto_sw",
            "Nodo",
            "Serie_Bien"
        ];

        // Convertir a CSV
        const csvRows = [];
        csvRows.push(headers.join(",")); // La primera fila serán los encabezados

        puertosParaExportar.forEach(pt => {   // Las filas siguientes seran el o los puertos que esten en el array puertosParaExportar
            const row = [
                `"${pt.puerto_pp}"`,
                `"${pt.estado}"`,
                `"${pt.puerto_sw}"`,
                `"${pt.nodo}"`,
                `"${pt.serie_bien}"`
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
        link.setAttribute("download", "puertos_pp.csv");
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
            setPuertoPp(puertoSeleccionado.puerto_pp || "");
            setIdEstado(puertoSeleccionado.id_estado || "");
            setPuertoSw(puertoSeleccionado.puerto_sw || "");
            setNodo(puertoSeleccionado.nodo || "");
            setSerieBien(puertoSeleccionado.serie_bien || "");
            setNotasPpp(puertoSeleccionado.notas_puerto_pp)
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
            const response = await fetch(`${API_URL}/modificar_puertos_pp.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    patch: nomTabla,
                    puerto_pp: puertoPp,
                    id_estado: idEstado,
                    puerto_sw: puertoSw,
                    nodo: nodo,
                    serie_bien: serieBien,
                    notas_puerto_pp: notasPpp
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

                    {arrayPuertosPp.length > 0 && (
                        <table className="tabla-estandar seleccion-unica">
                            <thead>
                                <tr>
                                    <th>Seleccionar</th>
                                    <th>Puerto</th>
                                    <th>Estado</th>
                                    <th>Puerto Sw</th>
                                    <th>Nodo</th>
                                    <th>Serie Bien</th>
                                </tr>
                            </thead>
                            <tbody>
                                {arrayPuertosPp.map((pt, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={puertoSeleccionado?.puerto_pp === pt.puerto_pp}
                                                onChange={() => handleSelect(pt)}
                                            />
                                        </td>
                                        <td>{pt.puerto_pp}</td>
                                        <td>{pt.estado}</td>
                                        <td>{pt.puerto_sw}</td>
                                        <td>{pt.nodo}</td>
                                        <td>{pt.serie_bien}</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {arrayPuertosPp.length > 0 && (
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
                            value={puertoPp}
                            setValue={setPuertoPp}
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
                            idEntidad={6}
                            label="Estado del puerto"
                            apiUrl={`${API_URL}/consultar_estados.php`}
                        />

                        <InputGenerico
                            value={puertoSw}
                            setValue={setPuertoSw}
                            label="Puerto en Switch"
                            readOnly={false}
                            maxLength={12}
                            transform="lowercase"
                            placeholder="pp1_ep_pb_30"
                            title="Respete la nomenclatura"
                        />

                        <InputGenerico
                            value={nodo}
                            setValue={setNodo}
                            label="Nodo"
                            maxLength={3}
                            allowedChars="0-9"
                            transform="uppercase"
                            placeholder="101"
                            title="Respete la nomenclatura 101, 201, 301"
                        />

                        <InputGenerico
                            value={serieBien}
                            setValue={setSerieBien}
                            label="Serie del bien"
                            maxLength={30}
                            allowedChars="A-Z0-9/_\-"
                            transform="uppercase"
                            placeholder="MXL1234ABC"
                        />

                        <InputGenerico
                            value={notasPpp}
                            setValue={setNotasPpp}
                            label="Notas del puerto"
                            readOnly={false}
                            maxLength={255}
                            placeholder="Escriba su texto aquí"
                            title="Máximo 255 caracteres"
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

export default ModificarPuertosPatch;
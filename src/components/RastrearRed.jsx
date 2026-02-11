import { useGlobal } from "../context/ContenedorGlobal";
import API_URL from "../config";
import { useState } from "react";
import "../styles/Formularios.css";
import InputGenerico from "./InputGenerico";

function RastrearRed() {
    const { subModuloActual, setSubModuloActual, elementoSeleccionado } = useGlobal();
    const [radioSeleccionado, setRadioSeleccionado] = useState(null);
    const [datoIngresado, setDatoIngresado] = useState("");
    const [resultado, setResultado] = useState(null);
    const [confirmado, setConfirmado] = useState(false);
    const [mensaje, setMensaje] = useState("");

    // Función genérica para rastrear según endpoint
    const rastrear = async (endpoint) => {
        try {
            const response = await fetch(`${API_URL}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ datoIngresado }),
            });

            const data = await response.json();
            if (data.status === "ok") {
                setResultado(data.resultado || []);
                setMensaje("");
            } else {
                setMensaje(data.message || "Error en la consulta.");
            }
        } catch (error) {
            setMensaje("Error al conectar con el servidor.");
        }
    };

    // Mapeo de opciones
    const opciones = {
        A: { accion: () => rastrear("rastrear_red_por_puerto_sw.php") },
        B: { accion: () => rastrear("rastrear_red_por_puerto_pp.php") },
        C: { accion: () => rastrear("rastrear_red_por_nodo.php") },
        D: { accion: () => rastrear("rastrear_red_por_ip.php") },
    };

    const exportarCSV = () => {
        if (!resultado) return;

        // Encabezados
        const encabezados = [
            "Puerto Switch",
            "Puerto Patch",
            "Nodo",
            "Tipo de Bien",
            "Serie del Bien",
            "IP",
            "Usuario"
        ];

        // Valores
        const valores = [
            resultado.datoPuertoSw,
            resultado.datoPuertoPp,
            resultado.nodo,
            resultado.tipoBien,
            resultado.serieBien,
            resultado.ip,
            `${resultado.usuario} ${resultado.aPaterno} ${resultado.aMaterno}`
        ];

        // Construir CSV
        const filas = [encabezados.join(","), valores.join(",")];
        const contenido = filas.join("\n");

        // Crear blob con BOM UTF-8 para Excel
        const blob = new Blob(
            ["\uFEFF" + contenido], // BOM, asegura que Excel detecte UTF-8
            { type: "text/csv;charset=utf-8;" }
        );

        // Disparar descarga
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "rastreo_por_elemento.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="radio-group">

            {/* Radios */}
            <label>
                <input
                    type="radio"
                    name="opcion"
                    value="A"
                    checked={radioSeleccionado === "A"}
                    onChange={(e) => setRadioSeleccionado(e.target.value)}
                    disabled={confirmado}
                />
                Puerto Switch
            </label>

            <label>
                <input
                    type="radio"
                    name="opcion"
                    value="B"
                    checked={radioSeleccionado === "B"}
                    onChange={(e) => setRadioSeleccionado(e.target.value)}
                    disabled={confirmado}
                />
                Puerto Patch Panel
            </label>

            <label>
                <input
                    type="radio"
                    name="opcion"
                    value="C"
                    checked={radioSeleccionado === "C"}
                    onChange={(e) => setRadioSeleccionado(e.target.value)}
                    disabled={confirmado}
                />
                Nodo
            </label>

            <label>
                <input
                    type="radio"
                    name="opcion"
                    value="D"
                    checked={radioSeleccionado === "D"}
                    onChange={(e) => setRadioSeleccionado(e.target.value)}
                    disabled={confirmado}
                />
                Ip
            </label>

            {/* Botón continuar solo con radios */}
            {radioSeleccionado && !confirmado && (
                <button onClick={() => setConfirmado(true)}>
                    Continuar
                </button>
            )}

            {/* Input y botones solo después de confirmar */}
            {confirmado && (
                <>
                    <InputGenerico
                        value={datoIngresado}
                        setValue={setDatoIngresado}
                        label="Ingrese el dato"
                        readOnly={false}
                        maxLength={13}
                        allowedChars="a-p1-9_sw."
                        transform="lowercase"
                        placeholder="Respete la nomenclatura"
                    />

                    <div className="form-buttons">
                        <button
                            onClick={() => {
                                if (opciones[radioSeleccionado]) {
                                    opciones[radioSeleccionado].accion();
                                }
                            }}
                        >
                            Continuar
                        </button>

                        <button
                            onClick={() => {
                                setRadioSeleccionado(null);
                                setDatoIngresado("");
                                setResultado(null);
                                setConfirmado(false); // Desbloquea los radio botones
                            }}
                        >
                            Limpiar
                        </button>
                    </div>
                </>
            )}

            {/* Mensajes de error */}
            {mensaje && <div className="error">{mensaje}</div>}

            {/* Mostrar los resultados */}
            {resultado && (
                <>
                    <div className="arbol">
                        <ul>
                            <li>
                                Puerto switch -------- {resultado.datoPuertoSw}
                                <ul>
                                    <li>
                                        Puerto patch -------- {resultado.datoPuertoPp}
                                        <ul>
                                            <li>
                                                Nodo --------------- {resultado.nodo}
                                                <ul>
                                                    <li>
                                                        Tipo de bien ------- {resultado.tipoBien}
                                                        <ul>
                                                            <li>
                                                                Serie del bien ---- {resultado.serieBien}
                                                                <ul>
                                                                    <li>
                                                                        Ip --------------- {resultado.ip}
                                                                        <ul>
                                                                            <li>
                                                                                Usuario --------- {resultado.usuario} {resultado.aPaterno} {resultado.aMaterno}
                                                                            </li>
                                                                        </ul>
                                                                    </li>
                                                                </ul>
                                                            </li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>

                    {/* Botón Exportar CSV */}
                    <button onClick={exportarCSV}>Exportar a Excel</button>
                </>
            )}
        </div>
    );
}

export default RastrearRed;
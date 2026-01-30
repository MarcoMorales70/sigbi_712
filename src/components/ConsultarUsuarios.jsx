import React, { useState } from "react";
import API_URL from "../config";
import ModificarUsuarios from "./ModificarUsuarios";
import EliminarUsuarios from "./EliminarUsuarios";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";
import "../styles/Formularios.css";

function ConsultarUsuarios() {
    const [consultaElegida, setConsultaElegida] = useState(null);
    const [idUsuario, setIdUsuario] = useState("");
    const [idCargo, setIdCargo] = useState("");
    const [idDireccion, setIdDireccion] = useState("");
    const [idSede, setIdSede] = useState("");
    const [idEdificio, setIdEdificio] = useState("");
    const [idNivel, setIdNivel] = useState("");
    const [resultados, setResultados] = useState([]);
    const [seleccionado, setSeleccionado] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [modoModificar, setModoModificar] = useState(false);
    const [modoEliminar, setModoEliminar] = useState(false);
    const [vistaActual, setVistaActual] = useState("consulta");

    const handleConsultar = async () => {
        // Se crea un objeto payload para mandarlo en el fetch
        const payload = {
            consulta_elegida: consultaElegida,
            id_usuario: idUsuario,
            id_cargo: idCargo,
            id_direccion: idDireccion,
            id_sede: idSede,
            id_edificio: idEdificio,
            id_nivel: idNivel,
        };

        try {
            const response = await fetch(`${API_URL}/consulta_27.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.status === "ok") {
                setResultados(data.resultados || []);
                setMensaje("");
                setVistaActual("resultados");
            } else {
                setMensaje(data.message || "Error en la consulta.");
            }
        } catch (error) {
            setMensaje("Error al conectar con el servidor.");
        }
    };

    const handleExportar = async () => {
        if (resultados.length === 0) return;

        let headers = [];
        let rows = [];

        try {
            if (seleccionado === null) {
                // Exportar todos los usuarios
                headers = [
                    "ID Usuario", "Usuario", "Apellido Paterno", "Apellido Materno",
                    "Correo", "Cargo", "Dirección", "Sede", "Edificio", "Nivel"
                ];
                rows = resultados.map(u => [
                    u.id_usuario,
                    u.usuario,
                    u.a_paterno,
                    u.a_materno,
                    u.correo,
                    u.cargo,
                    u.direccion_a,
                    u.acronimo,
                    u.edificio,
                    u.nivel
                ]);
            } else {
                // Exportar solo el usuario seleccionado con datos enriquecidos
                const response = await fetch(`${API_URL}/consulta_27.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ consulta_elegida: 1, id_usuario: seleccionado })
                });

                const data = await response.json();

                if (data.status === "ok" && data.resultados.length > 0) {
                    const u = data.resultados[0];
                    headers = [
                        "ID Usuario", "Usuario", "Apellido Paterno", "Apellido Materno",
                        "Correo", "Cargo", "Dirección", "Sede", "Edificio", "Nivel"
                    ];
                    rows = [[
                        u.id_usuario,
                        u.usuario,
                        u.a_paterno,
                        u.a_materno,
                        u.correo,
                        u.cargo,
                        u.direccion_a,
                        u.acronimo,
                        u.edificio,
                        u.nivel
                    ]];
                } else {
                    alert("Error al consultar usuario: " + data.message);
                    return;
                }
            }

            // Generar CSV
            let csvContent = "\uFEFF";  // Caracter invisible para codificación correcta

            // Encabezados con comillas
            csvContent += headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(",") + "\r\n";

            rows.forEach(r => {
                const rowEscaped = r.map(field => {
                    let value = String(field ?? "");
                    value = value.replace(/"/g, '""');  // Escapar comillas dobles
                    return `"${value}"`;    // Encerrar siempre entre comillas
                });
                csvContent += rowEscaped.join(",") + "\r\n";
            });

            // Crear Blob y exportar
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "usuarios.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            alert("Error al exportar: " + error.message);
        }
    };

    // Si estamos en modo modificar, renderizamos ModificarUsuarios directamente
    if (modoModificar && seleccionado) {
        return <ModificarUsuarios idUsuarioSeleccionado={seleccionado} />;
    }

    // Si estamos en modo eliminar, renderizamos EliminarUsuarios directamente
    if (modoEliminar && seleccionado) {
        return <EliminarUsuarios idUsuarioSeleccionado={seleccionado} />;
    }

    if (vistaActual === "modificar" && seleccionado) {
        return (
            <ModificarUsuarios
                idUsuarioSeleccionado={seleccionado}
                onVolver={() => setVistaActual("resultados")}
            />
        );
    }

    if (vistaActual === "eliminar" && seleccionado) {
        return (
            <EliminarUsuarios
                idUsuarioSeleccionado={seleccionado}
                onVolver={() => setVistaActual("resultados")}
            />
        );
    }

    return (
        <div className="sesion-form">

            {/* Vista de consulta */}
            {vistaActual === "consulta" && (
                <>
                    {/* Bloque de radio botones */}
                    <div className="form-group">
                        <label><input type="radio" name="consulta" value="1" onChange={() => setConsultaElegida(1)} /> No. Empleado</label>
                        <label><input type="radio" name="consulta" value="2" onChange={() => setConsultaElegida(2)} /> Cargo</label>
                        <label><input type="radio" name="consulta" value="3" onChange={() => setConsultaElegida(3)} /> Dirección Administrativa</label>
                        <label><input type="radio" name="consulta" value="4" onChange={() => setConsultaElegida(4)} /> Sede</label>
                        <label><input type="radio" name="consulta" value="5" onChange={() => setConsultaElegida(5)} /> Todos los usuarios</label>
                    </div>

                    {/* Inputs condicionales */}
                    <div className="inputs-condicionales">
                        {consultaElegida === 1 && (
                            <InputGenerico
                                value={idUsuario}
                                setValue={setIdUsuario}
                                label="Número de empleado"
                                maxLength={7}
                                allowedChars="0-9"
                                placeholder="7120000"
                                title="Debe contener exactamente 7 dígitos numéricos"
                            />
                        )}

                        {consultaElegida === 2 && (
                            <InputSelectGenerico
                                idSeleccionado={idCargo}
                                setIdSeleccionado={setIdCargo}
                                label="Cargo"
                                apiUrl={`${API_URL}/consultar_cargos.php`}
                                valueField="id_cargo"
                                displayField="cargo"
                                readOnly={false}
                                showDefaultOption={true}
                                defaultOptionText="Seleccione un cargo"
                            />
                        )}

                        {consultaElegida === 3 && (
                            <InputSelectGenerico
                                idSeleccionado={idDireccion}
                                setIdSeleccionado={setIdDireccion}
                                label="Dirección Administrativa"
                                apiUrl={`${API_URL}/consultar_direcciones.php`}
                                valueField="id_direccion"
                                displayField="direccion_a"
                                readOnly={false}
                                showDefaultOption={true}
                                defaultOptionText="Seleccione Dirección Administrativa"
                            />
                        )}

                        {consultaElegida === 4 && (
                            <>
                                <InputSelectGenerico
                                    idSeleccionado={idSede}
                                    setIdSeleccionado={setIdSede}
                                    label="Sede"
                                    apiUrl={`${API_URL}/consultar_sedes.php`}
                                    valueField="id_sede"
                                    displayField="acronimo"
                                    readOnly={false}
                                    showDefaultOption={true}
                                    defaultOptionText="Seleccione una sede"
                                />

                                <InputSelectGenerico
                                    idSeleccionado={idEdificio}
                                    setIdSeleccionado={setIdEdificio}
                                    label="Edificio"
                                    apiUrl={`${API_URL}/consultar_edificios.php`}
                                    valueField="id_edificio"
                                    displayField="edificio"
                                    readOnly={false}
                                    showDefaultOption={true}
                                    defaultOptionText="Seleccione un edificio"
                                />

                                <InputSelectGenerico
                                    idSeleccionado={idNivel}
                                    setIdSeleccionado={setIdNivel}
                                    label="Nivel"
                                    apiUrl={`${API_URL}/consultar_niveles.php`}
                                    valueField="id_nivel"
                                    displayField="nivel"
                                    readOnly={false}
                                    showDefaultOption={true}
                                    defaultOptionText="Seleccione un piso o nivel"
                                />
                            </>
                        )}

                        {/* Botón consultar */}
                        <div className="form-buttons">
                            <button type="button" onClick={handleConsultar}>Consultar</button>
                        </div>

                        {/* Mensajes */}
                        {mensaje && <div className="error">{mensaje}</div>}
                    </div>
                </>
            )}

            {/* Vista de resultados */}
            {vistaActual === "resultados" && (
                <>
                    {resultados.length > 0 ? (
                        <>
                            <table className="tabla-estandar seleccion-unica">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>ID Usuario</th>
                                        <th>Usuario</th>
                                        <th>A. Paterno</th>
                                        <th>A. Materno</th>
                                        <th>Correo</th>
                                        <th>Cargo</th>
                                        <th>Dirección</th>
                                        <th>Sede</th>
                                        <th>Edificio</th>
                                        <th>Nivel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultados.map((r) => (
                                        <tr key={r.id_usuario}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={seleccionado === r.id_usuario}
                                                    onChange={() =>
                                                        setSeleccionado(seleccionado === r.id_usuario ? null : r.id_usuario)
                                                    }
                                                />
                                            </td>
                                            <td>{r.id_usuario}</td>
                                            <td>{r.usuario}</td>
                                            <td>{r.a_paterno}</td>
                                            <td>{r.a_materno}</td>
                                            <td>{r.correo}</td>
                                            <td>{r.cargo}</td>
                                            <td>{r.direccion_a}</td>
                                            <td>{r.acronimo}</td>
                                            <td>{r.edificio}</td>
                                            <td>{r.nivel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Botones globales */}
                            <div className="acciones">
                                <button
                                    type="button"
                                    onClick={() => setVistaActual("modificar")}
                                    disabled={!seleccionado}
                                >
                                    Modificar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVistaActual("eliminar")}
                                    disabled={!seleccionado}
                                >
                                    Eliminar
                                </button>
                                <button
                                    type="button"
                                    className="exportar"
                                    onClick={handleExportar}
                                >
                                    Exportar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setVistaActual("consulta")}
                                >
                                    Nueva consulta
                                </button>
                            </div>
                        </>
                    ) : (
                        <div >
                            <p>No se encontraron registros para la consulta.</p>
                            <button type="button" onClick={() => setVistaActual("consulta")}>
                                Volver a consultar
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ConsultarUsuarios;
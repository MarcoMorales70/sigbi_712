import React, { useState } from "react";
import InputIdUsuario from "./InputIdUsuario";
import InputSelectCargos from "./InputSelectCargos";
import InputSelectDirecciones from "./InputSelectDirecciones";
import InputSelectSedes from "./InputSelectSedes";
import InputSelectEdificios from "./InputSelectEdificios";
import InputSelectNiveles from "./InputSelectNiveles";
import ModificarUsuarios from "./ModificarUsuarios";   // 👈 importar el componente
import EliminarUsuarios from "./EliminarUsuarios";     // 👈 importar el componente
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

    const handleConsultar = async () => {
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
            const response = await fetch("http://localhost/sigbi_712/api/consulta_27.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.status === "ok") {
                setResultados(data.resultados || []);
                setMensaje("");
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
                // 👉 Exportar todos los usuarios
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
                // 👉 Exportar solo el usuario seleccionado con datos enriquecidos
                const response = await fetch(`http://localhost/sigbi_712/api/consulta_27.php`, {
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

            // 👉 Generar CSV
            let csvContent = "\uFEFF";
            csvContent += headers.join(",") + "\r\n";
            rows.forEach(r => {
                csvContent += r.join(",") + "\r\n";
            });

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

    // 👉 Si estamos en modo modificar, renderizamos ModificarUsuarios directamente
    if (modoModificar && seleccionado) {
        return <ModificarUsuarios idUsuarioSeleccionado={seleccionado} />;
    }

    // 👉 Si estamos en modo eliminar, renderizamos EliminarUsuarios directamente
    if (modoEliminar && seleccionado) {
        return <EliminarUsuarios idUsuarioSeleccionado={seleccionado} />;
    }

    return (
        <div className="sesion-form">
            <h2>Consultar Usuarios</h2>

            {/* Bloque de radios */}
            <div className="form-group">
                <label><input type="radio" name="consulta" value="1" onChange={() => setConsultaElegida(1)} /> No. Empleado</label>
                <label><input type="radio" name="consulta" value="2" onChange={() => setConsultaElegida(2)} /> Cargo</label>
                <label><input type="radio" name="consulta" value="3" onChange={() => setConsultaElegida(3)} /> Dirección Administrativa</label>
                <label><input type="radio" name="consulta" value="4" onChange={() => setConsultaElegida(4)} /> Sede</label>
                <label><input type="radio" name="consulta" value="5" onChange={() => setConsultaElegida(5)} /> Todos los usuarios</label>
            </div>

            {/* Inputs condicionales */}
            {consultaElegida === 1 && <InputIdUsuario idUsuario={idUsuario} setIdUsuario={setIdUsuario} />}
            {consultaElegida === 2 && <InputSelectCargos idCargo={idCargo} setIdCargo={setIdCargo} />}
            {consultaElegida === 3 && <InputSelectDirecciones idDireccion={idDireccion} setIdDireccion={setIdDireccion} />}
            {consultaElegida === 4 && (
                <>
                    <InputSelectSedes idSede={idSede} setIdSede={setIdSede} />
                    <InputSelectEdificios idEdificio={idEdificio} setIdEdificio={setIdEdificio} />
                    <InputSelectNiveles idNivel={idNivel} setIdNivel={setIdNivel} />
                </>
            )}

            {/* Botón consultar */}
            <div className="form-buttons">
                <button type="button" onClick={handleConsultar}>Consultar</button>
            </div>

            {/* Mensajes */}
            {mensaje && <div className="error">{mensaje}</div>}

            {/* Resultados */}
            {resultados.length > 0 && (
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
                                            onChange={() => setSeleccionado(seleccionado === r.id_usuario ? null : r.id_usuario)}
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

                    {/* Botones globales debajo del listado */}
                    <div className="acciones">
                        <button
                            type="button"
                            onClick={() => setModoModificar(true)}
                            disabled={!seleccionado}
                        >
                            Modificar
                        </button>
                        <button
                            type="button"
                            onClick={() => setModoEliminar(true)}
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
                    </div>
                </>
            )}
        </div>
    );
}

export default ConsultarUsuarios;
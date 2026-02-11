import React, { useState, useEffect } from "react";
import { useGlobal } from "../context/ContenedorGlobal";
import API_URL from "../config";
import "../styles/Formularios.css";
import InputSelectGenerico from "./InputSelectGenerico";
import InputSelectTecPorCat from "./InputSelectTecPorCat";
import InputSelectFallas from "./InputSelectFallas";
import InputGenerico from "./InputGenerico";

function CrearSolicitudes() {
    const { setModuloActual, setSubModuloActual } = useGlobal();
    const [idUsuario, setIdUsuario] = useState("");
    const [solicitanteEsOperador, setSolicitanteEsOperador] = useState(false);
    const [idUso, setIdUso] = useState("");
    const [bienesObtenidos, setBienesObtenidos] = useState([]);
    const [bienSeleccionado, setBienSeleccionado] = useState(null);
    const [idCategoria, setIdCategoria] = useState("");
    const [idTecnico, setIdTecnico] = useState("");
    const [idFalla, setIdFalla] = useState(null);
    const [notas, setNotas] = useState("");
    const [paso, setPaso] = useState(1);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");

    // Función para registrar la solicitud en la tabla solicitudes
    const handleCrearSolicitud = async (e) => {
        e.preventDefault();

        // limpiar estados previos
        setError("");
        setSuccess("");
        setLoading(true);

        const payload = {
            id_usuario: idUsuario,
            id_uso: idUso,
            serie_bien: bienSeleccionado,
            id_categoria: idCategoria,
            id_tecnico: idTecnico,
            id_falla: idFalla,
            notas: notas
        };

        try {
            const response = await fetch(`${API_URL}/crear_solicitud.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            // validar que la respuesta sea JSON
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                throw new Error("Respuesta inválida del servidor: " + text);
            }

            if (data.status === "ok") {
                setSuccess(`Solicitud creada con éxito. Folio: ${data.folio}`);
            } else {
                setError(data.message || "Error al registrar la solicitud.");
            }
        } catch (error) {
            setError("Error al conectar con el servidor: " + error.message);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setModuloActual("Solicitudes");
                setSubModuloActual(null);
            }, 3000);
        }
    };

    // Función para buscar los bienes asignados al usuario operador idUso
    const handleBuscarBienesAsignados = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/consultar_bienes_operador.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_uso: idUso }),
            });

            const data = await response.json();
            if (data.status === "ok") {
                setBienesObtenidos(data.resultado || []);
                setPaso(2);
                setSuccess("Bienes encontrados.");
            } else {
                setError(data.message || "Error en la consulta.");
                setTimeout(() => {
                    setModuloActual("Solicitudes");
                    setSubModuloActual(null);
                    setLoading(false);
                }, 3000);
            }
        } catch (error) {
            setError("Error al conectar con el servidor.");
            setTimeout(() => {
                setModuloActual("Solicitudes");
                setSubModuloActual(null);
                setLoading(false);
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    // Efecto sesundario para actualizae el estado del id del usuario operador idUso, en caso de que el solicitante tambien sea el operador
    useEffect(() => {
        if (solicitanteEsOperador) {
            setIdUso(idUsuario);
        }
    }, [solicitanteEsOperador, idUsuario]);

    // Mostrar formulario al usuario
    return (
        <div className="sesion-form">

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <form onSubmit={handleCrearSolicitud}>
                {paso === 1 && (

                    <>
                        <InputSelectGenerico
                            idSeleccionado={idUsuario}
                            setIdSeleccionado={setIdUsuario}
                            label="Solicitante"
                            apiUrl={`${API_URL}/consultar_usuarios.php`}
                            valueField="id_usuario"
                            displayField={(o) => `${o.a_paterno}  ${o.a_materno}  ${o.usuario}`}
                            readOnly={false}
                            showDefaultOption={true}
                            defaultOptionText="Seleccione el usuario que reporta"
                        />

                        <div className="form-group">
                            <label>

                                <input
                                    type="checkbox"
                                    checked={solicitanteEsOperador}
                                    onChange={(e) => setSolicitanteEsOperador(e.target.checked)}
                                />
                                El que reporta opera el equipo
                            </label>
                        </div>

                        {/* En caso de que el solicitante no sea el operador del bien reportado */}
                        {!solicitanteEsOperador && (

                            <InputSelectGenerico
                                idSeleccionado={idUso}
                                setIdSeleccionado={setIdUso}
                                label="Operador"
                                apiUrl={`${API_URL}/consultar_usuarios.php`}
                                valueField="id_usuario"
                                displayField={(o) => `${o.a_paterno}  ${o.a_materno}  ${o.usuario}`}
                                readOnly={false}
                                showDefaultOption={true}
                                defaultOptionText="Seleccione al usuario operador"
                            />

                        )}

                        {idUso && (
                            <div className="form-buttons">
                                <button type="button" onClick={handleBuscarBienesAsignados}>
                                    Buscar bienes asignados
                                </button>
                            </div>
                        )}
                    </>
                )}

                {bienesObtenidos && bienesObtenidos.length > 0 && paso === 2 && (
                    <>
                        <div className="tabla-estandar seleccion-unica">
                            <h3>Seleccione el bien</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Seleccionar</th>
                                        <th>Tipo</th>
                                        <th>Serie</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bienesObtenidos.map((bien) => (
                                        <tr key={bien.serie_bien}>
                                            <td>
                                                <input
                                                    type="radio"
                                                    name="bienSeleccionado"
                                                    value={bien.serie_bien}
                                                    checked={bienSeleccionado === bien.serie_bien}
                                                    onChange={() => {
                                                        setBienSeleccionado(bien.serie_bien);
                                                        setPaso(3);
                                                    }}
                                                />
                                            </td>
                                            <td>{bien.tipo_bien}</td>
                                            <td>{bien.serie_bien}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </>

                )}

                {/* Una vez seleccionado el bien se elige la categoria,  */}
                {bienSeleccionado && paso === 3 && (
                    <>
                        <InputSelectGenerico
                            idSeleccionado={idCategoria}
                            setIdSeleccionado={setIdCategoria}
                            label="Seleccione la categoría"
                            apiUrl={`${API_URL}/consultar_categorias.php`}
                            valueField="id_categoria"
                            displayField="categoria"
                            readOnly={false}
                            showDefaultOption={true}
                            defaultOptionText="Seleccione una categoría"
                        />

                        {idCategoria && (
                            <InputSelectTecPorCat
                                idCategoria={idCategoria}
                                idSeleccionado={idTecnico}
                                setIdSeleccionado={setIdTecnico}
                            />
                        )}

                        {idTecnico && (
                            <InputSelectFallas
                                idCategoria={idCategoria}
                                idSeleccionado={idFalla}
                                setIdSeleccionado={setIdFalla}
                            />
                        )}

                        {idFalla && (
                            <InputGenerico
                                value={notas}
                                setValue={setNotas}
                                label="Notas / solución"
                                maxLength={255}
                                allowedChars="A-Za-z0-9._/\- "
                                placeholder="Escriba su texto aquí"
                                title="Sea preciso con sus notas"
                            />
                        )}
                    </>
                )}

                {idFalla && (
                    <div className="acciones">
                        <button type="submit" disabled={loading}>
                            {loading ? "Creando..." : "Crear Solicitud"}
                        </button>
                    </div>
                )}


            </form>
        </div>
    );
}

export default CrearSolicitudes;
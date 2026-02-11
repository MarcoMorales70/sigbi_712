import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";

function ConsultarSolicitudes() {
    const { setModuloActual, setSubModuloActual, setElementoSeleccionado } = useGlobal();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [paso, setPaso] = useState(1);
    const [folio, setFolio] = useState("");
    const [datosFolio, setDatosFolio] = useState([]);
    const [habilitaBotonBuscar, setHabilitaBotonBuscar] = useState(true);
    const [mostrarBotonesAcc, setMostrarBotonesAcc] = useState(true);
    const [bloquearInput, setBloquearInput] = useState(false);
    const [confirmar, setConfirmar] = useState(false);

    // Se crea un diccionario ( mapeo de clave: valor) de etiquetas, más entendibles al usuario para mostrar los datos de la solicitud
    const etiquetas = {
        fecha_crea: "Fecha de creación",
        fecha_cierre: "Fecha de cierre",
        fecha_term: "Fecha de término",
        id_categoria: "ID Categoría",
        id_tecnico: "ID Técnico",
        id_estado: "ID Estado",
        id_falla: "ID Falla",
        serie_bien: "Serie del bien",
        id_usuario: "ID Usuario",
        id_uso: "ID Uso",
        notas_solucion: "Notas de solución",
        id_evidencia: "ID Evidencia",
        categoria: "Categoría",
        estado: "Estado",
        falla: "Falla",
        id_ip: "ID IP",
        id_propietario: "ID Propietario",
        id_resg: "ID Responsable",
        ip: "Dirección IP",
        propietario: "Propietario",
        usuario_resg: "Nombre resguardante",
        a_paterno_resg: "A. paterno resguardante",
        a_materno_resg: "A. materno resguardante",
        usuario_uso: "Nombre operador",
        a_paterno_uso: "A. paterno operador",
        a_materno_uso: "A. materno operador",
        usuario_repor: "Nombre reporta",
        a_paterno_repor: "A. paterno reporta",
        a_materno_repor: "A. materno reporta",
        usuario_tec: "Nombre técnico",
        a_paterno_tec: "A. paterno tecnico",
        a_materno_tec: "A. materno tecnico"
    };

    // Función asincrónica para buscar un folio
    const handleBuscarFolio = async () => {

        try {
            const response = await fetch(`${API_URL}/consultar_solicitud.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folio: folio }),
                credentials: "include"
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("Folio encontrado"); // Respuesta en caso de éxito al obtener respuesta de la api
                setHabilitaBotonBuscar(false); // Se bloquea el botón buscar para que el usuario no lo presione nuevamente despues de haber tenido una respuesta satisfactoria
                setBloquearInput(true);  // Se bloquea el input para que el usuario no ingrese otro dato cuando ya hay datos mostrados, deberá LIMPIAR
                setError(""); // Se eliminan mensajes de error en intentos previos
                setDatosFolio(data.data); // Se asigna el objeto aun array
            } else {
                setError("Error en la consulta: " + (data.message || "Error desconocido."));
            }
        } catch (err) {
            setError("Error de conexión con el servidor: " + err.message);
        }
    };

    // Función para exportar la solicitud con datos enriquecidos
    const handleExportarSolicitud = () => {
        if (datosFolio && Object.keys(datosFolio).length > 0) {

            const headers = Object.keys(datosFolio)     // Encabezados personalizados
                .map(key => `"${etiquetas[key] || key}"`)
                .join(",");

            // Fila de valores
            const values = Object.keys(datosFolio)
                .map(key => `"${datosFolio[key] ?? ""}"`)
                .join(",");

            // Construir CSV completo
            const csvContent = headers + "\n" + values;

            // Crear archivo CSV en UTF-8
            const BOM = "\uFEFF"; // Marca de Orden de Bytes para UTF-8
            const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `solicitud_${datosFolio.folio || "export"}.csv`;
            link.click();

            setSuccess("Solicitud exportada correctamente en CSV");
        } else {
            setError("ERROR. No existe solicitud para exportar");
        }
    };

    // Función para exportar la solicitud con datos enriquecidos
    const handleLimpiar = () => {
        setBloquearInput(false);
        setFolio("");
        setDatosFolio([]);
        setHabilitaBotonBuscar(true);
        setError("");
        setSuccess("");
    };


    // Función para pedir una confirmación (ventana) antes de eliminar una solicitud
    const pedirConfirmacionEliminar = () => {
        if (!folio) {
            setError("No existe solicitud a eliminar.");
            return;
        }
        setConfirmar(true); // Activa el bloque de confirmación
    };


    // Función para Eliminar una solicitud
    const handleEliminarSolicitud = async () => {

        if (!folio) { // Validar que folio no este vacio
            setError("Se debe ingresar un folio válido antes de eliminar.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/eliminar_solicitud.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folio: folio }),
                credentials: "include"
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("Solicitud eliminada correctamente.");
                setMostrarBotonesAcc(false)
                setConfirmar(false);
            } else {
                setError("Error al eliminar la solicitud: " + (data.message || "Error desconocido."));
            }
        } catch (err) {
            setError("Error de conexión con el servidor: " + err.message);
        } finally {
            setTimeout(() => {
                setModuloActual("Solicitudes");
                setSubModuloActual(null);
            }, 3000);
        }
    };

    // Función para Modificar una solicitud
    const handleModificarSolicitud = () => {

        if (!folio) {
            setError("Por favor seleccione un folio para modificar.");
            return;
        }
        setElementoSeleccionado(datosFolio);
        setModuloActual("Solicitudes");
        setSubModuloActual("Modificar Solicitudes");
    };

    return (
        <div className="sesion-form">
            {paso === 1 && (
                <>
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <InputGenerico
                        value={folio}
                        setValue={setFolio}
                        label="Folio"
                        maxLength={4}
                        allowedChars="0-9"
                        transform="uppercase"
                        placeholder="12"
                        title="Ingresa solo dígitos"
                        readOnly={bloquearInput}
                    />

                    {folio && habilitaBotonBuscar && (
                        <div className="form-buttons">
                            <button type="button" onClick={handleBuscarFolio} >
                                Buscar
                            </button>
                        </div>
                    )}


                    {datosFolio && Object.values(datosFolio).some(val => val && val !== 0) && (

                        < div className="ficha" >
                            {/* Fila compuesta con concatenación */}
                            <div className="fila">
                                <span className="label">Técnico reponsable:</span>
                                <span className="valor">
                                    {datosFolio.usuario_tec} {datosFolio.a_paterno_tec} {datosFolio.a_materno_tec}
                                </span>
                            </div>

                            {/* Filas simples */}
                            {["estado",
                                "categoria",
                                "fecha_crea",
                                "fecha_cierre",
                                "fecha_term",
                                "serie_bien",
                                "propietario",
                                "ip",
                                "falla"
                            ].map((campo, index) => (
                                <div className="fila" key={index}>
                                    <span className="label">{etiquetas[campo] || campo}:</span>
                                    <span className="valor">{datosFolio[campo] || "---"}</span>
                                </div>
                            ))}

                            {/* Fila compuesta con concatenación */}
                            <div className="fila">
                                <span className="label">Reporta:</span>
                                <span className="valor">
                                    {datosFolio.usuario_repor} {datosFolio.a_paterno_repor} {datosFolio.a_materno_repor}
                                </span>
                            </div>
                            <div className="fila">
                                <span className="label">Resguardante:</span>
                                <span className="valor">
                                    {datosFolio.usuario_resg} {datosFolio.a_paterno_resg} {datosFolio.a_materno_resg}
                                </span>
                            </div>
                            <div className="fila">
                                <span className="label">Operador:</span>
                                <span className="valor">
                                    {datosFolio.usuario_uso} {datosFolio.a_paterno_uso} {datosFolio.a_materno_uso}
                                </span>
                            </div>


                            {mostrarBotonesAcc && (
                                <div className="acciones">
                                    <button type="button" onClick={handleModificarSolicitud}>Modificar</button>
                                    <button type="button" onClick={pedirConfirmacionEliminar}>Eliminar</button>
                                    <button type="button" onClick={handleExportarSolicitud}>Exportar</button>
                                    <button type="button" onClick={handleLimpiar}>Limpiar</button>
                                </div>
                            )}


                            {/* Bloque de confirmación */}
                            {confirmar && (
                                <div className="confirmacion-overlay">
                                    <div className="confirmacion-modal">
                                        <p>¿Seguro que deseas eliminar la solicitud con folio: <strong>{folio}</strong>?</p>
                                        <div className="form-buttons">
                                            <button onClick={handleEliminarSolicitud}>Eliminar</button>
                                            <button onClick={() => setConfirmar(false)}>Cancelar</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}


                </>
            )
            }


        </div >
    );
}

export default ConsultarSolicitudes;
import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";
import InputSelectTecPorCat from "./InputSelectTecPorCat";
import InputSelectEstados from "./InputSelectEstados";
import InputSelectFallas from "./InputSelectFallas";


function ModificarSolicitudes() {

    const { setModuloActual, setSubModuloActual, elementoSeleccionado, setElementoSeleccionado } = useGlobal();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [folio, setFolio] = useState(elementoSeleccionado?.folio || "");
    const [fechaTerm, setFechaTerm] = useState(elementoSeleccionado?.fecha_term || "");
    const [fechaCierre, setFechaCierre] = useState(elementoSeleccionado?.fecha_cierre || "");
    const [idCategoria, setIdCategoria] = useState(elementoSeleccionado?.id_categoria || "");
    const [idTecnico, setIdTecnico] = useState(elementoSeleccionado?.id_tecnico || "");
    const [idEstado, setIdEstado] = useState(elementoSeleccionado?.id_estado || "");
    const [idFalla, setIdFalla] = useState(elementoSeleccionado?.id_falla || "");
    const [notas, setNotas] = useState(elementoSeleccionado?.notas_solucion || "");
    const [idEvidencia, setIdEvidencia] = useState(folio);


    const handleModificarSolicitud = async () => {
        try {
            const response = await fetch(`${API_URL}/modificar_solicitud.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folio: elementoSeleccionado.folio }),
                credentials: "include"
            });

            const data = await response.json();
            if (data.status === "ok") {
                setSuccess("Solicitud modificada correctamente.");
            } else {
                setError("Error al modificar: " + (data.message || "Error desconocido."));
            }
        } catch (err) {
            setError("Error de conexión: " + err.message);
        }
    };


    return (
        <div className="sesion-form">

            <div>
                <h2>Folio: {folio}</h2>
            </div>

            <InputSelectEstados
                idEstado={idEstado}
                setIdEstado={setIdEstado}
                estadoActualText=""
                idEntidad={4}
                label="Estado de la solicitud"
            />

            {idEstado === 12 && !fechaTerm && (
                <>
                    <label>Fecha de término:</label>
                    <input
                        type="date"
                        value={fechaTerm}
                        onChange={(e) => setFechaTerm(e.target.value)}
                    />
                </>
            )}

            {idEstado === 13 && fechaTerm && !fechaCierre && (
                <>
                    <label>Fecha de cierre:</label>
                    <input
                        type="date"
                        value={fechaCierre}
                        onChange={(e) => setFechaCierre(e.target.value)}
                    />
                </>
            )}

            <InputSelectGenerico
                idSeleccionado={idCategoria}
                setIdSeleccionado={setIdCategoria}
                label="Categoría"
                apiUrl={`${API_URL}/consultar_categorias.php`}
                valueField="id_categoria"
                displayField="categoria"
                readOnly={false}
                showDefaultOption={false}
                defaultOptionText="Seleccione una categoría"
            />

            {idCategoria && (
                <InputSelectTecPorCat
                    idCategoria={idCategoria}
                    idSeleccionado={idTecnico}
                    setIdSeleccionado={setIdTecnico}
                />
            )}

            {idTecnico && idCategoria && (
                <div>
                    <InputSelectFallas
                        idCategoria={idCategoria}
                        idSeleccionado={idFalla}
                        setIdSeleccionado={setIdFalla}
                    />

                    <InputGenerico
                        value={notas}
                        setValue={setNotas}
                        label="Notas / solución"
                        maxLength={255}
                        allowedChars="A-Za-z0-9._/\- "
                        placeholder="Escriba su texto aquí"
                        title="Sea preciso con sus notas"
                    />

                    {idEstado === 13 && (
                        <InputGenerico
                            value={idEvidencia}
                            setValue={setIdEvidencia}
                            label="Evidencia"
                            maxLength={4}
                            allowedChars="0-9"
                            placeholder="10"
                            title="Ingrese solo dígitos"
                            readOnly={true}
                        />
                    )}

                </div>
            )}


            <div className="acciones">
                <button type="button" onClick={handleModificarSolicitud}>
                    Modificar
                </button>
            </div>




        </div>
    );
}

export default ModificarSolicitudes;
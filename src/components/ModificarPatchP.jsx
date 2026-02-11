import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";
import InputPuertos from "./InputPuertos"

function ModificarPatchP() {

    const { setModuloActual, setSubModuloActual, elementoSeleccionado, setElementoSeleccionado } = useGlobal();

    const [patchAnterior, setPatchAnterior] = useState(elementoSeleccionado?.patch || "");
    const [patch, setPatch] = useState(elementoSeleccionado?.patch || "");
    const [puertos, setPuertos] = useState(elementoSeleccionado?.puertos || "");
    const [idSede, setIdSede] = useState(elementoSeleccionado?.id_sede || "");
    const [idEdificio, setIdEdificio] = useState(elementoSeleccionado?.id_edificio || "");
    const [idNivel, setIdNivel] = useState(elementoSeleccionado?.id_nivel || "");
    const [sede, setSede] = useState(elementoSeleccionado?.acronimo || "");
    const [edificio, setEdificio] = useState(elementoSeleccionado?.edificio || "");
    const [nivel, setNivel] = useState(elementoSeleccionado?.nivel || "");
    const [descPatch, setDescPatch] = useState(elementoSeleccionado?.desc_patch || "");
    const [mensaje, setMensaje] = useState("");
    const [success, setSuccess] = useState(false);

    // Función asincrona para modificar el patch panel
    const handleSubmit = async (e) => {
        e.preventDefault(); // evita que se recargue la página

        setMensaje("");
        setSuccess(false);

        try {
            const response = await fetch(`${API_URL}/modificar_patch_panels.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    patch_anterior: patchAnterior, // Para identificar el registro original
                    patch: patch,
                    puertos: puertos,
                    id_sede: idSede,
                    id_edificio: idEdificio,
                    id_nivel: idNivel,
                    desc_patch: descPatch
                })
            });

            const data = await response.json();

            if (data.status === "ok") {
                setMensaje("Patch Panel modificado correctamente.");
                setSuccess(true);
                setElementoSeleccionado(null);
                setTimeout(() => {
                    setModuloActual("Red");
                    setSubModuloActual(null);
                }, 2000);
            } else {
                setMensaje("Error al modificar: " + (data.message || "Error desconocido."));
                setSuccess(false);
            }
        } catch (err) {
            setMensaje("Error de conexión con el servidor: " + err.message);
            setSuccess(false);
        }
    };

    return (
        <div className="sesion-form">
            <form onSubmit={handleSubmit}>
                <InputGenerico
                    value={patch}
                    setValue={setPatch}
                    label="Nombre del Patch Panel"
                    maxLength={9}
                    allowedChars="a-p1-9_sw"
                    transform="lowercase"
                    placeholder="pp1_ep_pb"
                    title="Respete la nomenclatura"
                />

                <InputPuertos
                    puertos={puertos}
                    setPuertos={setPuertos}
                    label="Número de puertos"
                    readOnly={true}
                />

                <InputSelectGenerico
                    idSeleccionado={idSede}
                    setIdSeleccionado={setIdSede}
                    label="Sede"
                    apiUrl={`${API_URL}/consultar_sedes.php`}
                    valueField="id_sede"
                    displayField="acronimo"
                    readOnly={false}
                    showDefaultOption={false}
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
                    showDefaultOption={false}
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
                    showDefaultOption={false}
                    defaultOptionText="Seleccione un piso o nivel"
                />

                <InputGenerico
                    value={descPatch}
                    setValue={setPatch}
                    label="Descripción del patch panel"
                    maxLength={255}
                    placeholder="Escriba su texto aquí"
                    title="Máximo 255 caracteres"
                />

                {mensaje && <div className={success ? "success" : "error"}>{mensaje}</div>}

                <div className="form-buttons">
                    <button type="submit">Modificar</button>
                </div>
            </form>
        </div>
    );

}

export default ModificarPatchP;
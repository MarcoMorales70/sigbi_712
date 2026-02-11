import React, { useState, useEffect } from "react";
import API_URL from "../config";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";
import InputPuertos from "./InputPuertos"

function ModificarSwitch() {

    const { setModuloActual, setSubModuloActual, elementoSeleccionado, setElementoSeleccionado } = useGlobal();

    const [nomSwitchAnterior, setNomSwitchAnterior] = useState(elementoSeleccionado?.nom_switch || "");
    const [nomSwitch, setNomSwitch] = useState(elementoSeleccionado?.nom_switch || "");
    const [serieSw, setSerieSw] = useState(elementoSeleccionado?.serie_sw || "");
    const [mac, setMac] = useState(elementoSeleccionado?.mac_sw || "");
    const [puertos, setPuertos] = useState(elementoSeleccionado?.puertos || "");
    const [idSede, setIdSede] = useState(elementoSeleccionado?.id_sede || "");
    const [idEdificio, setIdEdificio] = useState(elementoSeleccionado?.id_edificio || "");
    const [idNivel, setIdNivel] = useState(elementoSeleccionado?.id_nivel || "");
    const [sede, setSede] = useState(elementoSeleccionado?.acronimo || "");
    const [edificio, setEdificio] = useState(elementoSeleccionado?.edificio || "");
    const [nivel, setNivel] = useState(elementoSeleccionado?.nivel || "");
    const [descSwitch, setDescSwitch] = useState(elementoSeleccionado?.desc_switch || "");
    const [mensaje, setMensaje] = useState("");
    const [success, setSuccess] = useState(false);

    // Función asincrona para modificar el switch
    const handleSubmit = async (e) => {
        e.preventDefault(); // evita que se recargue la página

        setMensaje("");
        setSuccess(false);

        try {
            const response = await fetch(`${API_URL}/modificar_switches.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    nom_switch_anterior: nomSwitchAnterior, // Para identificar el registro original
                    nom_switch: nomSwitch,
                    serie_sw: serieSw,
                    mac_sw: mac,
                    puertos: puertos,
                    id_sede: idSede,
                    id_edificio: idEdificio,
                    id_nivel: idNivel,
                    desc_switch: descSwitch
                })
            });

            const data = await response.json();

            if (data.status === "ok") {
                setMensaje("Switch modificado correctamente.");
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
                    value={nomSwitch}
                    setValue={setNomSwitch}
                    label="Nombre del switch"
                    maxLength={9}
                    allowedChars="a-p1-9_sw"
                    transform="lowercase"
                    placeholder="sw1_ep_pb"
                    title="Respete la nomenclatura"
                />

                <InputGenerico
                    value={serieSw}
                    setValue={setSerieSw}
                    label="Serie del switch"
                    maxLength={20}
                    transform="uppercase"
                    placeholder="FDO654387"
                    title="Máximo 20 caracteres"
                />

                <InputGenerico
                    value={mac}
                    setValue={setMac}
                    label="MAC"
                    maxLength={17}
                    allowedChars="0-9A-F:"
                    transform="uppercase"
                    placeholder="AA:BB:CC:DD:EE:FF"
                    title="Respete la nomenclatura"
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

                <InputPuertos
                    puertos={puertos}
                    setPuertos={setPuertos}
                    label="Número de puertos"
                    readOnly={true}
                />

                <InputGenerico
                    value={descSwitch}
                    setValue={setDescSwitch}
                    label="Descripción del switch"
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

export default ModificarSwitch;
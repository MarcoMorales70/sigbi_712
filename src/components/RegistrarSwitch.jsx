import { useGlobal } from "../context/ContenedorGlobal";
import API_URL from "../config";
import { useState } from "react";
import "../styles/Formularios.css";
import InputPuertos from "./InputPuertos";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";

function RegistrarSwitches() {
    const { setModuloActual, setSubModuloActual, permisos } = useGlobal();
    const [nomSwitch, setNomSwitch] = useState("");
    const [serieSw, setSerieSw] = useState("");
    const [mac, setMac] = useState("");
    const [puertos, setPuertos] = useState("");
    const [idSede, setIdSede] = useState("");
    const [idEdificio, setIdEdificio] = useState("");
    const [idNivel, setIdNivel] = useState("");
    const [descSwitch, setDescSwitch] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [success, setSuccess] = useState(false);

    const tienePermisoRegistrar = permisos.includes(30); // id_permiso=30; "Registrar switches"

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");

        // Validación de campos 
        if (!nomSwitch || !serieSw || !mac || !puertos || !idSede || !idEdificio || !idNivel) {
            return setMensaje("Todos los campos son obligatorios.");
        }

        // Envio de datos para crear la tabla y registrar el switch
        try {
            const response = await fetch(`${API_URL}/registrar_switch.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    nomSwitch,
                    serieSw,
                    mac,
                    puertos,
                    idSede,
                    idEdificio,
                    idNivel,
                    descSwitch
                })
            });

            // Respuesta de la api
            const data = await response.json();

            if (data.status === "ok") {
                setMensaje(data.message);
                setSuccess(true);
                setTimeout(() => {
                    setModuloActual("Red");
                    setSubModuloActual(null);
                }, 3000);
            } else {
                setMensaje("\u274C " + (data.message || "Error al registrar el switch."));
            }
        } catch {
            setMensaje("Error de conexión con el servidor.");
        }
    };

    if (!tienePermisoRegistrar) {
        return <p>Acceso denegado. No tiene permiso para registrar switches.</p>;
    }

    if (success) {
        return (
            <div className="sesion-form">
                <p className="success">{mensaje}</p>
                <button
                    onClick={() => {
                        setModuloActual("Red");
                        setSubModuloActual(null);
                    }}
                >
                    Continuar
                </button>
            </div>
        );
    }

    // Captura de datos reutilizando otros componentes
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

                <InputPuertos
                    puertos={puertos}
                    setPuertos={setPuertos}
                    label="Número de puertos"
                    readOnly={false}
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
                    <button type="submit">Registrar</button>
                </div>
            </form>
        </div>
    );
}

export default RegistrarSwitches;
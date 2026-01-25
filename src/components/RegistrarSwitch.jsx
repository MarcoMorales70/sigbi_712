import { useGlobal } from "../context/ContenedorGlobal";
import { useState } from "react";
import "../styles/Formularios.css";
import InputSelectSedes from "./InputSelectSedes";
import InputSelectEdificios from "./InputSelectEdificios";
import InputSelectNiveles from "./InputSelectNiveles";
import InputPuertos from "./InputPuertos";
import InputGenerico from "./InputGenerico";

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

    const tienePermisoRegistrar = permisos.includes(30); // 30 = ID del permiso "Registrar switches"

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");

        if (!nomSwitch || !serieSw || !mac || !puertos || !idSede || !idEdificio || !idNivel) {
            return setMensaje("Todos los campos son obligatorios.");
        }

        try {
            const response = await fetch("http://localhost/sigbi_712/api/registrar_switch.php", {
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

            const data = await response.json();

            if (data.status === "ok") {
                setMensaje(data.message);
                setSuccess(true);
                setTimeout(() => {
                    setModuloActual("Red");
                    setSubModuloActual(null);
                }, 3000);
            } else {
                setMensaje("❌ " + (data.message || "Error al registrar el switch."));
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

    return (
        <div className="sesion-form">
            <form onSubmit={handleSubmit}>
                <InputGenerico
                    value={nomSwitch}
                    setValue={setNomSwitch}
                    label="Nombre del switch"
                    maxLength={30}
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
                />

                <InputGenerico
                    value={mac}
                    setValue={setMac}
                    label="MAC"
                    maxLength={17}
                    allowedChars="0-9A-F:"
                    transform="uppercase"
                    placeholder="AA:BB:CC:DD:EE:FF"
                />

                <InputSelectSedes idSede={idSede} setIdSede={setIdSede} />
                <InputSelectEdificios idEdificio={idEdificio} setIdEdificio={setIdEdificio} />
                <InputSelectNiveles idNivel={idNivel} setIdNivel={setIdNivel} />

                <InputPuertos puertos={puertos} setPuertos={setPuertos} label="Número de puertos" readOnly={false} />

                <InputGenerico
                    value={descSwitch}
                    setValue={setDescSwitch}
                    label="Descripción del switch"
                    maxLength={255}
                    placeholder="Escriba texto aquí"
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
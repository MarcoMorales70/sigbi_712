import { useGlobal } from "../context/ContenedorGlobal";
import API_URL from "../config";
import { useState } from "react";
import "../styles/Formularios.css";
import InputPuertos from "./InputPuertos";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";

function RegistrarPatchP() {
    const { setModuloActual, setSubModuloActual, permisos } = useGlobal();
    const [patch, setPatch] = useState("");
    const [puertos, setPuertos] = useState("");
    const [idSede, setIdSede] = useState("");
    const [idEdificio, setIdEdificio] = useState("");
    const [idNivel, setIdNivel] = useState("");
    const [descPatch, setDescPatch] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [success, setSuccess] = useState(false);

    const tienePermisoRegistrar = permisos.includes(35); // id_permiso=35; "Registrar Patch Panel"

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");

        // Validación de campos obligatorios, el resto no importa si se requisitan
        if (!patch || !puertos || !idSede || !idEdificio || !idNivel) {
            return setMensaje("Todos los campos son obligatorios.");
        }

        // Envio de datos para crear la tabla y registrar el patch panel en su tabla respectiva
        try {
            const response = await fetch(`${API_URL}/registrar_patch.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    patch,
                    puertos: Number(puertos),
                    idSede,
                    idEdificio,
                    idNivel,
                    descPatch
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
                setMensaje("\u274C " + (data.message || "Error al registrar el patch panel."));
            }
        } catch (err) {
            setMensaje("Error de conexión con el servidor: " + err.message);
        }
    };

    if (!tienePermisoRegistrar) {
        return <p>Acceso denegado. No tiene permiso para registrar patch panels.</p>;
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

    // Captura de datos reutilizando componentes
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
                    readOnly={false}
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

                <InputGenerico
                    value={descPatch}
                    setValue={setDescPatch}
                    label="Descripción del patch panel"
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

export default RegistrarPatchP;
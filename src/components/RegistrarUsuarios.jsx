import React, { useState } from "react";
import API_URL from "../config";
import { useGlobal } from "../context/ContenedorGlobal";
import "../styles/Formularios.css";
import Hardware from "./Hardware";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";

function RegistrarUsuarios() {
    const { setSubModuloActual } = useGlobal();
    const [idUsuario, setIdUsuario] = useState("");
    const [usuario, setUsuario] = useState("");
    const [aPaterno, setApaterno] = useState("");
    const [aMaterno, setAmaterno] = useState("");
    const [correo, setCorreo] = useState("");
    const [idCargo, setIdCargo] = useState("");
    const [idDireccion, setIdDireccion] = useState("");
    const [idSede, setIdSede] = useState("");
    const [idEdificio, setIdEdificio] = useState("");
    const [idNivel, setIdNivel] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [mostrarHardware, setMostrarHardware] = useState(false);

    // Función para resetear todos los campos
    const resetForm = () => {
        setIdUsuario("");
        setUsuario("");
        setApaterno("");
        setAmaterno("");
        setCorreo("");
        setIdCargo("");
        setIdDireccion("");
        setIdSede("");
        setIdEdificio("");
        setIdNivel("");
    };

    const handleRegistrar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validar campos obligatorios, no vacios o solo espacios
        if (
            !idUsuario.trim() ||
            !usuario.trim() ||
            !aPaterno.trim() ||
            !aMaterno.trim() ||
            !correo.trim() ||
            !idCargo ||
            !idDireccion ||
            !idSede ||
            !idEdificio ||
            !idNivel
        ) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/registrar_usuarios.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id_usuario: idUsuario,
                    usuario,
                    a_paterno: aPaterno,
                    a_materno: aMaterno,
                    correo,
                    id_cargo: idCargo,
                    id_direccion: idDireccion,
                    id_sede: idSede,
                    id_edificio: idEdificio,
                    id_nivel: idNivel
                })
            });

            // Se recibe y procesa la respuesta
            const data = await response.json();
            if (data.status === "ok") {
                resetForm();
                setSuccess(data.message);
                setTimeout(() => {
                    setSubModuloActual(null);
                    setMostrarHardware(true);
                }, 3000);
            } else {
                setError(data.message || "Error al registrar usuario.");
                setTimeout(() => {
                    setSubModuloActual(null);
                    setMostrarHardware(true);
                }, 3000);
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    if (mostrarHardware) {
        return <Hardware />;
    }

    return (
        <div className="sesion-form">
            <form onSubmit={handleRegistrar}>

                <InputGenerico
                    value={idUsuario}
                    setValue={setIdUsuario}
                    label="Número de empleado"
                    maxLength={7}
                    allowedChars="0-9"
                    placeholder="7120000"
                    title="Debe contener exactamente 7 dígitos numéricos"
                />

                <InputGenerico
                    value={usuario}
                    setValue={setUsuario}
                    label="Nombre(s) del empleado"
                    maxLength={50}
                    allowedChars="A-Z \u00D1"
                    transform="uppercase"
                    placeholder="Ingrese el nombre"
                    title="Máximo 50 caracteres"
                />

                <InputGenerico
                    value={aPaterno}
                    setValue={setApaterno}
                    label="Apellido paterno"
                    maxLength={50}
                    allowedChars="A-Z \u00D1"
                    transform="uppercase"
                    placeholder="Ingrese el apellido paterno"
                    title="Máximo 50 caracteres"
                />

                <InputGenerico
                    value={aMaterno}
                    setValue={setAmaterno}
                    label="Apellido materno"
                    maxLength={50}
                    allowedChars="A-Z \n00D1"
                    transform="uppercase"
                    placeholder="Ingrese el apellido materno"
                    title="Máximo 50 caracteres"
                />

                <InputGenerico
                    type="email"
                    value={correo}
                    setValue={setCorreo}
                    label="Correo electrónico"
                    maxLength={50}
                    allowedChars="A-Za-z0-9@._-"
                    transform="lowercase"
                    placeholder="ejemplo@dominio.com"
                    title="Máximo 50 caracteres"
                />

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

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <div className="form-buttons">
                    <button type="submit" disabled={loading}>
                        {loading ? "Registrando..." : "Registrar"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default RegistrarUsuarios;
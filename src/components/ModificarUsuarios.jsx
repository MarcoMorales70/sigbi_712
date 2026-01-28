import React, { useState, useEffect } from "react";
import API_URL from "../config";
import { useGlobal } from "../context/ContenedorGlobal";
import "../styles/Formularios.css";
import Hardware from "./Hardware";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";

function ModificarUsuarios({ idUsuarioSeleccionado }) {
    const { setSubModuloActual } = useGlobal();
    const [idUsuario, setIdUsuario] = useState(idUsuarioSeleccionado || "");
    const [datosUsuario, setDatosUsuario] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [mostrarHardware, setMostrarHardware] = useState(false);

    // Efecto secundario si el usuario seleccionado viene de ConsultarUsuarios.jsx, cargar datos directamente
    useEffect(() => {
        if (idUsuarioSeleccionado) {
            consultarUsuario(idUsuarioSeleccionado);
        }
    }, [idUsuarioSeleccionado]);

    // Efecto secundario para consultar a un usuario específico
    const consultarUsuario = async (id) => {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/consultar_usuario_especifico.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_usuario: id })
            });
            const data = await response.json();
            if (data.status === "ok" && data.usuario) {
                setDatosUsuario(data.usuario);
            } else {
                setError(data.message || "Usuario no encontrado.");
            }
        } catch {
            setError("Error de conexión con el servidor.");
            setTimeout(() => {
                setSubModuloActual(null);
                setMostrarHardware(true);
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    // Buscar usuario manualmente directo de este componente
    const handleContinuar = async (e) => {
        e.preventDefault();
        consultarUsuario(idUsuario);
    };

    // Modificar usuario ya en la base de datos
    const handleModificar = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/modificar_usuarios.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(datosUsuario)
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess(data.message);
                setTimeout(() => {
                    setSubModuloActual(null);
                    setMostrarHardware(true);
                }, 3000);
            } else {
                setError(data.message || "Error al modificar usuario.");
                setTimeout(() => {
                    setSubModuloActual(null);
                    setMostrarHardware(true);
                }, 3000);
            }
        } catch {
            setError("Error de conexión con el servidor.");
            setTimeout(() => {
                setSubModuloActual(null);
                setMostrarHardware(true);
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    if (mostrarHardware) {
        return <Hardware />;
    }

    return (
        <div className="sesion-form">
            {/* Solicitar id_usuario si es directamente de este componente */}
            {!idUsuarioSeleccionado && !datosUsuario && (
                <form onSubmit={handleContinuar}>

                    <InputGenerico
                        value={idUsuario}
                        setValue={setIdUsuario}
                        label="Número de empleado"
                        maxLength={7}
                        allowedChars="0-9"
                        placeholder="7120000"
                        title="Debe contener exactamente 7 dígitos numéricos"
                    />

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Buscando..." : "Continuar"}
                        </button>
                    </div>
                </form>
            )}

            {/* Mostrar datos del usuario */}
            {datosUsuario && (
                <form>
                    <p>Usuario con ID <strong>{datosUsuario.id_usuario}</strong>:</p>

                    <InputGenerico
                        value={datosUsuario.id_usuario}
                        setValue={() => { }}
                        label="Número de empleado"
                        readOnly={true}
                        maxLength={7}
                        allowedChars="0-9"
                        placeholder="7120000"
                        title="Debe contener exactamente 7 dígitos numéricos"
                    />

                    <InputGenerico
                        value={datosUsuario.usuario}
                        setValue={(value) => setDatosUsuario({ ...datosUsuario, usuario: value })}
                        label="Nombre(s) del empleado"
                        maxLength={50}
                        allowedChars="A-Z \u00D1"
                        transform="uppercase"
                        placeholder="Ingrese el nombre"
                        title="Máximo 50 caracteres"
                    />

                    <InputGenerico
                        value={datosUsuario.a_paterno}
                        setValue={(value) => setDatosUsuario({ ...datosUsuario, a_paterno: value })}
                        label="Apellido paterno"
                        maxLength={50}
                        allowedChars="A-Z \u00D1"
                        transform="uppercase"
                        placeholder="Ingrese el apellido paterno"
                        title="Máximo 50 caracteres"
                    />

                    <InputGenerico
                        value={datosUsuario.a_materno}
                        setValue={(value) => setDatosUsuario({ ...datosUsuario, a_materno: value })}
                        label="Apellido materno"
                        maxLength={50}
                        allowedChars="A-Z \n00D1"
                        transform="uppercase"
                        placeholder="Ingrese el apellido materno"
                        title="Máximo 50 caracteres"
                    />

                    <InputGenerico
                        type="email"
                        value={datosUsuario.correo}
                        setValue={(value) => setDatosUsuario({ ...datosUsuario, correo: value })}
                        label="Correo electrónico"
                        maxLength={50}
                        allowedChars="A-Za-z0-9@._-"
                        transform="lowercase"
                        placeholder="ejemplo@dominio.com"
                        title="Máximo 50 caracteres"
                    />

                    <InputSelectGenerico
                        idSeleccionado={datosUsuario.id_cargo}
                        setIdSeleccionado={(value) => setDatosUsuario({ ...datosUsuario, id_cargo: value })}
                        label="Cargo"
                        apiUrl={`${API_URL}/consultar_cargos.php`}
                        valueField="id_cargo"
                        displayField="cargo"
                        readOnly={false}
                        showDefaultOption={true}
                        defaultOptionText="Seleccione un cargo"
                    />

                    <InputSelectGenerico
                        idSeleccionado={datosUsuario.id_direccion}
                        setIdSeleccionado={(value) => setDatosUsuario({ ...datosUsuario, id_direccion: value })}
                        label="Dirección Administrativa"
                        apiUrl={`${API_URL}/consultar_direcciones.php`}
                        valueField="id_direccion"
                        displayField="direccion_a"
                        readOnly={false}
                        showDefaultOption={true}
                        defaultOptionText="Seleccione Dirección Administrativa"
                    />

                    <InputSelectGenerico
                        idSeleccionado={datosUsuario.id_sede}
                        setIdSeleccionado={(value) => setDatosUsuario({ ...datosUsuario, id_sede: value })}
                        label="Sede"
                        apiUrl={`${API_URL}/consultar_sedes.php`}
                        valueField="id_sede"
                        displayField="acronimo"
                        readOnly={false}
                        showDefaultOption={true}
                        defaultOptionText="Seleccione una sede"
                    />

                    <InputSelectGenerico
                        idSeleccionado={datosUsuario.id_edificio}
                        setIdSeleccionado={(value) => setDatosUsuario({ ...datosUsuario, id_edificio: value })}
                        label="Edificio"
                        apiUrl={`${API_URL}/consultar_edificios.php`}
                        valueField="id_edificio"
                        displayField="edificio"
                        readOnly={false}
                        showDefaultOption={true}
                        defaultOptionText="Seleccione un edificio"
                    />

                    <InputSelectGenerico
                        idSeleccionado={datosUsuario.id_nivel}
                        setIdSeleccionado={(value) => setDatosUsuario({ ...datosUsuario, id_nivel: value })}
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
                        <button type="button" onClick={handleModificar} disabled={loading}>
                            {loading ? "Modificando..." : "Modificar"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ModificarUsuarios;
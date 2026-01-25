import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import Hardware from "./Hardware";
import InputIdUsuario from "./InputIdUsuario";
import InputUsuario from "./InputUsuario";
import InputApaterno from "./InputApaterno";
import InputAmaterno from "./InputAmaterno";
import InputCorreo from "./InputCorreo";
import InputSelectCargos from "./InputSelectCargos";
import InputSelectDirecciones from "./InputSelectDirecciones";
import InputSelectSedes from "./InputSelectSedes";
import InputSelectEdificios from "./InputSelectEdificios";
import InputSelectNiveles from "./InputSelectNiveles";

function ModificarUsuarios({ idUsuarioSeleccionado }) {
    const [idUsuario, setIdUsuario] = useState(idUsuarioSeleccionado || "");
    const [datosUsuario, setDatosUsuario] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [mostrarHardware, setMostrarHardware] = useState(false);

    // 👉 Si viene un idUsuarioSeleccionado desde ConsultarUsuarios.jsx, cargar datos directamente
    useEffect(() => {
        if (idUsuarioSeleccionado) {
            consultarUsuario(idUsuarioSeleccionado);
        }
    }, [idUsuarioSeleccionado]);

    const consultarUsuario = async (id) => {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const response = await fetch("http://localhost/sigbi_712/api/consultar_usuario_especifico.php", {
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
            setTimeout(() => setMostrarHardware(true), 3000);
        } finally {
            setLoading(false);
        }
    };

    // 👉 Buscar usuario manualmente (solo si no viene de ConsultarUsuarios.jsx)
    const handleContinuar = async (e) => {
        e.preventDefault();
        consultarUsuario(idUsuario);
    };

    // 👉 Modificar usuario
    const handleModificar = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost/sigbi_712/api/modificar_usuarios.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(datosUsuario)
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess(data.message);
                setTimeout(() => setMostrarHardware(true), 3000);
            } else {
                setError(data.message || "Error al modificar usuario.");
                setTimeout(() => setMostrarHardware(true), 3000);
            }
        } catch {
            setError("Error de conexión con el servidor.");
            setTimeout(() => setMostrarHardware(true), 3000);
        } finally {
            setLoading(false);
        }
    };

    if (mostrarHardware) {
        return <Hardware />;
    }

    return (
        <div className="sesion-form">
            <h2>Modificar Usuario</h2>

            {/* Primer formulario: pedir id_usuario SOLO si no viene desde ConsultarUsuarios.jsx */}
            {!idUsuarioSeleccionado && !datosUsuario && (
                <form onSubmit={handleContinuar}>
                    <InputIdUsuario idUsuario={idUsuario} setIdUsuario={setIdUsuario} />

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Buscando..." : "Continuar"}
                        </button>
                    </div>
                </form>
            )}

            {/* Segundo formulario: mostrar datos del usuario */}
            {datosUsuario && (
                <form>
                    <p>Modifica los datos del usuario con ID <strong>{datosUsuario.id_usuario}</strong>:</p>

                    <InputIdUsuario
                        idUsuario={datosUsuario.id_usuario}
                        setIdUsuario={() => { }}
                        readOnly={true}
                    />

                    <InputUsuario
                        usuario={datosUsuario.usuario}
                        setUsuario={(value) => setDatosUsuario({ ...datosUsuario, usuario: value })}
                    />

                    <InputApaterno
                        aPaterno={datosUsuario.a_paterno}
                        setApaterno={(value) => setDatosUsuario({ ...datosUsuario, a_paterno: value })}
                    />

                    <InputAmaterno
                        aMaterno={datosUsuario.a_materno}
                        setAmaterno={(value) => setDatosUsuario({ ...datosUsuario, a_materno: value })}
                    />

                    <InputCorreo
                        correo={datosUsuario.correo}
                        setCorreo={(value) => setDatosUsuario({ ...datosUsuario, correo: value })}
                    />

                    <InputSelectCargos
                        idCargo={datosUsuario.id_cargo}
                        setIdCargo={(value) => setDatosUsuario({ ...datosUsuario, id_cargo: value })}
                    />

                    <InputSelectDirecciones
                        idDireccion={datosUsuario.id_direccion}
                        setIdDireccion={(value) => setDatosUsuario({ ...datosUsuario, id_direccion: value })}
                    />

                    <InputSelectSedes
                        idSede={datosUsuario.id_sede}
                        setIdSede={(value) => setDatosUsuario({ ...datosUsuario, id_sede: value })}
                    />

                    <InputSelectEdificios
                        idEdificio={datosUsuario.id_edificio}
                        setIdEdificio={(value) => setDatosUsuario({ ...datosUsuario, id_edificio: value })}
                    />

                    <InputSelectNiveles
                        idNivel={datosUsuario.id_nivel}
                        setIdNivel={(value) => setDatosUsuario({ ...datosUsuario, id_nivel: value })}
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
import React, { useState, useEffect } from "react";
import { useGlobal } from "../context/ContenedorGlobal";
import "../styles/Formularios.css";
import Hardware from "./Hardware";
import InputIdUsuario from "./InputIdUsuario";

function EliminarUsuarios({ idUsuarioSeleccionado }) {
    const { setSubModuloActual } = useGlobal();
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
        } finally {
            setLoading(false);
        }
    };

    // 👉 Buscar usuario manualmente (solo si no viene de ConsultarUsuarios.jsx)
    const handleBuscar = async (e) => {
        e.preventDefault();
        if (!idUsuario.trim()) {
            setError("Debe ingresar el número de empleado.");
            return;
        }
        consultarUsuario(idUsuario);
    };

    // 👉 Eliminar usuario
    const handleEliminar = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost/sigbi_712/api/eliminar_usuarios.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_usuario: idUsuario })
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("✅ Usuario eliminado correctamente.");
            } else {
                setError(data.message || "Error al eliminar usuario.");
            }

            setTimeout(() => {
                setMostrarHardware(true);
                setSubModuloActual(null);
                setLoading(false);
            }, 3000);

        } catch {
            setError("Error de conexión con el servidor.");
            setTimeout(() => {
                setMostrarHardware(true);
                setSubModuloActual(null);
                setLoading(false);
            }, 3000);
        }
    };

    if (mostrarHardware) {
        return <Hardware />;
    }

    return (
        <div className="sesion-form">
            <h2>Eliminar Usuario</h2>

            {/* Modo independiente: formulario para buscar usuario */}
            {!idUsuarioSeleccionado && !datosUsuario && (
                <form onSubmit={handleBuscar}>
                    <InputIdUsuario idUsuario={idUsuario} setIdUsuario={setIdUsuario} />

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                </form>
            )}

            {/* Modo integrado: mostrar resumen del usuario antes de eliminar */}
            {datosUsuario && (
                <div>
                    <p>
                        ¿Seguro que deseas eliminar al usuario <strong>{datosUsuario.usuario}</strong>
                        con No. Empleado: <strong>{datosUsuario.id_usuario}</strong>?
                    </p>

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="form-buttons">
                        <button onClick={handleEliminar} disabled={loading}>
                            {loading ? "Eliminando..." : "Eliminar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EliminarUsuarios;
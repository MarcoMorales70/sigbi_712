import { useState } from "react";
import { useGlobal } from "../context/ContenedorGlobal";
import "../styles/Formularios.css";
import { obtenerModulosDesdePermisos } from "../data/permisosUtils";

function IniciarSesion() {

    const { setIdentidad, setModuloActual, setSubModuloActual, setPermisos } = useGlobal();

    const [idTecnico, setIdTecnico] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");

    const validarId = (valor) => {
        if (/^\d{0,7}$/.test(valor)) {
            setIdTecnico(valor);
        }
    };

    const enviarFormulario = async (e) => {
        e.preventDefault();
        setError("");

        if (idTecnico.length !== 7) {
            setError("El ID Técnico debe tener exactamente 7 dígitos.");
            return;
        }

        try {
            const response = await fetch("http://localhost/sigbi_712/api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_tecnico: idTecnico,
                    contrasena: contrasena
                }),
                credentials: "include"   // 👈 importante: envía la cookie PHPSESSID
            });

            const data = await response.json();
            console.log("Respuesta limpia:", data);
            console.log("PERMISOS RECIBIDOS:", data.permisos);

            if (data.status !== "ok") {
                setError(data.message || "Credenciales incorrectas.");
                return;
            }

            // ✅ Guardar identidad y permisos reales
            setIdentidad(data.identidad);
            setPermisos(data.permisos);
            setSubModuloActual(null);

            // ✅ Obtener módulos reales desde permisos
            let modulosPermitidos = obtenerModulosDesdePermisos(data.permisos);
            modulosPermitidos = modulosPermitidos.filter(m => m !== "Autenticación");

            // ✅ Filtrar el módulo "Ingresar" (solo es para modo invitado)
            modulosPermitidos = modulosPermitidos.filter(m => m !== "Ingresar");
            console.log("MODULOS PERMITIDOS (filtrados):", modulosPermitidos);

            // ✅ Asignar módulo real
            if (modulosPermitidos.length > 0) {
                console.log("SETEANDO MODULO ACTUAL A:", modulosPermitidos[0]);
                setModuloActual(modulosPermitidos[0]);
            } else {
                console.log("NO HAY MODULOS REALES, USANDO 'Autenticación'");
                setModuloActual("Autenticación");
            }

        } catch (error) {
            console.error(error);
            setError("Error de conexión con el servidor.");
        }
    };

    return (
        <div className="sesion-form">
            <form onSubmit={enviarFormulario}>

                <div className="form-group">
                    <label htmlFor="idTecnico">ID Técnico</label>
                    <input
                        type="text"
                        id="idTecnico"
                        value={idTecnico}
                        onChange={(e) => validarId(e.target.value)}
                        maxLength="7"
                        placeholder="Ingresa tu ID de 7 dígitos"
                        title="Debe contener exactamente 7 dígitos numéricos"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="contrasena">Contraseña</label>
                    <input
                        type="password"
                        id="contrasena"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        maxLength="20"
                        placeholder="Ingresa tu contraseña"
                        title="Máximo 20 caracteres"
                    />
                </div>

                {error && <p className="error">{error}</p>}


                <div className="form-buttons">
                    <button type="submit">Entrar</button>
                </div>

            </form>
        </div>
    );
}

export default IniciarSesion;
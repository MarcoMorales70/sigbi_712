import { useState } from "react";
import API_URL from "../config";
import { useGlobal } from "../context/ContenedorGlobal";
import "../styles/Formularios.css";
import { obtenerModulosDesdePermisos } from "../data/permisosUtils";
import InputContrasena from "./InputContrasena";
import InputGenerico from "./InputGenerico";

function IniciarSesion() {
    // Definicion de estados iniciales, se extraen funciones del contexto global necesarias para actualizar sus estados
    const { setIdentidad, setModuloActual, setSubModuloActual, setPermisos } = useGlobal();
    const [idTecnico, setIdTecnico] = useState(""); // 
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");

    const enviarFormulario = async (e) => { // Función asincrona para el envio del formulario
        e.preventDefault();
        setError("");

        if (idTecnico.length !== 7) { // Validación de longitud del numero de empleado
            setError("El número de empleado debe tener exactamente 7 dígitos.");
            return;
        }

        try {
            // Petición POST al backend 
            const response = await fetch(`${API_URL}/login.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_tecnico: idTecnico, contrasena }),
                credentials: "include"
            });

            const data = await response.json(); // Convertir a json la respuesta del servidor

            if (data.status !== "ok") {
                setError(data.message || "Credenciales incorrectas.");
                return;
            }

            setIdentidad(data.identidad);   // Guardar identidad y permisos reales
            setPermisos(data.permisos);
            setSubModuloActual(null);

            let modulosPermitidos = obtenerModulosDesdePermisos(data.permisos)  // Obtener módulos reales desde permisos
                .filter(m => m !== "Autenticación" && m !== "Ingresar");

            setModuloActual(modulosPermitidos.length > 0 ? modulosPermitidos[0] : "Autenticación");

        } catch (error) {
            console.error(error);
            setError("Error de conexión con el servidor.");
        }
    };

    return (
        <div className="sesion-form">
            <form onSubmit={enviarFormulario}> {/* Ejecutar la función */}

                <InputGenerico
                    value={idTecnico}
                    setValue={setIdTecnico}
                    label="Número de empleado"
                    maxLength={7}
                    allowedChars="0-9"
                    placeholder="7120000"
                    title="Debe contener exactamente 7 dígitos numéricos"
                />

                <InputContrasena
                    contrasena={contrasena}
                    setContrasena={setContrasena}
                    label="Contraseña"
                />

                {error && <p className="error">{error}</p>}

                <div className="form-buttons">
                    <button type="submit">Entrar</button>
                </div>
            </form>
        </div>
    );
}

export default IniciarSesion;
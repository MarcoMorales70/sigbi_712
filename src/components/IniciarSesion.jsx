import { useState } from "react"; // Hook de React para manejar variables de estado dentro del componente
import { useGlobal } from "../context/ContenedorGlobal"; // Hook personalizado para acceder a variables compartidas del contexto global
import "../styles/Formularios.css"; // Importa estilos CSS compartidos para formularios
import { obtenerModulosDesdePermisos } from "../data/permisosUtils"; // Función que traduce permisos en módulos disponibles
import InputContrasena from "./InputContrasena"; // Componente reutilizable para campo de contraseña
import InputGenerico from "./InputGenerico"; // Componente reutilizable para campo de texto genérico

function IniciarSesion() {
    // Definicion de estados iniciales, se extraen funciones del contexto global necesarias para actualizar sus estados
    const { setIdentidad, setModuloActual, setSubModuloActual, setPermisos } = useGlobal();
    const [idTecnico, setIdTecnico] = useState(""); // 
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState("");

    const enviarFormulario = async (e) => { // Función asincrona para el envio del formulario
        e.preventDefault(); // Comportameinto por defecto o recargar la página
        setError(""); // Limpiar cualquier error previo

        if (idTecnico.length !== 7) { // Validación de longitud del numero de empleado
            setError("El número de empleado debe tener exactamente 7 dígitos.");
            return; // Mostrar el error y detener el proceso
        }

        try {
            // Petición POST al backend 
            const response = await fetch("http://localhost/sigbi_712/api/login.php", {
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

                <InputGenerico // Componente reutilizable para obtener el id_tecnico
                    value={idTecnico}
                    setValue={setIdTecnico}
                    label="Número de empleado"
                    maxLength={7}
                    allowedChars="0-9"
                    placeholder="7120000"
                    title="Debe contener exactamente 7 dígitos numéricos"
                />

                <InputContrasena    // Componente reutilizable para obtener la contrasena
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
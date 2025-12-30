import { useGlobal } from "../context/ContenedorGlobal";
import SesionForm from "./SesionForm";
import Control from "./Control";
import CambiarContrasena from "./CambiarContrasena";
import RecuperarContrasena from "./RecuperarContrasena";
import CompletarRegistro from "./CompletarRegistro";



function Main() {
    const { moduloActual, subModuloActual, identidad, setModuloActual, setSubModuloActual, setIdentidad } = useGlobal();

    console.log("Main render:", { moduloActual, subModuloActual, identidad });

    // ============================
    // 1. MODO INVITADO
    // ============================
    if (!identidad) {
        if (subModuloActual === "Iniciar sesión") {
            return (
                <div style={{ padding: "20px" }}>
                    <SesionForm />
                </div>
            );
        }

        // 👇 Caso especial: Cambiar contraseña en modo invitado
        if (subModuloActual === "Cambiar contraseña") {
            return (
                <div style={{ padding: "20px" }}>
                    <CambiarContrasena
                        onSuccess={() => {
                            // cerrar sesión y regresar al login
                            setIdentidad(null);
                            setModuloActual("Autenticación");
                            setSubModuloActual(null);
                        }}
                    />
                </div>
            );
        }

        // Recuperar contraseña en modo invitado
        if (subModuloActual === "Recuperar contraseña") {
            return (
                <div style={{ padding: "20px" }}>
                    <RecuperarContrasena />
                </div>
            );
        }

        // Completar registro 
        if (subModuloActual === "Completar registro") {
            return (
                <div style={{ padding: "20px" }}>
                    <CompletarRegistro />
                </div>
            );
        }







        if (subModuloActual) {
            return (
                <div style={{ padding: "20px" }}>
                    <p>Vista correspondiente a: {subModuloActual}</p>
                </div>
            );
        }

        return (
            <div style={{ padding: "20px" }}>
                <p>Selecciona una opción del menú lateral para iniciar sesión.</p>
            </div>
        );
    }

    // ============================
    // 2. MODO AUTENTICADO
    // ============================

    if (subModuloActual) {
        return (
            <div style={{ padding: "20px" }}>
                <p>Vista correspondiente a: {subModuloActual}</p>
            </div>
        );
    }

    if (moduloActual === "Control") {
        return (
            <div style={{ padding: "20px" }}>
                <Control />
            </div>
        );
    }

    if (moduloActual) {
        return (
            <div style={{ padding: "20px" }}>
                <p>Contenido del módulo {moduloActual}</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <p>Selecciona una opción del menú lateral XXXX.</p>
        </div>
    );
}

export default Main;
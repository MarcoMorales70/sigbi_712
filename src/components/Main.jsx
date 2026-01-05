import { useGlobal } from "../context/ContenedorGlobal";

import Control from "./Control";
import Solicitudes from "./Solicitudes";

// Acciones / subMenus del módulo Autenticación
import IniciarSesion from "./IniciarSesion";
import CambiarContrasena from "./CambiarContrasena";
import RecuperarContrasena from "./RecuperarContrasena";
import CompletarRegistro from "./CompletarRegistro";

// Acciones / subMenus del módulo Control
import RegistrarTecnicos from "./RegistrarTecnicos";
import ConsultarTecnicos from "./ConsultarTecnicos";
import ModificarTecnicos from "./ModificarTecnicos";
import EliminarTecnicos from "./EliminarTecnicos";
import GenerarCodigos from "./GenerarCodigos";

// Acciones / subMenus del módulo Solicitudes
import CrearSolicitudes from "./CrearSolicitudes";
import ConsultarSolicitudes from "./ConsultarSolicitudes";
import ModificarSolicitudes from "./ModificarSolicitudes";
import EliminarSolicitudes from "./EliminarSolicitudes";
import CerrarSolicitudes from "./CerrarSolicitudes";


function Main() {
    const { moduloActual, subModuloActual, identidad, setModuloActual, setSubModuloActual, setIdentidad } = useGlobal();

    // ============================
    // 1. MODO DE ARRANQUE (sin identidad)
    // ============================
    if (!identidad) {
        if (subModuloActual === "Iniciar sesión") {
            return (
                <div style={{ padding: "20px" }}>
                    <IniciarSesion />
                </div>
            );
        }

        if (subModuloActual === "Cambiar contraseña") {
            return (
                <div style={{ padding: "20px" }}>
                    <CambiarContrasena
                        onSuccess={() => {
                            setIdentidad(null);
                            setModuloActual("Autenticación");
                            setSubModuloActual(null);
                        }}
                    />
                </div>
            );
        }

        if (subModuloActual === "Recuperar contraseña") {
            return (
                <div style={{ padding: "20px" }}>
                    <RecuperarContrasena />
                </div>
            );
        }

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
                    <p>Vista correspondiente a: {subModuloActual} en modo de arranque ... desde Main.jsx</p>
                </div>
            );
        }

        return (
            <div style={{ padding: "20px" }}>
                <p>Selecciona una opción del menú lateral para iniciar sesión. ... desde Main.jsx</p>
            </div>
        );
    }

    // ============================
    // 2. MODO AUTENTICADO
    // ============================

    // --- Módulo Control ---
    if (moduloActual === "Control") {
        if (subModuloActual === "Registrar Técnicos") {
            return <div style={{ padding: "20px" }}><RegistrarTecnicos /></div>;
        }
        if (subModuloActual === "Consultar Técnicos") {
            return <div style={{ padding: "20px" }}><ConsultarTecnicos /></div>;
        }
        if (subModuloActual === "Modificar Técnicos") {
            return <div style={{ padding: "20px" }}><ModificarTecnicos /></div>;
        }
        if (subModuloActual === "Eliminar Técnicos") {
            return <div style={{ padding: "20px" }}><EliminarTecnicos /></div>;
        }
        if (subModuloActual === "Generar Códigos") {
            return <div style={{ padding: "20px" }}><GenerarCodigos /></div>;
        }

        // Si no hay submódulo, mostramos el módulo Control completo
        return <div style={{ padding: "20px" }}><Control /></div>;
    }

    // --- Módulo Solicitudes ---
    if (moduloActual === "Solicitudes") {
        if (subModuloActual === "Crear Solicitudes") {
            return <div style={{ padding: "20px" }}><CrearSolicitudes /></div>;
        }
        if (subModuloActual === "Consultar Solicitudes") {
            return <div style={{ padding: "20px" }}><ConsultarSolicitudes /></div>;
        }
        if (subModuloActual === "Modificar Solicitudes") {
            return <div style={{ padding: "20px" }}><ModificarSolicitudes /></div>;
        }
        if (subModuloActual === "Eliminar Solicitudes") {
            return <div style={{ padding: "20px" }}><EliminarSolicitudes /></div>;
        }
        if (subModuloActual === "Cerrar Solicitudes") {
            return <div style={{ padding: "20px" }}><CerrarSolicitudes /></div>;
        }

        return <div style={{ padding: "20px" }}><Solicitudes /></div>;
    }

    // --- Otros módulos aún no mapeados ---
    if (moduloActual) {
        return (
            <div style={{ padding: "20px" }}>
                <p>Contenido del módulo {moduloActual} en modo autenticado... desde Main.jsx</p>
            </div>
        );
    }

    // --- Fallback ---
    return (
        <div style={{ padding: "20px" }}>
            <p>Selecciona una opción del menú lateral... en modo autenticado desde Main.jsx</p>
        </div>
    );
}

export default Main;
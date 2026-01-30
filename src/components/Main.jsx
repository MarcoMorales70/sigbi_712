import { useGlobal } from "../context/ContenedorGlobal";

// Acciones / subMenús del módulo Autenticación
import IniciarSesion from "./IniciarSesion";
import CambiarContrasena from "./CambiarContrasena";
import RecuperarContrasena from "./RecuperarContrasena";
import CompletarRegistro from "./CompletarRegistro";

// Acciones / subMenús del módulo Control
import Control from "./Control";
import RegistrarTecnicos from "./RegistrarTecnicos";
import ConsultarTecnicos from "./ConsultarTecnicos";
import ModificarTecnicos from "./ModificarTecnicos";
import EliminarTecnicos from "./EliminarTecnicos";
import GenerarCodigos from "./GenerarCodigos";

// Acciones / subMenús del módulo Solicitudes
import Solicitudes from "./Solicitudes";
import CrearSolicitudes from "./CrearSolicitudes";
import ConsultarSolicitudes from "./ConsultarSolicitudes";
import ModificarSolicitudes from "./ModificarSolicitudes";
import EliminarSolicitudes from "./EliminarSolicitudes";
import CerrarSolicitudes from "./CerrarSolicitudes";

// Acciones / subMenús del módulo Hardware
import Hardware from "./Hardware";
import RegistrarBienes from "./RegistrarBienes";
import ConsultarBienes from "./ConsultarBienes";
import ModificarBienes from "./ModificarBienes";
import EliminarBienes from "./EliminarBienes";

import CrearBajas from "./CrearBajas";
import ConsultarBajas from "./ConsultarBajas";
import ModificarBajas from "./ModificarBajas";
import EliminarBajas from "./EliminarBajas";

import ReactivarBienes from "./ReactivarBienes";

import RegistrarUsuarios from "./RegistrarUsuarios";
import ConsultarUsuarios from "./ConsultarUsuarios";
import ModificarUsuarios from "./ModificarUsuarios";
import EliminarUsuarios from "./EliminarUsuarios";

// Acciones / subMenús del módulo Red
import Red from "./Red";
import RegistarSwitch from "./RegistrarSwitch";
import ConsultarSwitch from "./ConsultarSwitch";
import ModificarSwitch from "./ModificarSwitch";
import EliminarSwitch from "./EliminarSwitch";

import RegistrarPatchP from "./RegistrarPatchP";
import ConsultarPatchP from "./ConsultarPatchP";
import ModificarPatchP from "./ModificarPatchP";
import EliminarPatchP from "./EliminarPatchP";

import RastrearRed from "./RastrearRed";

// Acciones / subMenús del módulo Software
import Software from "./Software"
import RegistrarConfig from "./RegistrarConfig"
import AsignarConfig from "./AsignarConfig"
import RegistrarServicios from "./RegistrarServicios"
import AsignarServicios from "./AsignarServicios"
import GestionarIps from "./GestionarIps";

// Acciones / subMenús del módulo Reportes
import Reportes from "./Reportes"
import ReportesPorCategoria from "./ReportesPorCategoria"
import VisualizarIndicadores from "./VisualizarIndicadores"
import ConsultarBitacora from "./ConsultarBitacora";

function Main() {
    const { moduloActual, subModuloActual, identidad, setModuloActual, setSubModuloActual, setIdentidad } = useGlobal();

    // Modo de arranque (sin identidad)

    // Acción "Iniciar Sesión"
    if (!identidad) {
        if (subModuloActual === "Iniciar sesión") {
            return (
                <div style={{ padding: "20px" }}>
                    <IniciarSesion />
                </div>
            );
        }

        // Acción "Cambiar Contraseña"
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

        // Acción "Recuperar Contraseña"
        if (subModuloActual === "Recuperar contraseña") {
            return (
                <div style={{ padding: "20px" }}>
                    <RecuperarContrasena />
                </div>
            );
        }

        // Acción "Completar Registro"
        if (subModuloActual === "Completar registro") {
            return (
                <div style={{ padding: "20px" }}>
                    <CompletarRegistro />
                </div>
            );
        }

        // Para un subModulo que no este registrado o genérico
        if (subModuloActual) {
            return (
                <div style={{ padding: "20px" }}>
                    <p>Vista correspondiente a: {subModuloActual} en modo de arranque...</p>
                </div>
            );
        }

        return (
            <div style={{ padding: "30px" }}>
                <p>Selecciona una opción del menú lateral para iniciar sesión. ... desde Main.jsx</p>
            </div>
        );
    }

    // Modo autenticado (con identidad)

    // Módulo Control
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

        // En caso de no haber subModulo se muestra el módulo
        return <div style={{ padding: "20px" }}><Control /></div>;
    }

    // Módulo Solicitudes
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

        // En caso de no haber subModulo se muestra el módulo
        return <div style={{ padding: "20px" }}><Solicitudes /></div>;
    }


    // Módulo Hardware
    if (moduloActual === "Hardware") {

        // Sección Bienes
        if (subModuloActual === "Registrar Bienes") {
            return <div style={{ padding: "20px" }}><RegistrarBienes /></div>;
        }
        if (subModuloActual === "Consultar Bienes") {
            return <div style={{ padding: "20px" }}><ConsultarBienes /></div>;
        }
        if (subModuloActual === "Modificar Bienes") {
            return <div style={{ padding: "20px" }}><ModificarBienes /></div>;
        }
        if (subModuloActual === "Eliminar Bienes") {
            return <div style={{ padding: "20px" }}><EliminarBienes /></div>;
        }

        // Sección Bajas
        if (subModuloActual === "Crear Bajas") {
            return <div style={{ padding: "20px" }}><CrearBajas /></div>;
        }
        if (subModuloActual === "Consultar Bajas") {
            return <div style={{ padding: "20px" }}><ConsultarBajas /></div>;
        }
        if (subModuloActual === "Modificar Bajas") {
            return <div style={{ padding: "20px" }}><ModificarBajas /></div>;
        }
        if (subModuloActual === "Eliminar Bajas") {
            return <div style={{ padding: "20px" }}><EliminarBajas /></div>;
        }
        if (subModuloActual === "Reactivar Bienes") {
            return <div style={{ padding: "20px" }}><ReactivarBienes /></div>;
        }

        // Sección Usuarios
        if (subModuloActual === "Registrar Usuarios") {
            return <div style={{ padding: "20px" }}><RegistrarUsuarios /></div>;
        }
        if (subModuloActual === "Consultar Usuarios") {
            return <div style={{ padding: "20px" }}><ConsultarUsuarios /></div>;
        }
        if (subModuloActual === "Modificar Usuarios") {
            return <div style={{ padding: "20px" }}><ModificarUsuarios /></div>;
        }
        if (subModuloActual === "Eliminar Usuarios") {
            return <div style={{ padding: "20px" }}><EliminarUsuarios /></div>;
        }

        // En caso de no haber subModulo se muestra el módulo
        return <div style={{ padding: "20px" }}><Hardware /></div>;
    }


    // Módulo Red 
    if (moduloActual === "Red") {

        // Sección Switch
        if (subModuloActual === "Registrar Switch") {
            return <div style={{ padding: "20px" }}><RegistarSwitch /></div>;
        }
        if (subModuloActual === "Consultar Switch") {
            return <div style={{ padding: "20px" }}><ConsultarSwitch /></div>;
        }
        if (subModuloActual === "Modificar Switch") {
            return <div style={{ padding: "20px" }}><ModificarSwitch /></div>;
        }
        if (subModuloActual === "Eliminar Switch") {
            return <div style={{ padding: "20px" }}><EliminarSwitch /></div>;
        }

        // Sección Patch Panel
        if (subModuloActual === "Registrar Patch Panel") {
            return <div style={{ padding: "20px" }}><RegistrarPatchP /></div>;
        }
        if (subModuloActual === "Consultar Patch Panel") {
            return <div style={{ padding: "20px" }}><ConsultarPatchP /></div>;
        }
        if (subModuloActual === "Modificar Patch Panel") {
            return <div style={{ padding: "20px" }}><ModificarPatchP /></div>;
        }
        if (subModuloActual === "Eliminar Patch Panel") {
            return <div style={{ padding: "20px" }}><EliminarPatchP /></div>;
        }

        // Sección Restrear Red por elemento
        if (subModuloActual === "Restrear Red por Elemento") {
            return <div style={{ padding: "20px" }}><RastrearRed /></div>;
        }

        // En caso de no haber subModulo se muestra el módulo
        return <div style={{ padding: "20px" }}><Red /></div>;
    }


    // Módulo Software
    if (moduloActual === "Software") {

        if (subModuloActual === "Registrar Servicios") {
            return <div style={{ padding: "20px" }}><RegistrarServicios /></div>;
        }
        if (subModuloActual === "Asignar Servicios") {
            return <div style={{ padding: "20px" }}><AsignarServicios /></div>;
        }
        if (subModuloActual === "Registrar Configuraciones") {
            return <div style={{ padding: "20px" }}><RegistrarConfig /></div>;
        }
        if (subModuloActual === "Asignar Configuraciones") {
            return <div style={{ padding: "20px" }}><AsignarConfig /></div>;
        }
        if (subModuloActual === "Gestionar IPs") {
            return <div style={{ padding: "20px" }}><GestionarIps /></div>;
        }

        // En caso de no haber subModulo se muestra el módulo
        return <div style={{ padding: "20px" }}><Software /></div>;
    }

    // Módulo Reportes
    if (moduloActual === "Reportes") {

        if (subModuloActual === "Reportes por Categoría") {
            return <div style={{ padding: "20px" }}><ReportesPorCategoria /></div>;
        }
        if (subModuloActual === "Visualizar Indicadores") {
            return <div style={{ padding: "20px" }}><VisualizarIndicadores /></div>;
        }
        if (subModuloActual === "Consultar Bitácora") {
            return <div style={{ padding: "20px" }}><ConsultarBitacora /></div>;
        }

        // En caso de no haber subModulo se muestra el módulo
        return <div style={{ padding: "20px" }}><Reportes /></div>;
    }

    // Módulos no mapeados
    if (moduloActual) {
        return (
            <div style={{ padding: "20px" }}>
                <p>Contenido del módulo {moduloActual} en modo autenticado... </p>
            </div>
        );
    }

    // Fallback o retorno por defecto
    return (
        <div style={{ padding: "20px" }}>
            <p>Selecciona una opción del menú lateral... en modo autenticado desde Main</p>
        </div>
    );
}

export default Main;
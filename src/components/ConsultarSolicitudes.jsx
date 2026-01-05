import { useGlobal } from "../context/ContenedorGlobal";

function ConsultarSolicitudes() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente ConsultarSolicitudes.jsx</p>
        </div>
    );
}

export default ConsultarSolicitudes;
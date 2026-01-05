import { useGlobal } from "../context/ContenedorGlobal";

function CerrarSolicitudes() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente CerrarSolicitudes.jsx</p>
        </div>
    );
}

export default CerrarSolicitudes;
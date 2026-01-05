import { useGlobal } from "../context/ContenedorGlobal";

function CrearSolicitudes() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente CrearSolicitudes.jsx</p>
        </div>
    );
}

export default CrearSolicitudes;
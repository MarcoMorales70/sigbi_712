import { useGlobal } from "../context/ContenedorGlobal";

function EliminarSolicitudes() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente EliminarSolicitudes.jsx</p>
        </div>
    );
}

export default EliminarSolicitudes;
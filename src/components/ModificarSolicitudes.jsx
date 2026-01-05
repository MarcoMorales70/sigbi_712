import { useGlobal } from "../context/ContenedorGlobal";

function ModificarSolicitudes() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente ModificarSolicitudes.jsx</p>
        </div>
    );
}

export default ModificarSolicitudes;
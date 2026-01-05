import { useGlobal } from "../context/ContenedorGlobal";

function Control() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente Control.jsx</p>
        </div>
    );
}

export default Control;
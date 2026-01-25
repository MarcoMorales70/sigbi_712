import { useGlobal } from "../context/ContenedorGlobal";

function AsignarConfig() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente AsignarConfig.jsx</p>
        </div>
    );
}

export default AsignarConfig;
import { useGlobal } from "../context/ContenedorGlobal";

function RegistrarConfig() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente RegistrarConfig.jsx</p>
        </div>
    );
}

export default RegistrarConfig;
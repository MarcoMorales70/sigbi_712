import { useGlobal } from "../context/ContenedorGlobal";

function GestionarIps() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente GestionarIps.jsx</p>
        </div>
    );
}

export default GestionarIps;
import { useGlobal } from "../context/ContenedorGlobal";

function RegistrarServicios() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente RegistrarServicios.jsx</p>
        </div>
    );
}

export default RegistrarServicios;
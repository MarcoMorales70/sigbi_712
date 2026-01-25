import { useGlobal } from "../context/ContenedorGlobal";

function AsignarServicios() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente AsignarServicios.jsx</p>
        </div>
    );
}

export default AsignarServicios;
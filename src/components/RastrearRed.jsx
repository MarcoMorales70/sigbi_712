import { useGlobal } from "../context/ContenedorGlobal";

function RastrearRed() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente RastrearRed.jsx</p>
        </div>
    );
}

export default RastrearRed;
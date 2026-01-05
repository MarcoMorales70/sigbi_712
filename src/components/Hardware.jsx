import { useGlobal } from "../context/ContenedorGlobal";

function Hardware() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba del componente Hardware.jsx</p>
        </div>
    );
}

export default Hardware;
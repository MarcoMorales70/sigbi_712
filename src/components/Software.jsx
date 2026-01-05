import { useGlobal } from "../context/ContenedorGlobal";

function Software() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba del componente Software.jsx</p>
        </div>
    );
}

export default Software;
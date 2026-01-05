import { useGlobal } from "../context/ContenedorGlobal";

function Red() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba del componente Red.jsx</p>
        </div>
    );
}

export default Red;
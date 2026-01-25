import { useGlobal } from "../context/ContenedorGlobal";

function VisualizarIndicadores() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente VisualizarIndicadores.jsx</p>
        </div>
    );
}

export default VisualizarIndicadores;
import { useGlobal } from "../context/ContenedorGlobal";

function ReportesPorCategoria() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente ReportesPorCategoria.jsx</p>
        </div>
    );
}

export default ReportesPorCategoria;
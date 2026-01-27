import { useGlobal } from "../context/ContenedorGlobal";

function ReportesPorCategoria() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
                En construcción...
            </p>
            <p>Texto de prueba desde dentro del componente ReportesPorCategoria.jsx</p>
        </div>
    );
}

export default ReportesPorCategoria;
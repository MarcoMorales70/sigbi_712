import { useGlobal } from "../context/ContenedorGlobal";

function Solicitudes() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
                En construcción...
            </p>
            <p>Texto de prueba dentro del componente Solicitudes.jsx</p>
        </div>
    );
}

export default Solicitudes;
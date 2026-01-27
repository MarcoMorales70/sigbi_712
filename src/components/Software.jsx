import { useGlobal } from "../context/ContenedorGlobal";

function Software() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
                En construcción...
            </p>
            <p>Texto de prueba del componente Software.jsx</p>
        </div>
    );
}

export default Software;
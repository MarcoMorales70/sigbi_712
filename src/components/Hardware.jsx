import { useGlobal } from "../context/ContenedorGlobal";

function Hardware() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
                En construcción...
            </p>
            <p>Texto de prueba del componente Hardware.jsx</p>
        </div>
    );
}

export default Hardware;
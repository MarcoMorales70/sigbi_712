import { useGlobal } from "../context/ContenedorGlobal";

function RegistrarPatchP() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
                En construcción...
            </p>
            <p>Texto de prueba desde dentro del componente RegistrarPatchP.jsx</p>
        </div>
    );
}

export default RegistrarPatchP;
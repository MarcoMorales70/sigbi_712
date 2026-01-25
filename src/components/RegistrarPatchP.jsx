import { useGlobal } from "../context/ContenedorGlobal";

function RegistrarPatchP() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente RegistrarPatchP.jsx</p>
        </div>
    );
}

export default RegistrarPatchP;
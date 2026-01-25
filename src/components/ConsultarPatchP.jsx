import { useGlobal } from "../context/ContenedorGlobal";

function ConsultarPatchP() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente ConsultarPatchP.jsx</p>
        </div>
    );
}

export default ConsultarPatchP;
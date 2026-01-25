import { useGlobal } from "../context/ContenedorGlobal";

function ModificarPatchP() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente ModificarPatchP.jsx</p>
        </div>
    );
}

export default ModificarPatchP;
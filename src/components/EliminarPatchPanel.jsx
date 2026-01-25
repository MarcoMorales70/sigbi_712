import { useGlobal } from "../context/ContenedorGlobal";

function EliminarPatchP() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente EliminarPatchP.jsx</p>
        </div>
    );
}

export default EliminarPatchP;
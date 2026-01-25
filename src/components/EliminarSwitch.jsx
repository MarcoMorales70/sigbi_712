import { useGlobal } from "../context/ContenedorGlobal";

function EliminarSwitch() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente EliminarSwitch.jsx</p>
        </div>
    );
}

export default EliminarSwitch;
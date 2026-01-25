import { useGlobal } from "../context/ContenedorGlobal";

function ModificarSwitch() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente ModificarSwitch.jsx</p>
        </div>
    );
}

export default ModificarSwitch;
import { useGlobal } from "../context/ContenedorGlobal";
import SaludoTecnico from "./SaludoTecnico";

function Control() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>

        </div>
    );
}

export default Control;
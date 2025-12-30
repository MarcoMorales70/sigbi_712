import "../styles/Actividad.css";
import { useGlobal } from "../context/ContenedorGlobal";

function Actividad() {
    const { moduloActual, subModuloActual, identidad } = useGlobal();

    // Prioridad: primero subModuloActual, luego moduloActual
    const actividad =
        subModuloActual ||
        moduloActual ||
        identidad?.categoria ||
        "Sistema de Control de Bienes Informáticos";

    return (
        <h3 className="actividad">
            {actividad}
        </h3>
    );
}

export default Actividad;
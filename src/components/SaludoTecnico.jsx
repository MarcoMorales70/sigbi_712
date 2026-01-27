import "../styles/SaludoTecnico.css";
import { useGlobal } from "../context/ContenedorGlobal";

function SaludoTecnico() {

    const { identidad } = useGlobal();

    // Si no hay identidad, no se muestra nada
    if (!identidad) return null;

    // Se usa el nombre completo que ya devuelve login.php
    const nombreCompleto = identidad.nombre || "Técnico";

    return (
        <h3 className="saludo">
            Bienvenido: {nombreCompleto}
        </h3>
    );
}

export default SaludoTecnico;
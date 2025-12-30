import "../styles/SaludoTecnico.css";
import { useGlobal } from "../context/ContenedorGlobal";

function SaludoTecnico() {

    const { identidad } = useGlobal();

    // Si no hay identidad, no mostramos nada
    if (!identidad) return null;

    // Usamos el nombre completo que ya devuelve login.php
    const nombreCompleto = identidad.nombre || "Técnico";

    return (
        <h3 className="saludo">
            Hola: {nombreCompleto}
        </h3>
    );
}

export default SaludoTecnico;
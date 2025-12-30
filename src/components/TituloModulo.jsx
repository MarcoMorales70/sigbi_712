import "../styles/TituloModulo.css";
import { useGlobal } from "../context/ContenedorGlobal";

function TituloModulo() {

    const { moduloActual, identidad } = useGlobal();

    // Si no hay móduloActual, usamos la categoría del usuario (Página Principal)
    const nombre = moduloActual || identidad?.categoria || "Página Principal";

    return (
        <h2 className="titulo-modulo">
            {nombre}
        </h2>
    );
}

export default TituloModulo;
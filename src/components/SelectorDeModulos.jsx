import { useGlobal } from "../context/ContenedorGlobal";
import { obtenerModulosDesdePermisos } from "../data/permisosUtils";
import "../styles/SelectorDeModulos.css";

function SelectorDeModulos() {

    const { permisos, moduloActual, setModuloActual } = useGlobal();

    // Obtener módulos reales desde permisos
    let modulos = obtenerModulosDesdePermisos(permisos)
        .filter(m => m !== "Autenticación");

    return (
        <div className="selector-modulos-sidebar">
            {modulos.map(modulo => (
                <div
                    key={modulo}
                    className={`modulo-tag ${moduloActual === modulo ? "activo" : ""}`}
                    onClick={() => setModuloActual(modulo)}
                >
                    {modulo}
                </div>
            ))}
        </div>
    );
}

export default SelectorDeModulos;
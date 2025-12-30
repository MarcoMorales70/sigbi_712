import { useGlobal } from "../context/ContenedorGlobal";
import { permisosMap } from "../data/permisosMap";
import SelectorDeModulos from "./SelectorDeModulos";
import "../styles/Sidebar.css";

function Sidebar() {

    const { permisos, subModuloActual, setSubModuloActual, moduloActual, setModuloActual, setIdentidad, identidad } = useGlobal();

    // ============================
    // 1. Construir menú dinámico
    // ============================
    const menuDinamico = {};

    permisos.forEach(idPermiso => {
        const info = permisosMap[idPermiso];
        if (!info) return;

        const { modulo, seccion, titulo } = info;

        if (!menuDinamico[modulo]) {
            menuDinamico[modulo] = {};
        }

        if (!menuDinamico[modulo][seccion]) {
            menuDinamico[modulo][seccion] = [];
        }

        menuDinamico[modulo][seccion].push(titulo);
    });

    // ============================
    // 2. Obtener secciones del módulo actual
    // ============================
    const secciones = menuDinamico[moduloActual] || {};

    // ============================
    // 3. Acción de cerrar sesión
    // ============================
    const handleLogout = () => {
        setIdentidad(null);
        setModuloActual("Autenticación");
        setSubModuloActual("Iniciar sesión");
        localStorage.removeItem("token"); // opcional si usas token
    };

    return (
        <aside className="sidebar">

            {/* Selector de módulos en la parte superior del Sidebar.jsx */}
            {/*<SelectorDeModulos />*/}

            {identidad && <SelectorDeModulos />}

            <ul className="sidebar-lista">

                {Object.entries(secciones).map(([seccion, items]) => {

                    if (seccion === moduloActual) return null;

                    // Acción directa (sin sección)
                    if (seccion === "null" || seccion === null) {
                        return items.map(item => (
                            <li
                                key={item}
                                className={`sidebar-item ${subModuloActual === item ? "activo" : ""}`}
                                onClick={() => setSubModuloActual(item)}
                            >
                                {item}
                            </li>
                        ));
                    }

                    // ✅ Sección con submenú
                    return (
                        <li key={seccion} className="sidebar-seccion">

                            <div className="sidebar-seccion-titulo">
                                {seccion}
                            </div>

                            <ul className="sidebar-submenu">
                                {items.map(item => (
                                    <li
                                        key={item}
                                        className={`sidebar-subitem ${subModuloActual === item ? "activo" : ""}`}
                                        onClick={() => setSubModuloActual(item)}
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>

                        </li>
                    );
                })}

            </ul>

            {/* ✅ Botón de cerrar sesión solo si hay identidad */}
            {identidad && (
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                </div>
            )}
        </aside>
    );
}

export default Sidebar;
import { useGlobal } from "../context/ContenedorGlobal";
import API_URL from "../config";
import { permisosMap } from "../data/permisosMap";
import SelectorDeModulos from "./SelectorDeModulos";
import "../styles/Sidebar.css";

function Sidebar() {

    const { permisos, subModuloActual, setSubModuloActual, moduloActual, setModuloActual, setIdentidad, identidad } = useGlobal();

    // Menú dinamico
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

    // Obtener las secciones del módulo actual
    const secciones = menuDinamico[moduloActual] || {};

    // Bloque para cerrar la sesión 
    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_URL}/logout.php`, {
                method: "POST",
                credentials: "include"   // Se envía la cookie PHPSESSID a la api
            });

            const data = await response.json();
            // console.log("Logout backend:", data); // Mensaje de apoyo

        } catch (error) {
            console.error("Error al cerrar sesión en backend:", error);
        }

        // Limpiar estado global en frontend
        setIdentidad(null);
        setModuloActual("Autenticación");
        setSubModuloActual("Iniciar sesión");
    };

    return (
        <aside className="sidebar">

            {/* Selector de módulos en la parte superior del Sidebar.jsx */}
            {identidad && <SelectorDeModulos />}

            <ul className="sidebar-lista">

                {Object.entries(secciones).map(([seccion, items]) => {

                    if (seccion === moduloActual) return null;

                    // Acción directa, cuando una acción no corresponde a un grupo especifico o sección
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

                    // Sección con algun aacción
                    return (
                        <li key={seccion} className="sidebar-seccion">

                            {/* Al hacer clic en el título de la sección, cambiamos el módulo */}
                            <div
                                className="sidebar-seccion-titulo"
                                onClick={() => {
                                    setModuloActual(seccion);
                                    setSubModuloActual(null);
                                }}
                            >
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

            {/* Botón de cerrar sesión, cuando hay identidad */}
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
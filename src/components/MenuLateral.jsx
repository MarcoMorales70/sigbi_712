import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import '../styles/MenuLateral.css';

function MenuLateral() {

    const { setPermiso } = useContext(AppContext);

    return (
        <nav className="menu-lateral">
            <ul>

                {/* Opción principal: Ingresar */}
                <li className="menu-item">
                    Ingresar
                    <ul className="submenu">
                        <li onClick={() => setPermiso(1)}>
                            Iniciar Sesión
                        </li>
                        <li onClick={() => setPermiso(2)}>
                            Cambiar Contraseña
                        </li>
                        <li onClick={() => setPermiso(3)}>
                            Recuperar Contraseña
                        </li>
                        <li onClick={() => setPermiso(4)}>
                            Completar Registro
                        </li>
                    </ul>
                </li>

                <li className="menu-item">
                    Acerca de...
                </li>

                <li className="menu-item">
                    Contacto
                </li>

            </ul>
        </nav>
    );
}

export default MenuLateral;
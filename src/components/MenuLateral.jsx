import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import '../styles/MenuLateral.css';

function MenuLateral() {
    const { setAccion } = useContext(AppContext);

    return (
        <nav className="menu-lateral">
            <ul>

                {/* Opción principal: Ingresar */}
                <li className="menu-item">
                    Ingresar
                    <ul className="submenu">
                        <li onClick={() => setAccion("login")}>
                            Iniciar Sesión
                        </li>
                        <li onClick={() => setAccion("cambiar_password")}>
                            Cambiar Contraseña
                        </li>
                        <li onClick={() => setAccion("recuperar_password")}>
                            Recuperar Contraseña
                        </li>
                        <li onClick={() => setAccion("registro")}>
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
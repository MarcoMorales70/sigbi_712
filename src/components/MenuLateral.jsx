import '../styles/MenuLateral.css';

function MenuLateral() {
    return (
        <nav className="menu-lateral">
            <ul>

                {/* Opción principal: Ingresar */}
                <li className="menu-item">
                    Ingresar
                    <ul className="submenu">
                        <li>Iniciar Sesión</li>
                        <li>Cambiar Contraseña</li>
                        <li>Recuperar Contraseña</li>
                        <li>Completar Registro</li>
                    </ul>
                </li>

                {/* Opción principal: Acerca de... */}
                <li className="menu-item">
                    Acerca de...
                </li>

                {/* Opción principal: Contacto */}
                <li className="menu-item">
                    Contacto
                </li>

            </ul>
        </nav>
    );
}

export default MenuLateral;
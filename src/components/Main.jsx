import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import MenuLateral from "./MenuLateral";
import SaludoTecnico from "./SaludoTecnico";

import "../styles/Main.css";

function Main({ children }) {
    const { usuario, aPaterno, loading, error } = useContext(AppContext);

    return (
        <main className="main">

            {/* Saludo superior */}
            <div className="saludo">
                <SaludoTecnico usuario={usuario} aPaterno={aPaterno} />
            </div>

            {/* Contenedor principal */}
            <div className="contenedor-main">

                {/* Menú lateral */}
                <MenuLateral />

                {/* Contenido dinámico */}
                <div className="contenido">




                    {loading && <p>Cargando datos...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {!loading && !error && children}

                </div>

            </div>
        </main>
    );
}

export default Main;
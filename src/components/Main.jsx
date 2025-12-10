import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import MenuLateral from "./MenuLateral";
import SaludoTecnico from "./SaludoTecnico";
import LoginForm from "./LoginForm";

import "../styles/Main.css";

function Main({ children }) {
    const { usuario, aPaterno, loading, error, accion } = useContext(AppContext);


    //bloque de seleccion segun permiso 
    //Esta función decide qué mostrar según el permiso (accion)

    const renderContenido = () => {
        if (loading) return <p>Cargando datos...</p>;
        if (error) return <p style={{ color: "red" }}>{error}</p>;

        switch (accion) {
            case "login":
                return <LoginForm />;

            case "cambiar_password":
                return <p>Aquí irá el formulario de cambiar contraseña</p>;

            case "recuperar_password":
                return <p>Aquí irá el formulario de recuperar contraseña</p>;

            case "registro":
                return <p>Aquí irá el formulario de registro</p>;

            // Más adelante: módulos reales
            case "bienes":
                return <p>Módulo de bienes</p>;

            case "hardware":
                return <p>Módulo de hardware</p>;

            default:
                return children; // Vista por defecto
        }
    };

    // termina bloque de decisión 


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

                    {renderContenido()}

                    {/*
                    {loading && <p>Cargando datos...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {!loading && !error && children}
                    */}

                </div>

            </div>
        </main>
    );
}

export default Main;
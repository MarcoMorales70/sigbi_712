import { useEffect } from "react";
import { useGlobal } from "../context/ContenedorGlobal";

function Control() {

    const { identidad, subModuloActual, setModuloActual, setSubModuloActual, logout } = useGlobal();

    useEffect(() => {   // Para esegurar que limpie subModulo y forzar la carga de este modulo
        setSubModuloActual(null);
        setModuloActual("Control");
    }, [setSubModuloActual, setModuloActual]);

    return (
        <div>
            <p style={{ color: "red", fontSize: "24px", fontWeight: "bold" }}>
                En construcción...
            </p>
            <p>Texto de prueba desde dentro del componente Control.jsx</p>
        </div>
    );
}

export default Control;
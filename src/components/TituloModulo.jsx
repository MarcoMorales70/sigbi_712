import { useEffect, useState } from "react";
import "../styles/TituloModulo.css";

function TituloModulo({ permiso }) {
    const [nombreCategoria, setNombreCategoria] = useState("Página principal");

    useEffect(() => {
        const obtenerModulo = async () => {
            try {
                const response = await fetch(`http://localhost/api/modulo.php?id=${permiso}`);
                const data = await response.json();

                if (data && data.categoria) {
                    setNombreCategoria(data.categoria);
                } else {
                    setNombreCategoria("Sin módulo");
                }
            } catch (error) {
                console.error("Error al obtener el módulo:", error);
                setNombreCategoria("Error de conexión");
            }
        };

        if (permiso) {
            obtenerModulo();
        }
    }, [permiso]);

    return (
        <h2 className="titulo-modulo">
            {nombreCategoria}
        </h2>
    );
}

export default TituloModulo;
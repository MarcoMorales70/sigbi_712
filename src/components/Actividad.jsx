import { useEffect, useState } from "react";
import "../styles/Actividad.css";

function Actividad({ permiso }) {
    const [nombreActividad, setNombreActividad] = useState("Sistema"); // valor por defecto

    useEffect(() => {
        const obtenerActividad = async () => {
            try {
                const response = await fetch(`http://localhost/api/actividad.php?id=${permiso}`);
                const data = await response.json();

                if (data && data.permiso) {
                    setNombreActividad(data.permiso);
                } else {
                    setNombreActividad("Sin actividad");
                }
            } catch (error) {
                console.error("Error al obtener la actividad:", error);
                setNombreActividad("Error de conexión");
            }
        };

        if (permiso) {
            obtenerActividad();
        }
    }, [permiso]);

    return (
        <h3 className="actividad">
            {nombreActividad}
        </h3>
    );
}

export default Actividad;
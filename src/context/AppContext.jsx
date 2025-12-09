import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [idTecnico, setIdTecnico] = useState(null);
    const [tecnico, setTecnico] = useState(null);
    const [categoria, setCategoria] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [aPaterno, setApaterno] = useState(null);
    const [accion, setAccion] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para cargar datos del técnico desde el endpoint
    const cargarTecnico = async (id) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`http://localhost/api/tecnico.php?id=${id}`); // Se llama a la Api
            const data = await response.json(); // Se recibe el objeto json y se almacena en una variable

            if (data.error) {
                setError(data.error);
            } else {    // Se desmenuza el objeto
                setTecnico(data);
                setCategoria(data.categoria);
                setIdTecnico(data.id_tecnico);
                setUsuario(data.usuario);
                setApaterno(data.a_paterno);
            }
        } catch (err) {
            setError("Error al conectar con el servidor");
        }

        setLoading(false);
    };

    return (
        <AppContext.Provider
            value={{
                idTecnico,
                tecnico,
                categoria,
                usuario,
                aPaterno,
                accion,
                setAccion,
                cargarTecnico,
                loading,
                error
            }}
        >
            {children}
        </AppContext.Provider>
    );
};
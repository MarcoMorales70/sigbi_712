import { createContext, useContext, useState } from "react";  // Se importan las funciones de la librería de react.
import API_URL from "../config";

const ContenedorGlobal = createContext(); // Se crea un contexto global para compartir estados entre componentes.
const permisosArranque = [1, 2, 3, 4]; // Permisos en modo invitado / de arranque, básicos.

export function ContenedorGlobalProvider({ children }) { // Permite la exportación de la funcion ContenedorGlobalProvider y sea consumida por otros archivos

    const [identidad, setIdentidad] = useState(null); // Identidad del usuario arranca con null porqu eaun no inicia sesión.
    const [permisos, setPermisos] = useState(permisosArranque); // Permisos dinámicos según identidad, de principio usa permisosArranque.
    const [moduloActual, setModuloActual] = useState("Autenticación"); // Estado de navegación, se arranca con el módulo "Autenticación".
    const [subModuloActual, setSubModuloActual] = useState(null); // Estado de navegación, del submódulo, se arranca en null, porque aun no se selecciona ninguna acción.
    const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);   // Para pasar de un componente a otro.
    const [bienSeleccionado, setBienSeleccionado] = useState(null); // Para mantener el dato del bien entre componentes.

    // Función para cerrar sesión en backend y limpiar el estado en frontend
    const logout = async () => { // Se declara la función cerrar sesión como asíncrona
        try {
            const response = await fetch(`${API_URL}/logout.php`, {
                method: "POST",
                credentials: "include" // Se incluyen las cookies
            });
            const data = await response.json(); // se convierte la respuesta en json
        } catch (error) {
            console.error("Error cerrando sesión en backend:", error);
        }
        // Se limpian los estados en el frontend, se inicializan como en el arranque
        setIdentidad(null);
        setPermisos(permisosArranque);
        setModuloActual("Autenticación");
        setSubModuloActual(null);
        setTecnicoSeleccionado(null);
    };

    // Funcion iniciar sesión, configura identidad, permisos y navega al módulo inicial
    const login = (nuevaIdentidad, nuevosPermisos = []) => {
        setIdentidad(nuevaIdentidad);
        setPermisos(Array.isArray(nuevosPermisos) ? nuevosPermisos : []);
        setSubModuloActual(null);
        setTecnicoSeleccionado(null);

        if (nuevosPermisos.length > 0) { // Seleccionar módulo inicial dinámico
            setModuloActual(null);
        } else {
            setModuloActual("Autenticación");
        }
    };

    return (
        <ContenedorGlobal.Provider
            value={{
                identidad,
                setIdentidad,
                permisos,
                setPermisos,
                moduloActual,
                setModuloActual,
                subModuloActual,
                setSubModuloActual,
                bienSeleccionado,
                setBienSeleccionado,
                tecnicoSeleccionado,
                setTecnicoSeleccionado,
                logout,
                login,
            }}
        >
            {children}
        </ContenedorGlobal.Provider>
    );
}

export function useGlobal() {
    return useContext(ContenedorGlobal);
}
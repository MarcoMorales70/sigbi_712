import { createContext, useContext, useState } from "react";

const ContenedorGlobal = createContext();

// Permisos en modo invitado (arranque)
const permisosArranque = [1, 2, 3, 4];

export function ContenedorGlobalProvider({ children }) {
    // Identidad del usuario (null = invitado)
    const [identidad, setIdentidad] = useState(null);

    // Permisos dinámicos según identidad; en invitado usa permisosArranque
    const [permisos, setPermisos] = useState(permisosArranque);

    // Estado de navegación
    const [moduloActual, setModuloActual] = useState("Autenticación");
    const [subModuloActual, setSubModuloActual] = useState(null);

    // Técnico seleccionado (para pasar de Consultar → Modificar)
    const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);

    // Cerrar sesión: destruye sesión en backend y limpia estado en frontend
    const logout = async () => {
        try {
            const response = await fetch("http://localhost/sigbi_712/api/logout.php", {
                method: "POST",
                credentials: "include"
            });
            const data = await response.json();
            console.log("Logout backend:", data);
        } catch (error) {
            console.error("Error cerrando sesión en backend:", error);
        }
        setIdentidad(null);
        setPermisos(permisosArranque);
        setModuloActual("Autenticación");
        setSubModuloActual(null);
        setTecnicoSeleccionado(null); // limpiar técnico seleccionado
    };

    // Iniciar sesión: configura identidad, permisos y navega al módulo inicial
    const login = (nuevaIdentidad, nuevosPermisos = []) => {
        setIdentidad(nuevaIdentidad);
        setPermisos(Array.isArray(nuevosPermisos) ? nuevosPermisos : []);
        setSubModuloActual(null);
        setTecnicoSeleccionado(null); // limpiar técnico seleccionado

        // Seleccionar módulo inicial dinámico
        if (nuevosPermisos.length > 0) {
            setModuloActual("Control"); // ajusta según tu lógica real
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
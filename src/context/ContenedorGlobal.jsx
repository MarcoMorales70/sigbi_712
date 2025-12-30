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

    // Cerrar sesión: vuelve al modo invitado y restablece navegación
    /*const logout = () => {
        setIdentidad(null);
        setPermisos(permisosArranque);
        setModuloActual("Autenticación");
        setSubModuloActual(null);
    };*/
    const logout = async () => {
        try {
            await fetch("http://localhost/sigbi_712/api/logout.php", {
                method: "POST",
                credentials: "include"
            });
        } catch (error) {
            console.error("Error cerrando sesión en backend:", error);
        }
        setIdentidad(null);
        setPermisos(permisosArranque);
        setModuloActual("Autenticación");
        setSubModuloActual(null);
    };








    // Iniciar sesión: configura identidad, permisos y navega al módulo inicial
    const login = (nuevaIdentidad, nuevosPermisos = []) => {
        setIdentidad(nuevaIdentidad);
        setPermisos(Array.isArray(nuevosPermisos) ? nuevosPermisos : []);
        // Opcional: al iniciar sesión, limpiar submódulos y redirigir al módulo por defecto
        setModuloActual("Control"); // ajusta si tu pantalla inicial autenticada es otra
        setSubModuloActual(null);
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
                logout,
                login, // expuesto para uso en SesionForm/login.php
            }}
        >
            {children}
        </ContenedorGlobal.Provider>
    );
}

export function useGlobal() {
    return useContext(ContenedorGlobal);
}
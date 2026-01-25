import { permisosMap } from "./permisosMap"; // Se exporta el mapa de permisos desde permisosMap.js clave-valor

export function obtenerModulosDesdePermisos(listaPermisos) {
    const modulos = new Set(); // Se crea un array con set para no permitir duplicados

    listaPermisos.forEach(idPermiso => { // Recorrer cada permiso de la lista
        const info = permisosMap[idPermiso];    // Buscar información del permiso en el mapa de permisos
        if (info) { // Si existe informacion para ese permiso
            modulos.add(info.modulo);   // Se agrega el nombre del módulo al set
        }
    });

    return Array.from(modulos); // Convierte y devuelve un array normal con los nombres de los módulos únicos de listaPermisos que se le pasen
}
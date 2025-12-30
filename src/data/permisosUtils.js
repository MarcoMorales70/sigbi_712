import { permisosMap } from "./permisosMap";

export function obtenerModulosDesdePermisos(listaPermisos) {
    const modulos = new Set();

    listaPermisos.forEach(idPermiso => {
        const info = permisosMap[idPermiso];
        if (info) {
            modulos.add(info.modulo);
        }
    });

    return Array.from(modulos);
}
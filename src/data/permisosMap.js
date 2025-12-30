export const permisosMap = {

    // ============================
    // AUTENTICACIÓN (id_categoria = 2)
    // ============================
    1: { modulo: "Autenticación", seccion: null, titulo: "Iniciar sesión" },
    2: { modulo: "Autenticación", seccion: null, titulo: "Cambiar contraseña" },
    3: { modulo: "Autenticación", seccion: null, titulo: "Recuperar contraseña" },
    4: { modulo: "Autenticación", seccion: null, titulo: "Completar registro" },

    // ============================
    // CONTROL (id_categoria = 3)
    // ============================
    5: { modulo: "Control", seccion: "Técnicos", titulo: "Registrar Técnicos" },
    6: { modulo: "Control", seccion: "Técnicos", titulo: "Consultar Técnicos" },
    7: { modulo: "Control", seccion: "Técnicos", titulo: "Modificar Técnicos" },
    8: { modulo: "Control", seccion: "Técnicos", titulo: "Modificar Permisos" },
    9: { modulo: "Control", seccion: "Técnicos", titulo: "Eliminar Técnicos" },

    10: { modulo: "Control", seccion: null, titulo: "Generar Códigos" },
    //11: { modulo: "Control", seccion: null, titulo: "Ingresar a Módulos" },

    // ============================
    // SOLICITUDES (id_categoria = 4)
    // ============================
    12: { modulo: "Solicitudes", seccion: null, titulo: "Crear Solicitudes" },
    13: { modulo: "Solicitudes", seccion: null, titulo: "Consultar Solicitudes" },
    14: { modulo: "Solicitudes", seccion: null, titulo: "Modificar Solicitudes" },
    15: { modulo: "Solicitudes", seccion: null, titulo: "Eliminar Solicitudes" },
    16: { modulo: "Solicitudes", seccion: null, titulo: "Cerrar Solicitudes" },

    // ============================
    // HARDWARE (id_categoria = 5)
    // ============================
    17: { modulo: "Hardware", seccion: "Bienes", titulo: "Registrar Bienes" },
    18: { modulo: "Hardware", seccion: "Bienes", titulo: "Consultar Bienes" },
    19: { modulo: "Hardware", seccion: "Bienes", titulo: "Modificar Bienes" },
    20: { modulo: "Hardware", seccion: "Bienes", titulo: "Eliminar Bienes" },
    21: { modulo: "Hardware", seccion: "Bajas", titulo: "Crear Bajas" },
    22: { modulo: "Hardware", seccion: "Bajas", titulo: "Consultar Bajas" },
    23: { modulo: "Hardware", seccion: "Bajas", titulo: "Modificar Bajas" },
    24: { modulo: "Hardware", seccion: "Bajas", titulo: "Eliminar Bajas" },
    25: { modulo: "Hardware", seccion: "Bienes", titulo: "Reactivar Bienes" },

    26: { modulo: "Hardware", seccion: "Usuarios", titulo: "Registrar Usuarios" },
    27: { modulo: "Hardware", seccion: "Usuarios", titulo: "Consultar Usuarios" },
    28: { modulo: "Hardware", seccion: "Usuarios", titulo: "Modificar Usuarios" },
    29: { modulo: "Hardware", seccion: "Usuarios", titulo: "Eliminar Usuarios" },

    // ============================
    // RED (id_categoria = 6)
    // ============================
    30: { modulo: "Red", seccion: "Switches", titulo: "Registrar Switch" },
    31: { modulo: "Red", seccion: "Switches", titulo: "Consultar Switch" },
    32: { modulo: "Red", seccion: "Switches", titulo: "Modificar Switch" },
    33: { modulo: "Red", seccion: "Switches", titulo: "Modificar Puertos Switch" },
    34: { modulo: "Red", seccion: "Switches", titulo: "Eliminar Switch" },

    35: { modulo: "Red", seccion: "Patch Panel", titulo: "Registrar Patch Panel" },
    36: { modulo: "Red", seccion: "Patch Panel", titulo: "Consultar Patch Panel" },
    37: { modulo: "Red", seccion: "Patch Panel", titulo: "Modificar Patch Panel" },
    38: { modulo: "Red", seccion: "Patch Panel", titulo: "Modificar Puertos Patch Panel" },
    39: { modulo: "Red", seccion: "Patch Panel", titulo: "Eliminar Patch Panel" },

    40: { modulo: "Red", seccion: null, titulo: "Rastrear Red por Elemento" },

    // ============================
    // SOFTWARE (id_categoria = 7)
    // ============================
    41: { modulo: "Software", seccion: null, titulo: "Registrar Servicios" },
    42: { modulo: "Software", seccion: null, titulo: "Agregar Servicios" },
    43: { modulo: "Software", seccion: null, titulo: "Registrar Configuración" },
    44: { modulo: "Software", seccion: null, titulo: "Asignar Configuración" },
    45: { modulo: "Software", seccion: null, titulo: "Gestionar IPs" },

    // ============================
    // REPORTES (id_categoria = 8)
    // ============================
    46: { modulo: "Reportes", seccion: null, titulo: "Reportes por Categoría" },
    47: { modulo: "Reportes", seccion: null, titulo: "Indicadores Técnicos" },
    48: { modulo: "Reportes", seccion: null, titulo: "Bitácora Técnica" },

};

console.log("permisosMap:", permisosMap);
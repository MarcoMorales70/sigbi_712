import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";

function ConsultarTecnicos() {
    const { permisos, setSubModuloActual, setTecnicoSeleccionado } = useGlobal();
    const [tecnicos, setTecnicos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);

    const tienePermisoConsultar = permisos.includes(6); // 6 = ID permiso "Consultar técnicos"

    // Efecto secundario para validar que el tiene permiso
    useEffect(() => {
        if (tienePermisoConsultar) {
            fetch("http://localhost/sigbi_712/api/consultar_tecnicos.php", {
                credentials: "include"
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok") {
                        setTecnicos(data.tecnicos || []);
                    } else {
                        setMensaje(data.message);
                    }
                })
                .catch(() => setMensaje("Error al cargar técnicos."));
        }
    }, [tienePermisoConsultar]);

    if (!tienePermisoConsultar) {
        return <p>Acceso denegado. No tiene permiso para consultar técnicos.</p>;
    }

    const handleExportar = async () => {
        if (tecnicos.length === 0) return;

        let headers = [];
        let rows = [];

        try {
            if (seleccionado === null) {
                // Exportar todos los técnicos
                headers = ["ID Técnico", "Rol", "Nombre completo"];
                rows = tecnicos.map(t => [t.id_tecnico, t.rol, t.nombre_completo]);
            } else {
                // Exportar solo el técnico seleccionado con datos enriquecidos con otras tablas (más detalaldo)
                const response = await fetch(`http://localhost/sigbi_712/api/consulta_6.php?id_tecnico=${seleccionado}`, {
                    credentials: "include"
                });
                const data = await response.json();

                if (data.status === "ok") {
                    const tec = data.tecnico;

                    headers = [
                        "ID Usuario",
                        "Usuario",
                        "Apellido Paterno",
                        "Apellido Materno",
                        "Correo",
                        "Cargo",
                        "Dirección",
                        "Acrónimo",
                        "Ubicación",
                        "Edificio",
                        "Nivel",
                        "Rol",
                        "Permisos"
                    ];

                    rows = [[
                        tec.id_usuario,
                        tec.usuario,
                        tec.a_paterno,
                        tec.a_materno,
                        tec.correo,
                        tec.cargo,
                        tec.direccion_a,
                        tec.acronimo,
                        tec.ubicacion,
                        tec.edificio,
                        tec.nivel,
                        tec.rol,
                        (tec.permisos || []).join("; ")
                    ]];
                } else {
                    alert("Error al consultar técnico: " + data.message);
                    return;
                }
            }

            // Función para escapar valores CSV y exportar correctamente los campos
            const escapeCSV = (value) => {
                if (value === null || value === undefined) return "";
                const str = value.toString();
                // Si contiene coma, salto de línea o comillas, se envuelve en comillas dobles, para que no desfase las columnas vs los valores
                if (/[",\r\n]/.test(str)) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            // Generar CSV
            let csvContent = "\uFEFF";
            csvContent += headers.map(escapeCSV).join(",") + "\r\n";
            rows.forEach(r => {
                csvContent += r.map(escapeCSV).join(",") + "\r\n";
            });

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "tecnicos.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            alert("Error al exportar: " + error.message);
        }
    };

    const handleModificar = () => {
        if (seleccionado) {
            setTecnicoSeleccionado(seleccionado);
            setSubModuloActual("Modificar Técnicos");
        }
    };

    const handleEliminar = () => {
        if (seleccionado) {
            setTecnicoSeleccionado(seleccionado);
            setSubModuloActual("Eliminar Técnicos");
        }
    };

    return (
        <div className="sesion-form">
            <h2>Lista de Técnicos</h2>
            {mensaje && <p className="error">{mensaje}</p>}
            {/* Se muestra la tabla solo con ciertos campos*/}
            <table className="tabla-estandar seleccion-unica">
                <thead>
                    <tr>
                        <th>Seleccionar</th>
                        <th>ID Técnico</th>
                        <th>Rol</th>
                        <th>Nombre completo</th>
                        {/*<th>Permisos</th>*/}
                    </tr>
                </thead>
                <tbody>
                    {tecnicos.map((tec) => (
                        <tr key={tec.id_tecnico}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={seleccionado === tec.id_tecnico}
                                    onChange={() => {
                                        const nuevo = seleccionado === tec.id_tecnico ? null : tec.id_tecnico;
                                        setSeleccionado(nuevo);
                                        console.log("Seleccionado:", nuevo);
                                    }}
                                />
                            </td>
                            <td>{tec.id_tecnico}</td>
                            <td>{tec.rol}</td>
                            <td>{tec.nombre_completo}</td>
                            {/*<td>Consultar</td>*/}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="acciones">
                <button disabled={!seleccionado} onClick={handleModificar}>Modificar</button>
                <button disabled={!seleccionado} onClick={handleEliminar}>Eliminar</button>
                <button className="exportar" onClick={handleExportar}>Exportar</button>
            </div>
        </div>
    );
}

export default ConsultarTecnicos;
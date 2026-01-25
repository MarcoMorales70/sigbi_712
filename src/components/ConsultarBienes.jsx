import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";

function ConsultarBienes() {
    const { permisos, setSubModuloActual, setBienSeleccionado } = useGlobal();
    const [bienes, setBienes] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);

    const tienePermisoConsultar = permisos.includes(18); // id_permiso=18 "Consultar Bienes"

    useEffect(() => {
        if (tienePermisoConsultar) {
            fetch("http://localhost/sigbi_712/api/consulta_18.php", {
                credentials: "include"
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok") {
                        setBienes(data.bienes || []);
                    } else {
                        setMensaje(data.message || "No se pudieron cargar los bienes.");
                    }
                })
                .catch(() => setMensaje("Error al cargar bienes."));
        }
    }, [tienePermisoConsultar]);

    if (!tienePermisoConsultar) {
        return <p>Acceso denegado. No tiene permiso para consultar bienes.</p>;
    }

    const handleExportar = async () => {
        if (bienes.length === 0) return;

        const headers = ["Serie", "Ip", "Usuario"];
        let rows = [];

        try {
            if (seleccionado === null) {
                // Exportar todos
                rows = bienes.map(b => [
                    b.serie_bien,
                    b.ip || "",
                    `${b.a_paterno ?? ""} ${b.a_materno ?? ""} ${b.usuario ?? ""}`.trim()
                ]);
            } else {
                // Exportar solo el bien seleccionado
                const response = await fetch(
                    `http://localhost/sigbi_712/api/consulta_18_1.php?serie_bien=${encodeURIComponent(seleccionado)}`,
                    { credentials: "include" }
                );
                const data = await response.json();

                if (data.status === "ok") {
                    const bien = data.bien;
                    rows = [[
                        bien.serie_bien,
                        bien.ip || "",
                        `${bien.a_paterno ?? ""} ${bien.a_materno ?? ""} ${bien.usuario ?? ""}`.trim()
                    ]];
                } else {
                    alert("Error al consultar bien: " + (data.message || "Desconocido"));
                    return;
                }
            }

            // Generar CSV
            let csvContent = "\uFEFF";
            csvContent += headers.join(",") + "\r\n";
            rows.forEach(r => {
                csvContent += r.map(v => String(v).replace(/,/g, " ")).join(",") + "\r\n";
            });

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "bienes.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            alert("Error al exportar: " + error.message);
        }
    };

    const handleModificar = () => {
        if (seleccionado) {
            setBienSeleccionado(seleccionado); // Guardar serie_bien en global
            setSubModuloActual("Modificar Bienes");
        }
    };

    const handleEliminar = () => {
        if (seleccionado) {
            setBienSeleccionado(seleccionado); // Guardar serie_bien en global
            setSubModuloActual("Eliminar Bienes");
        }
    };

    return (
        <div className="sesion-form">
            <h2>Lista de Bienes</h2>
            {mensaje && <p className="error">{mensaje}</p>}

            <table className="tabla-estandar seleccion-unica">
                <thead>
                    <tr>
                        <th>Seleccionar</th>
                        <th>Serie</th>
                        <th>Ip</th>
                        <th>Usuario</th>
                    </tr>
                </thead>
                <tbody>
                    {bienes.map((bien) => (
                        <tr key={bien.serie_bien}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={seleccionado === bien.serie_bien}
                                    onChange={() => {
                                        const nuevo = seleccionado === bien.serie_bien ? null : bien.serie_bien;
                                        setSeleccionado(nuevo);
                                        console.log("Seleccionado:", nuevo);
                                    }}
                                />
                            </td>
                            <td>{bien.serie_bien}</td>
                            <td>{bien.ip || ""}</td>
                            <td>{`${bien.a_paterno ?? ""} ${bien.a_materno ?? ""} ${bien.usuario ?? ""}`.trim()}</td>
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

export default ConsultarBienes;
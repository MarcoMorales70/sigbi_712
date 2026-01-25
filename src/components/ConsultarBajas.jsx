import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import Hardware from "./Hardware";
import EliminarBajas from "./EliminarBajas";
import ModificarBajas from "./ModificarBajas"; // 🔹 importar el componente

function ConsultarBajas() {
    const { permisos } = useGlobal();
    const [bajas, setBajas] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [seleccionado, setSeleccionado] = useState(null);
    const [mostrarHardware, setMostrarHardware] = useState(false);
    const [modoEliminar, setModoEliminar] = useState(false);
    const [modoModificar, setModoModificar] = useState(false); // 🔹 nuevo estado

    const tienePermisoConsultar = permisos.includes(22); // id_permiso=22 "Consultar Bajas"

    useEffect(() => {
        if (tienePermisoConsultar) {
            fetch("http://localhost/sigbi_712/api/consultar_bajas.php", {
                credentials: "include"
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok") {
                        setBajas(data.bajas || []);
                    } else {
                        setMensaje(data.message || "No se pudieron cargar las bajas.");
                        setTimeout(() => setMostrarHardware(true), 3000);
                    }
                })
                .catch(() => setMensaje("Error al cargar bajas."));
        }
    }, [tienePermisoConsultar]);

    if (!tienePermisoConsultar) {
        return <p>Acceso denegado. No tiene permiso para consultar bajas.</p>;
    }

    if (mostrarHardware) {
        return <Hardware />;
    }

    const handleExportar = () => {
        let datosExportar = [];

        if (seleccionado) {
            // Exportar solo el registro seleccionado
            const bajaSel = bajas.find(b => b.id_baja === seleccionado);
            if (bajaSel) {
                datosExportar = [bajaSel];
            }
        } else {
            // Exportar todos los registros
            datosExportar = bajas;
        }

        if (datosExportar.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        // Construir CSV
        const encabezados = ["id_baja", "baja", "total_dictamenes", "total_bienes"];
        const filas = datosExportar.map(b => [
            b.id_baja,
            b.baja,
            b.total_dictamenes,
            b.total_bienes
        ]);

        const csvContent = [
            encabezados.join(","), // primera fila: encabezados
            ...filas.map(fila => fila.join(","))
        ].join("\n");

        // Crear archivo y disparar descarga
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "bajas.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEliminar = () => {
        if (seleccionado) {
            setModoEliminar(true);
        }
    };

    const handleModificar = () => {
        if (seleccionado) {
            setModoModificar(true);
        }
    };

    if (modoEliminar) {
        const bajaSel = bajas.find(b => b.id_baja === seleccionado);
        if (!bajaSel) {
            return <p>Error: no se encontró la baja seleccionada.</p>;
        }
        return (
            <EliminarBajas
                idBajaInicial={bajaSel.id_baja}
                bajaInicial={bajaSel.baja}
                totalDictamenesInicial={bajaSel.total_dictamenes}
                totalBienesInicial={bajaSel.total_bienes}
            />
        );
    }

    if (modoModificar) {
        const bajaSel = bajas.find(b => b.id_baja === seleccionado);
        if (!bajaSel) {
            return <p>Error: no se encontró la baja seleccionada.</p>;
        }
        return (
            <ModificarBajas
                idBajaInicial={bajaSel.id_baja}
                bajaInicial={bajaSel.baja}
                totalDictamenesInicial={bajaSel.total_dictamenes}
                totalBienesInicial={bajaSel.total_bienes}
            />
        );
    }

    return (
        <div className="sesion-form">
            <h2>Lista de Bajas</h2>
            {mensaje && <p className="error">{mensaje}</p>}

            <table className="tabla-estandar seleccion-unica">
                <thead>
                    <tr>
                        <th>Seleccionar</th>
                        <th>Baja</th>
                        <th>Total Dictámenes</th>
                        <th>Total Bienes</th>
                    </tr>
                </thead>
                <tbody>
                    {bajas.map((baja) => (
                        <tr key={baja.id_baja}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={seleccionado === baja.id_baja}
                                    onChange={() => {
                                        const nuevo = seleccionado === baja.id_baja ? null : baja.id_baja;
                                        setSeleccionado(nuevo);
                                        console.log("Seleccionado:", nuevo);
                                    }}
                                />
                            </td>
                            <td>{baja.baja}</td>
                            <td>{baja.total_dictamenes}</td>
                            <td>{baja.total_bienes}</td>
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

export default ConsultarBajas;
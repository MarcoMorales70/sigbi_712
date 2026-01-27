import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import { useGlobal } from "../context/ContenedorGlobal";
import InputSelectIp from "./InputSelectIp";
import InputInventario from "./InputInventario";
import InputSelectEstados from "./InputSelectEstados";
import InputGenerico from "./InputGenerico";
import InputSelectGenerico from "./InputSelectGenerico";

function ModificarBienes() {
    const { permisos, setModuloActual, setSubModuloActual, bienSeleccionado, setBienSeleccionado } = useGlobal();

    const [serieBien, setSerieBien] = useState("");
    const [datosBien, setDatosBien] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [inventarioNuevo, setInventarioNuevo] = useState("");
    const [idIp, setIdIp] = useState(null);
    const [serieOriginal, setSerieOriginal] = useState("");
    const [serieNueva, setSerieNueva] = useState("");
    const tienePermisoModificar = permisos.includes(19); // id_permiso=19 "Modificar Bienes"

    useEffect(() => {
        if (datosBien) {
            setInventarioNuevo(datosBien.inventario || "");
            setIdIp(datosBien.id_ip ? Number(datosBien.id_ip) : null);
            setSerieOriginal(datosBien.serie_bien || "");
            setSerieNueva(datosBien.serie_bien || "");
        }
    }, [datosBien]);

    // Buscar bien manualmente
    const handleBuscar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost/sigbi_712/api/consultar_bien_especifico.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ serie_bien: serieBien })
            });

            const data = await response.json();

            if (data.status === "ok" && data.bien) {
                setDatosBien(data.bien);
            } else {
                setError(data.message || "Bien no encontrado.");
                setTimeout(() => {
                    setModuloActual("Control");
                    setSubModuloActual(null);
                }, 3000);
            }
        } catch {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Cargar bien automáticamente si viene desde ConsultarBienes.jsx
    useEffect(() => {
        if (bienSeleccionado) {
            fetch("http://localhost/sigbi_712/api/consultar_bien_especifico.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ serie_bien: bienSeleccionado })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === "ok" && data.bien) {
                        setDatosBien(data.bien);
                    } else {
                        setError(data.message || "Bien no encontrado.");
                    }
                })
                .catch(() => setError("Error al cargar bien."));
        }
    }, [bienSeleccionado]);

    // Modificar bien
    const handleModificar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!serieOriginal) {
            setError("No se detectó la serie original. Vuelve a cargar el bien antes de modificar.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                serie_original: serieOriginal,
                serie_nueva: serieNueva || serieOriginal,
                inventario_actual: datosBien?.inventario || "",
                inventario_nuevo: inventarioNuevo || "",
                id_ip: idIp || null,
                marca: datosBien?.marca || "",
                modelo: datosBien?.modelo || "",
                version_soft: datosBien?.version_soft || "",
                id_tipo: datosBien?.id_tipo || null,
                id_estado: datosBien?.id_estado || null,
                id_propietario: datosBien?.id_propietario || null,
                id_resg: datosBien?.id_resg || null,
                id_uso: datosBien?.id_uso || null,
                id_permiso: 19
            };

            const response = await fetch("http://localhost/sigbi_712/api/modificar_bienes.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.status === "ok") {
                setSuccess("\u2705 Bien modificado correctamente.");
                setDatosBien(prev => ({
                    ...prev,
                    serie_bien: data.serie_bien ?? payload.serie_nueva,
                    inventario: data.inventario ?? payload.inventario_nuevo,
                    id_ip: payload.id_ip
                }));
                setTimeout(() => {
                    setModuloActual("Control");
                    setSubModuloActual(null);
                    setBienSeleccionado(null);
                    setLoading(false);
                }, 3000);
            } else {
                setError(data.message || "Error al modificar bien.");
                setLoading(false);
            }
        } catch {
            setError("Error de conexión con el servidor.");
            setLoading(false);
            setTimeout(() => {
                setModuloActual("Control");
                setSubModuloActual(null);
                setBienSeleccionado(null);
                setLoading(false);
            }, 3000);
        }
    };

    if (!tienePermisoModificar) {
        return <p>Acceso denegado. No tiene permiso para modificar bienes.</p>;
    }

    return (
        <div className="sesion-form">
            {!datosBien && (
                <form onSubmit={handleBuscar}>
                    <InputGenerico
                        value={serieBien}
                        setValue={setSerieBien}
                        label="Serie del bien"
                        maxLength={50}
                        allowedChars="A-Z0-9/_\-"
                        transform="uppercase"
                        placeholder="MXL1234ABC"
                        title="Máximo 50 caracteres"
                    />
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Buscando..." : "Buscar"}
                        </button>
                    </div>
                </form>
            )}

            {datosBien && (
                <form onSubmit={handleModificar}>
                    <InputGenerico
                        value={serieNueva}
                        setValue={setSerieNueva}
                        label="Serie nueva"
                        maxLength={50}
                        allowedChars="A-Z0-9/_\-"
                        transform="uppercase"
                        placeholder="MXL1234ABC"
                        title="Máximo 50 caracteres"
                    />

                    <InputSelectGenerico
                        idSeleccionado={datosBien.id_tipo}
                        setIdSeleccionado={(value) => setDatosBien({ ...datosBien, id_tipo: value })}
                        label="Tipo de bien"
                        apiUrl="http://localhost/sigbi_712/api/consultar_tipo_bienes.php"
                        valueField="id_tipo"
                        displayField="tipo_bien"
                        showDefaultOption={true}
                        defaultOptionText="Seleccione un tipo"
                    />

                    <InputGenerico
                        value={datosBien.marca}
                        setValue={(value) => setDatosBien({ ...datosBien, marca: value })}
                        label="Marca"
                        maxLength={50}
                        allowedChars="A-Z0-9/_\-"
                        transform="uppercase"
                        placeholder="HP"
                    />

                    <InputGenerico
                        value={datosBien.modelo}
                        setValue={(value) => setDatosBien({ ...datosBien, modelo: value })}
                        label="Modelo"
                        maxLength={50}
                        allowedChars="A-Z0-9 /_\-"
                        transform="uppercase"
                        placeholder="PRODESK 700"
                    />

                    <InputGenerico
                        value={datosBien.version_soft}
                        setValue={(value) => setDatosBien({ ...datosBien, version_soft: value })}
                        label="Versión software"
                        maxLength={50}
                        allowedChars="A-Z0-9/_\-"
                        transform="uppercase"
                        placeholder="WINDOWS 11"
                    />

                    <InputSelectGenerico
                        idSeleccionado={datosBien.id_resg}
                        setIdSeleccionado={(val) => setDatosBien({ ...datosBien, id_resg: val })}
                        label="Resguardante"
                        apiUrl="http://localhost/sigbi_712/api/consultar_usuarios.php"
                        valueField="id_usuario"
                        displayField={(o) => `${o.a_paterno} - ${o.a_materno} - ${o.usuario}`}
                        showDefaultOption={true}
                        defaultOptionText="Seleccione usuario resguardante"
                    />

                    <InputSelectGenerico
                        idSeleccionado={datosBien.id_uso}
                        setIdSeleccionado={(val) => setDatosBien({ ...datosBien, id_uso: val })}
                        label="Operador"
                        apiUrl="http://localhost/sigbi_712/api/consultar_usuarios.php"
                        valueField="id_usuario"
                        displayField={(o) => `${o.a_paterno} - ${o.a_materno} - ${o.usuario}`}
                        showDefaultOption={true}
                        defaultOptionText="Seleccione usuario operador"
                    />

                    <InputSelectEstados
                        idEstado={datosBien.id_estado}
                        setIdEstado={(value) => setDatosBien({ ...datosBien, id_estado: value })}
                        estadoActualText={datosBien.estado_actual}
                        idEntidad={1}
                        label="Estado del bien"
                        apiUrl="http://localhost/sigbi_712/api/consultar_estados.php"
                    />

                    {/* Condición para aprovechar recursos IP */}
                    {[1, 2, 4].includes(Number(datosBien.id_estado)) && (
                        <InputSelectIp
                            idIp={idIp}
                            setIdIp={setIdIp}
                            ipActualText={datosBien?.ip}   // El que se obtiene del backend
                            label="IP disponible"
                        />
                    )}

                    <InputSelectGenerico
                        idSeleccionado={datosBien.id_propietario}
                        setIdSeleccionado={(value) => setDatosBien({ ...datosBien, id_propietario: value })}
                        label="Propietario"
                        apiUrl="http://localhost/sigbi_712/api/consultar_propietarios.php"
                        valueField="id_propietario"
                        displayField="propietario"
                        showDefaultOption={true}
                        defaultOptionText="Seleccione el propietario"
                    />

                    {/* Condición cuando el propietario es la misma organización */}
                    {Number(datosBien.id_propietario) === 1 && (
                        <InputInventario
                            inventario={inventarioNuevo}
                            setInventario={setInventarioNuevo}
                        />
                    )}

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Procesando..." : "Modificar"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default ModificarBienes;
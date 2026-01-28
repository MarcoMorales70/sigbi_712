import { useState, useEffect } from "react";
import API_URL from "../config";
import { useGlobal } from "../context/ContenedorGlobal";
import "../styles/Formularios.css";
import InputGenerico from "./InputGenerico";
import InputSelectIp from "./InputSelectIp";
import InputInventario from "./InputInventario";
import InputSelectEstados from "./InputSelectEstados";
import InputSelectGenerico from "./InputSelectGenerico";

function RegistrarBienes() {
    const { setModuloActual, setSubModuloActual } = useGlobal();
    const [serieBien, setSerieBien] = useState("");
    const [idIp, setIdIp] = useState("");
    const [idTipo, setIdTipo] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [version_soft, setVersion_soft] = useState("");
    const [inventario, setInventario] = useState("");
    const [idEstado, setIdEstado] = useState("");
    const [idPropietario, setIdPropietario] = useState("");
    const [idResg, setIdResg] = useState("");
    const [idUso, setIdUso] = useState("");
    const [sameUser, setSameUser] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validaciones básicas
        const serieTrim = (serieBien || "").trim();
        if (!serieTrim || serieTrim.length > 50) {
            setError("La serie debe tener máximo 50 caracteres y no puede estar vacía.");
            return;
        }
        if (!idTipo) {
            setError("Debe seleccionar un tipo de bien.");
            return;
        }

        const marcaTrim = (marca || "").trim();
        const modeloTrim = (modelo || "").trim();
        const version_softTrim = (version_soft || "").trim();
        const inventarioTrim = (inventario || "").trim();

        // Regla de negocio, el inventario es obligatorio solo si el propietario es SICT, cualquier otro no aplica
        if (idPropietario === 1 && !inventarioTrim) {
            setError("El inventario es obligatorio para bienes SICT.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/registrar_bienes.php`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    serie_bien: serieTrim,
                    id_ip: idIp || null,
                    id_tipo: idTipo,
                    marca: marcaTrim,
                    modelo: modeloTrim,
                    version_soft: version_softTrim,
                    inventario: inventarioTrim || null,
                    id_estado: idEstado || null,
                    id_propietario: idPropietario || null,
                    id_resg: idResg || null,
                    id_uso: sameUser ? idResg : (idUso || null)
                })
            });

            const data = await res.json();
            if (data.status === "ok") {
                setSuccess("\u2705 Bien registrado correctamente.");
                setTimeout(() => {
                    setModuloActual("Hardware");
                    setSubModuloActual(null);
                }, 3000);
            } else {
                setError(data.message || "\u274C No se pudo registrar el bien.");
            }
        } catch {
            setError("\u26A0 Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sesion-form">
            <form onSubmit={onSubmit}>
                <InputGenerico
                    value={serieBien}
                    setValue={setSerieBien}
                    label="Serie del bien"
                    maxLength={30}
                    allowedChars="A-Z0-9/_\-"
                    transform="uppercase"
                    placeholder="MXL1234ABC"
                />

                <InputSelectEstados
                    idEstado={idEstado}
                    setIdEstado={setIdEstado}
                    estadoActualText=""
                    idEntidad={1}
                    label="Estado del bien"
                />

                {/* Condición para aprovechar recursos IP */}
                {(idEstado === 1 || idEstado === 2 || idEstado === 4) && (
                    <InputSelectIp
                        idIp={idIp}
                        setIdIp={setIdIp}
                        label="Asignar IP disponible"
                    />
                )}

                <InputSelectGenerico
                    idSeleccionado={idTipo}
                    setIdSeleccionado={setIdTipo}
                    label="Tipo de bien"
                    apiUrl={`${API_URL}/consultar_tipo_bienes.php`}
                    valueField="id_tipo"
                    displayField="tipo_bien"
                    readOnly={false}
                    showDefaultOption={true}
                    defaultOptionText="Seleccione un tipo"
                />

                <InputGenerico
                    value={marca}
                    setValue={setMarca}
                    label="Marca"
                    maxLength={50}
                    allowedChars="A-Z0-9/_\-"
                    transform="uppercase"
                    placeholder="HP"
                />

                <InputGenerico
                    value={modelo}
                    setValue={setModelo}
                    label="Modelo"
                    maxLength={50}
                    allowedChars="A-Z0-9/_\-"
                    transform="uppercase"
                    placeholder="PRODESK 700"
                />

                <InputGenerico
                    value={version_soft}
                    setValue={setVersion_soft}
                    label="Versión software"
                    maxLength={50}
                    allowedChars="A-Z0-9/_\-"
                    transform="uppercase"
                    placeholder="WINDOWS 11"
                />

                <InputSelectGenerico
                    idSeleccionado={idPropietario}
                    setIdSeleccionado={setIdPropietario}
                    label="Propietario"
                    apiUrl={`${API_URL}/consultar_propietarios.php`}
                    valueField="id_propietario"
                    displayField="propietario"
                    readOnly={false}
                    showDefaultOption={true}
                    defaultOptionText="Seleccione el propietario"
                />

                {/* Solo bienes SICT llevan inventario */}
                {idPropietario === "1" && (
                    < InputInventario
                        inventario={inventario}
                        setInventario={setInventario}
                    />
                )}

                <InputSelectGenerico
                    idSeleccionado={idResg}
                    setIdSeleccionado={setIdResg}
                    label="Resguardante"
                    apiUrl={`${API_URL}/consultar_usuarios.php`}
                    valueField="id_usuario"
                    displayField={(o) => `${o.a_paterno} - ${o.a_materno} - ${o.usuario}`}
                    readOnly={false}
                    showDefaultOption={true}
                    defaultOptionText="Seleccione usuario resguardante"
                />

                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={sameUser}
                            onChange={(e) => setSameUser(e.target.checked)}
                        />
                        El resguardante opera el equipo
                    </label>
                </div>

                {!sameUser && (

                    <InputSelectGenerico
                        idSeleccionado={idUso}
                        setIdSeleccionado={setIdUso}
                        label="Operador"
                        apiUrl={`${API_URL}/consultar_usuarios.php`}
                        valueField="id_usuario"
                        displayField={(o) => `${o.a_paterno} - ${o.a_materno} - ${o.usuario}`}
                        readOnly={false}
                        showDefaultOption={true}
                        defaultOptionText="Seleccione usuario operador"
                    />
                )}

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <div className="form-buttons">
                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? "Registrando..." : "Registrar"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default RegistrarBienes;
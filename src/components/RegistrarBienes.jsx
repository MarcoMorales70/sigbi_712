import { useState, useEffect } from "react";
import { useGlobal } from "../context/ContenedorGlobal";
import "../styles/Formularios.css";
import InputGenerico from "./InputGenerico";
import InputSelectIp from "./InputSelectIp";
import InputSelectTipoBienes from "./InputSelectTipoBienes";
import InputInventario from "./InputInventario";
import InputSelectEstados from "./InputSelectEstados";
import InputSelectPropietarios from "./InputSelectPropietarios";
import InputSelectUsuarios from "./InputSelectUsuarios";

function RegistrarBienes() {
    const { setModuloActual, setSubModuloActual } = useGlobal();

    const [serieBien, setSerieBien] = useState("");
    const [idIp, setIdIp] = useState("");
    const [idTipo, setIdTipo] = useState("");
    const [tiposBienes, setTiposBienes] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [marca, setMarca] = useState("");
    const [modelo, setModelo] = useState("");
    const [version_soft, setVersion_soft] = useState("");
    const [inventario, setInventario] = useState("");
    const [idEstado, setIdEstado] = useState("");
    const [estados, setEstados] = useState([]);
    const [idPropietario, setIdPropietario] = useState("");
    const [propietarios, setPropietarios] = useState([]);
    const [idResg, setIdResg] = useState("");
    const [idUso, setIdUso] = useState("");
    const [sameUser, setSameUser] = useState(false);
    const [usuarios, setUsuarios] = useState([]);

    // Cargar listas auxiliares
    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_tipo_bienes.php", { credentials: "include" })
            .then(res => res.json())
            .then(data => Array.isArray(data) && setTiposBienes(data))
            .catch(() => setError("⚠️ Error al cargar tipos de bienes."));
    }, []);

    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_estados.php", { credentials: "include" })
            .then(res => res.json())
            .then(data => Array.isArray(data) && setEstados(data))
            .catch(() => setError("⚠️ Error al cargar estados."));
    }, []);

    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_propietarios.php", { credentials: "include" })
            .then(res => res.json())
            .then(data => Array.isArray(data) && setPropietarios(data))
            .catch(() => setError("⚠️ Error al cargar propietarios."));
    }, []);

    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_usuarios.php", { credentials: "include" })
            .then(res => res.json())
            .then(data => Array.isArray(data) && setUsuarios(data))
            .catch(() => setError("⚠️ Error al cargar usuarios."));
    }, []);

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
        const inventarioTrim = (inventario || "").trim(); // 👈 protegido contra null

        // ✅ Regla de negocio: inventario obligatorio solo si el propietario es SICT
        if (idPropietario === 1 && !inventarioTrim) {
            setError("El inventario es obligatorio para bienes SICT.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost/sigbi_712/api/registrar_bienes.php", {
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
                    inventario: inventarioTrim || null, // 👈 null si está vacío
                    id_estado: idEstado || null,
                    id_propietario: idPropietario || null,
                    id_resg: idResg || null,
                    id_uso: sameUser ? idResg : (idUso || null)
                })
            });

            const data = await res.json();
            if (data.status === "ok") {
                setSuccess("✅ Bien registrado correctamente.");
                setTimeout(() => {
                    setModuloActual("Hardware");
                    setSubModuloActual(null);
                }, 3000);
            } else {
                setError(data.message || "❌ No se pudo registrar el bien.");
            }
        } catch {
            setError("⚠️ Error de conexión con el servidor.");
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
                    estados={estados}
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

                <InputSelectTipoBienes
                    idTipo={idTipo}
                    setIdTipo={setIdTipo}
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

                <InputSelectPropietarios
                    propietarios={propietarios}
                    idPropietario={idPropietario}
                    setIdPropietario={setIdPropietario}
                />

                {/* Solo bienes SICT llevan inventario */}
                {idPropietario === 1 && (
                    < InputInventario
                        inventario={inventario}
                        setInventario={setInventario}
                    />
                )}

                <InputSelectUsuarios
                    usuarios={usuarios}
                    value={idResg}
                    setValue={setIdResg}
                    label="Usuario resguardante"
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
                    <InputSelectUsuarios
                        usuarios={usuarios}
                        value={idUso}
                        setValue={setIdUso}
                        label="Usuario operador"
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
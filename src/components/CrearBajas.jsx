import React, { useState, useEffect } from "react";
import "../styles/Formularios.css";
import InputGenerico from "./InputGenerico";
import Hardware from "./Hardware";

function CrearBajas() {
    const [baja, setBaja] = useState("");
    const [totalDictamenes, setTotalDictamenes] = useState("");
    const [totalBienesGlobal, setTotalBienesGlobal] = useState("");

    const [dictamenes, setDictamenes] = useState([]);
    const [registroOk, setRegistroOk] = useState(false); // Auxiliar para paso 2
    const [paso3Activo, setPaso3Activo] = useState(false); // Auxiliar para paso 3

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const isPositiveIntString = (s) => /^\d+$/.test(s) && parseInt(s, 10) > 0;

    const [dictamenesPaso3, setDictamenesPaso3] = useState([]);
    const [bienesDisponibles, setBienesDisponibles] = useState([]);
    const [dictamenActual, setDictamenActual] = useState(0);
    const [seleccionados, setSeleccionados] = useState([]);

    const [mostrarHardware, setMostrarHardware] = useState(false);
    const [bienesEdo3, setBienesEdo3] = useState(0); // Variable de referencia para limitar el ingreso de valores

    useEffect(() => {
        const fetchBienesEdo3 = async () => {
            try {
                const res = await fetch("http://localhost/sigbi_712/api/consultar_bienes_estado3.php", {
                    credentials: "include"
                });
                const data = await res.json();
                if (data.status === "ok") {
                    setBienesEdo3(data.bienesEdo3);
                } else {
                    setError(data.message || "Error al consultar bienes en estado 3");
                }
            } catch (err) {
                setError("Error de conexión al consultar bienes en estado 3");
            }
        };
        fetchBienesEdo3();
    }, []);

    // Paso 1
    const handleContinuar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        // Validaciones iniciales
        if (!baja.trim()) {
            setError("El campo 'baja' es obligatorio.");
            setLoading(false);
            return;
        }
        if (!isPositiveIntString(totalDictamenes)) {
            setError("El campo 'total de dictámenes' debe ser un número entero mayor a 0.");
            setLoading(false);
            return;
        }
        if (!isPositiveIntString(totalBienesGlobal)) {
            setError("El campo 'total de bienes' debe ser un número entero mayor a 0.");
            setLoading(false);
            return;
        }

        // Primero se convierte a número para realizar operaciones matemáticas
        const totalDictamenesInt = parseInt(totalDictamenes, 10);
        const totalBienesInt = parseInt(totalBienesGlobal, 10);

        // Validación contra bienesEdo3
        if (bienesEdo3 === 0) {
            setError("No se pudo consultar la cantidad de bienes susceptibles de baja. Intenta de nuevo.");
            setLoading(false);
            return;
        }

        if (totalBienesInt > bienesEdo3) {
            setError(
                `No existen ${totalBienesInt} bienes susceptibles de baja. Máximo permitido: ${bienesEdo3}.`
            );
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost/sigbi_712/api/registrar_baja_paso1.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    baja,
                    total_dictamenes: totalDictamenesInt,
                    total_bienes: totalBienesInt,
                }),
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                setError("El servidor no devolvió JSON válido");
                return;
            }

            if (data.status && data.status.toLowerCase() === "ok") {
                const nuevos = Array.from({ length: totalDictamenesInt }, () => ({
                    idDictamen: "",
                    totalBienes: "",
                }));
                setDictamenes(nuevos);
                setRegistroOk(true);
                setSuccess("\u2705 Baja registrada correctamente. Ahora ingresa los dictámenes.");
            } else {
                setError(data.message || "Error al registrar la baja.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    // Manejador de cambios en dictámenes
    const handleChangeDictamen = (index, field, value) => {
        const nuevos = [...dictamenes];
        nuevos[index][field] = value;
        setDictamenes(nuevos);
    };

    // Paso 2
    const handleContinuar2 = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            for (let i = 0; i < dictamenes.length; i++) {
                const d = dictamenes[i];
                if (!/^\d+$/.test(d.idDictamen)) {
                    throw new Error(`El ID de dictamen #${i + 1} debe ser numérico.`);
                }
                if (!isPositiveIntString(d.totalBienes)) {
                    throw new Error(`El total de bienes del dictamen #${i + 1} debe ser un entero mayor a 0.`);
                }
            }

            const detalle = dictamenes.map(d => ({
                id_dictamen: parseInt(d.idDictamen, 10),
                cant_bienes: parseInt(d.totalBienes, 10)
            }));

            const response = await fetch("http://localhost/sigbi_712/api/registrar_baja_paso2.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ baja, dictamenes: detalle })
            });

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                setError("El servidor no devolvió JSON válido");
                return;
            }

            if (data.status && data.status.toLowerCase() === "ok") {
                setSuccess("\u2705 Dictámenes registrados correctamente. Ahora pasa al tercer formulario.");
                setRegistroOk(false);
                setPaso3Activo(true);
                iniciarPaso3(detalle);
            } else {
                setError(data.message || "Error al registrar los dictámenes.");
            }
        } catch (err) {
            setError(err.message || "Error al preparar los datos.");
        } finally {
            setLoading(false);
        }
    };

    // Paso 3 cargar bienes y dictámenes
    const iniciarPaso3 = async () => {
        try {
            const response = await fetch("http://localhost/sigbi_712/api/consultar_bienes_baja.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ baja })
            });
            const data = await response.json();
            if (data.status === "ok") {
                setBienesDisponibles(data.bienes);
                if (dictamenesPaso3.length === 0) {
                    setDictamenesPaso3(data.dictamenes);
                }
                setSeleccionados([]);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Error al consultar bienes.");
        }
    };

    const toggleSeleccion = (serie) => {
        if (seleccionados.includes(serie)) {
            setSeleccionados(seleccionados.filter(s => s !== serie));
        } else {
            if (seleccionados.length < dictamenesPaso3[dictamenActual].cant_bienes) {
                setSeleccionados([...seleccionados, serie]);
            }
        }
    };

    const handleContinuarDictamen = async () => {
        const id_dictamen = dictamenesPaso3[dictamenActual].id_dictamen;
        try {
            const response = await fetch("http://localhost/sigbi_712/api/registrar_bienes_dictamen.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ id_dictamen, bienes: seleccionados })
            });
            const data = await response.json();
            if (data.status === "ok") {
                setBienesDisponibles(data.bienes);
                if (dictamenActual + 1 < dictamenesPaso3.length) {
                    setDictamenActual(dictamenActual + 1);
                    setSeleccionados([]);
                } else {
                    setSuccess("\u2705 Se crea la baja con éxito");
                    setTimeout(() => {
                        setMostrarHardware(true); // Activa Hardware
                    }, 3000);
                }
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Error al registrar bienes del dictamen.");
        }
    };

    // Se renderiza
    if (mostrarHardware) {
        return <Hardware />;
    }

    return (
        <div className="sesion-form">
            {/* Paso 1 */}
            {!registroOk && !paso3Activo && (
                <form onSubmit={handleContinuar}>

                    <InputGenerico
                        value={baja}
                        setValue={setBaja}
                        label="Número de baja"
                        maxLength={20}
                        allowedChars="0-9A-Z /_\-"
                        placeholder="2026/01"
                        title="Máximo 20 caracteres"
                    />

                    <InputGenerico
                        value={totalDictamenes}
                        setValue={setTotalDictamenes}
                        label="Total de dictámenes"
                        maxLength={2}
                        allowedChars="0-9"
                        placeholder="3"
                        title="Ingrese solo dígitos"
                    />

                    <InputGenerico
                        value={totalBienesGlobal}
                        setValue={setTotalBienesGlobal}
                        label="Total de bienes (global)"
                        maxLength={3}
                        allowedChars="0-9"
                        placeholder="10"
                        title="Ingrese solo dígitos"
                    />

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Procesando..." : "Continuar"}
                        </button>
                    </div>
                </form>
            )}

            {/* Paso 2 */}
            {registroOk && !paso3Activo && (
                <form onSubmit={handleContinuar2}>
                    {dictamenes.map((item, index) => (
                        <div key={index} className="dictamen-pair">

                            <InputGenerico
                                value={item.idDictamen}
                                setValue={(val) => handleChangeDictamen(index, "idDictamen", val)}
                                label={`Dictamen #${index + 1}`}
                                maxLength={6}
                                allowedChars="0-9"
                                placeholder="123456"
                                title="Máximo 6 dígitos"
                            />

                            <InputGenerico
                                value={item.totalBienes}
                                setValue={(val) => handleChangeDictamen(index, "totalBienes", val)}
                                label={`Total bienes dictamen #${index + 1}`}
                                maxLength={2}
                                allowedChars="0-9"
                                placeholder="10"
                                title="Máximo 2 dígitos"
                            />

                        </div>
                    ))}

                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}

                    <div className="form-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Procesando..." : "Continuar"}
                        </button>
                    </div>
                </form>
            )}

            {/* Paso 3 */}
            {paso3Activo && dictamenesPaso3.length > 0 && (
                <div>
                    <h3>
                        Seleccione los bienes del dictamen {dictamenesPaso3[dictamenActual].id_dictamen}
                    </h3>
                    <ul>
                        {bienesDisponibles.map(b => (
                            <li key={b.serie_bien}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={seleccionados.includes(b.serie_bien)}
                                        onChange={() => toggleSeleccion(b.serie_bien)}
                                        disabled={
                                            !seleccionados.includes(b.serie_bien) &&
                                            seleccionados.length >= dictamenesPaso3[dictamenActual].cant_bienes
                                        }
                                    />
                                    {b.serie_bien}
                                </label>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={handleContinuarDictamen}
                    >
                        Continuar
                    </button>
                    {error && <div className="error">{error}</div>}
                    {success && <div className="success">{success}</div>}
                </div>
            )}
        </div>
    );
}

export default CrearBajas;
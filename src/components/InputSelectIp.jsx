import React, { useState, useEffect, useMemo } from "react";

function InputSelectIp({ idIp, setIdIp, ipActualText, label = "IP disponible" }) {
    const [ipsDisponibles, setIpsDisponibles] = useState([]);

    useEffect(() => {
        fetch("http://localhost/sigbi_712/api/consultar_ips_disponibles.php", { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setIpsDisponibles(data); // [{id_ip, ip}]
                }
            })
            .catch(() => console.error("Error al cargar IPs disponibles"));
    }, []);

    // Si la IP actual no está en la lista de disponibles, la agregamos para poder seleccionarla.
    const opciones = useMemo(() => {
        const lista = [...ipsDisponibles];
        if (idIp !== null && idIp !== undefined) {
            const existe = lista.some(item => item.id_ip === idIp);
            if (!existe && ipActualText) {
                lista.unshift({ id_ip: idIp, ip: ipActualText }); // insertar al inicio
            }
        }
        return lista;
    }, [ipsDisponibles, idIp, ipActualText]);

    return (
        <div className="form-group">
            <label>{label}</label>
            <select
                className="input"
                value={idIp !== null && idIp !== undefined ? idIp.toString() : ""}
                onChange={(e) => {
                    const value = e.target.value;
                    setIdIp(value ? parseInt(value, 10) : null);
                }}
            >
                <option value="">Selecciona una IP</option>
                {opciones.map(ipObj => (
                    <option key={ipObj.id_ip} value={ipObj.id_ip.toString()}>
                        {ipObj.ip}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default InputSelectIp;
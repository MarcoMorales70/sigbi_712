import { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import "../styles/Login.css";

function Login() {
    const { setPermiso, cargarTecnico } = useContext(AppContext);

    const [empleado, setEmpleado] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");

    const manejarSubmit = async (e) => {
        e.preventDefault();

        // ✅ Validación del No. de empleado
        if (!/^\d{7}$/.test(empleado)) {
            setMensaje("El número de empleado debe tener exactamente 7 dígitos");
            return;
        }

        if (!password) {
            setMensaje("Ingrese su contraseña");
            return;
        }

        try {
            const response = await fetch("http://localhost/api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    empleado: empleado,
                    password: password
                })
            });

            const data = await response.json();

            if (data.error) {
                setMensaje(data.error);
                return;
            }

            // ✅ Login correcto
            setMensaje("");

            // ✅ Cargar datos completos del técnico
            await cargarTecnico(data.id_tecnico);

            // ✅ Cambiar al permiso inicial del módulo del técnico
            setPermiso(data.id_permiso_inicial);

        } catch (error) {
            setMensaje("Error al conectar con el servidor");
        }
    };

    return (
        <div className="login-contenedor">
            <h2>Iniciar Sesión</h2>

            <form className="login-form" onSubmit={manejarSubmit}>

                {/* ✅ Campo No. de empleado con tooltip */}
                <label>
                    No. de empleado
                    <span className="tooltip">Debe contener exactamente 7 dígitos</span>
                </label>
                <input
                    type="text"
                    maxLength="7"
                    value={empleado}
                    onChange={(e) => setEmpleado(e.target.value.replace(/\D/g, ""))}
                    placeholder="Ej. 1234567"
                />

                {/* ✅ Campo contraseña con tooltip */}
                <label>
                    Contraseña
                    <span className="tooltip">Ingrese su contraseña institucional</span>
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                />

                {mensaje && <p className="login-error">{mensaje}</p>}

                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
}

export default Login;
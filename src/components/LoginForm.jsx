import '../styles/LoginForm.css';

function LoginForm() {
    return (
        <div className="login-form">
            <h2>Iniciar sesión</h2>

            <form>
                <div className="form-group">
                    <label htmlFor="usuario">Usuario</label>
                    <input
                        type="text"
                        id="usuario"
                        name="usuario"
                        placeholder="Ingresa tu usuario"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Ingresa tu contraseña"
                    />
                </div>

                <button type="submit">
                    Entrar
                </button>
            </form>
        </div>
    );
}

export default LoginForm;
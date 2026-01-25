import { useGlobal } from "../context/ContenedorGlobal";

function ConsultarBitacora() {

    const { identidad, subModuloActual, setSubModuloActual, logout } = useGlobal();

    return (
        <div>
            <p>Texto de prueba desde dentro del componente ConsultarBitacora.jsx</p>
        </div>
    );
}

export default ConsultarBitacora;
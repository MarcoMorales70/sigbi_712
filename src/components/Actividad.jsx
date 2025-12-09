import '../styles/Actividad.css';

function Actividad({ accion }) {
    if (!accion) return <h2 className='actividad'>Sistema de Gestión de Bienes Informáticos</h2>;

    return (
        <h2 className="actividad">
            {accion}
        </h2>
    );
}

export default Actividad;




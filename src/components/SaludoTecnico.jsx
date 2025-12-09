import '../styles/SaludoTecnico.css';

function SaludoTecnico({ usuario, aPaterno }) {
    if (!usuario || !aPaterno) return null;
    return (
        <h3 className="saludo">
            Hola: {usuario} {aPaterno}
        </h3>
    );
}

export default SaludoTecnico;
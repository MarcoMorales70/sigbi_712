
import '../styles/TituloModulo.css';

function TituloModulo({ categoria }) {
    if (!categoria) return <h2 className='titulo-modulo'>Página Principal</h2>;

    return (
        <h2 className="titulo-modulo">
            Modulo: {categoria}
        </h2>
    );
}

export default TituloModulo;


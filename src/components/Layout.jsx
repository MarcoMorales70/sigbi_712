import '../styles/Layout.css';

import '../styles/Header1.css';
import '../styles/Header2.css';
import '../styles/Header3.css';
import '../styles/Main.css';

import { useGlobal } from "../context/ContenedorGlobal";

import TituloSistema from './TituloSistema';
import Logo from './Logo';
import TituloModulo from './TituloModulo';
import NomDirGen from './NomDirGen';
import NomArea from './NomArea';
import Actividad from './Actividad';
import NomDirAdm from './NomDirAdm';
import Footer from './Footer';
import Main from './Main';
import Sidebar from './Sidebar';
import SaludoTecnico from './SaludoTecnico';



function Layout({ children }) {

    const { identidad, moduloActual } = useGlobal();

    return (
        <div className="layout">

            {/* ENCABEZADO */}
            <header>
                <div className='header1'><TituloSistema /></div>

                <div className='header2'>
                    <div><Logo /></div>
                    <div><TituloModulo modulo={moduloActual} /></div> {/* Componente dinámico */}
                    <div><NomDirGen /></div>
                </div>

                <div className='header3'>
                    <div><NomArea /></div>
                    <div><Actividad modulo={moduloActual} /></div> {/* Componente dinámico */}
                    <div><NomDirAdm /></div>
                </div>
                <div><SaludoTecnico /></div>
            </header>

            {/* CONTENEDOR PRINCIPAL: SIDEBAR + MAIN */}
            <div className="contenido">


                <Sidebar />

                <main className="main">
                    <Main>

                        {children}
                    </Main>
                </main>
            </div>

            {/* PIE DE PÁGINA */}
            <footer className='footer'>
                <Footer />
            </footer>
        </div>
    );
}

export default Layout;
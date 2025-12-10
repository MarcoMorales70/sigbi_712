
import '../styles/Layout.css';

import '../styles/Header1.css';
import '../styles/Header2.css';
import '../styles/Header3.css';
import '../styles/Main.css';

import { useContext } from "react";
import { AppContext } from "../context/AppContext";

import TituloSistema from './TituloSistema';
import Logo from './Logo';
import TituloModulo from './TituloModulo';
import NomDirGen from './NomDirGen';
import NomArea from './NomArea';
import Actividad from './Actividad';
import NomDirAdm from './NomDirAdm';
import Footer from './Footer';
import Main from './Main';



function Layout({ children }) {

    console.log(" Mensaje de prueba ---- Layout se está renderizando");

    const { categoria, accion, usuario, aPaterno, tecnico, loading, error } = useContext(AppContext);
    console.log(" Mensaje de prueba ---- Datos del técnico:", tecnico);

    return (
        <div className="layout">

            <header>
                <div className='header1'><TituloSistema /></div>

                <div className='header2'>
                    <div><Logo /></div>
                    <div><TituloModulo categoria={categoria} /></div>
                    <div><NomDirGen /></div>
                </div>

                <div className='header3'>
                    <div><NomArea /></div>
                    <div><Actividad accion={accion} /></div>
                    <div><NomDirAdm /></div>
                </div>
            </header>

            <Main>
                {children}
            </Main>

            <footer className='footer'>
                <Footer />
            </footer>
        </div>
    );
}

export default Layout;



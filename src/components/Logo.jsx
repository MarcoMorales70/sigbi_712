import '../styles/Logo.css';
import LogoSICT from '../assets/logo_sict.png';

function Logo() {
    return (
        <img src={LogoSICT} alt="Logo institucional SICT" className="logo" />
    )
}

export default Logo;
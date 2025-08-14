import { Calendar, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react"
import "./Footer.css"

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <a href="/" className="footer-logo">
                            <Calendar className="footer-brand-icon" />
                            <span className="footer-brand-text">EventosCR</span>
                        </a>
                        <p className="footer-description">
                            La plataforma líder en Costa Rica para descubrir y crear eventos incre��bles. Conectamos personas con
                            experiencias únicas y memorables en todo el país.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <Facebook className="social-icon" />
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <Twitter className="social-icon" />
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <Instagram className="social-icon" />
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <Linkedin className="social-icon" />
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3>Eventos</h3>
                        <div className="footer-links">
                            <a href="/" className="footer-link">
                                Explorar Eventos
                            </a>
                            <a href="/crear-evento" className="footer-link">
                                Crear Evento
                            </a>
                            <a href="/categorias" className="footer-link">
                                Categorías
                            </a>
                            <a href="/ubicaciones" className="footer-link">
                                Ubicaciones
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3>Cuenta</h3>
                        <div className="footer-links">
                            <a href="/login" className="footer-link">
                                Iniciar Sesión
                            </a>
                            <a href="/register" className="footer-link">
                                Registrarse
                            </a>
                            <a href="/perfil" className="footer-link">
                                Mi Perfil
                            </a>
                            <a href="/mis-boletos" className="footer-link">
                                Mis Boletos
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3>Contacto</h3>
                        <div className="footer-links">
                            <div className="footer-contact-item">
                                <Mail className="contact-icon" />
                                <span>info@eventoscr.com</span>
                            </div>
                            <div className="footer-contact-item">
                                <Phone className="contact-icon" />
                                <span>+506 2000-0000</span>
                            </div>
                            <div className="footer-contact-item">
                                <MapPin className="contact-icon" />
                                <span>San José, Costa Rica</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        &copy; {new Date().getFullYear()} EventosCR. Todos los derechos reservados.
                    </p>
                    <div className="footer-legal">
                        <a href="/privacidad" className="footer-link">
                            Política de Privacidad
                        </a>
                        <a href="/terminos" className="footer-link">
                            Términos de Servicio
                        </a>
                        <a href="/cookies" className="footer-link">
                            Política de Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer

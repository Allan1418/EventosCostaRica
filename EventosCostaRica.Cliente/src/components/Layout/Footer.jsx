import { Calendar } from "lucide-react"
import "./Footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Calendar className="footer-brand-icon" />
          <span className="footer-brand-text">Eventos Costa Rica</span>
        </div>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} Eventos Costa Rica. Todos los derechos reservados.
        </p>
        <div className="footer-links">
          <a href="#" className="footer-link">
            Política de Privacidad
          </a>
          <a href="#" className="footer-link">
            Términos de Servicio
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer

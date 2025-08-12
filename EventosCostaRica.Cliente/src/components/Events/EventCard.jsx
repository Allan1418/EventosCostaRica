import { Link } from "react-router-dom"
import { Calendar, MapPin, ShoppingCart } from "lucide-react"
import "./EventCard.css"

const EventCard = ({ evento }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-CR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    return (
        <div className="event-card">
            <div className="event-card-image-placeholder">
                {/* Placeholder for banner image */}
                <span className="event-card-image-text">{evento.name}</span>
            </div>
            <div className="event-card-content">
                <h3 className="event-card-title">{evento.name}</h3>
                <p className="event-card-description">{evento.descrp}</p>
                <div className="event-card-details">
                    <div className="event-card-detail-item">
                        <Calendar className="event-card-icon" />
                        <span>{formatDate(evento.eventoDate)}</span>
                    </div>
                    <div className="event-card-detail-item">
                        <MapPin className="event-card-icon" />
                        <span>{evento.location}</span>
                    </div>
                </div>
                <div className="event-card-footer">
                    <span className="event-card-price">₡{evento.precio?.toLocaleString()}</span>
                    <div className="event-card-buttons">
                        <Link to={`/evento/${evento.id}`} className="event-card-button event-card-button-secondary">
                            Ver Detalles
                        </Link>
                        <Link to={`/comprar-ticket/${evento.id}`} className="event-card-button event-card-button-primary">
                            <ShoppingCart className="event-card-button-icon" />
                            Comprar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EventCard

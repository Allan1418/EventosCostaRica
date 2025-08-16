"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useRoles } from "../../hooks/useRoles"
import { Calendar, MapPin, Clock, Users, Edit, Eye, MoreVertical } from "lucide-react"
import "./EventCard.css"

const EventCard = ({ event }) => {
    const { isAuthenticated } = useAuth()
    const { hasPermission } = useRoles()
    const [showActions, setShowActions] = useState(false)
    const [imageError, setImageError] = useState(false)

    const canManage = hasPermission("MANAGE_EVENTS")

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString("es-CR", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
            })
        } catch (error) {
            return "Fecha no disponible"
        }
    }

    const formatTime = (dateString) => {
        try {
            return new Date(dateString).toLocaleTimeString("es-CR", {
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Hora no disponible"
        }
    }

    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return "Sin descripción disponible"
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength).trim() + "..."
    }

    const getEventStatus = () => {
        if (!event.eventoDate) return { status: "unknown", label: "Sin fecha", color: "#6b7280" }

        const now = new Date()
        const eventDate = new Date(event.eventoDate)
        const diffTime = eventDate - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
            return { status: "past", label: "Finalizado", color: "#6b7280" }
        } else if (diffDays === 0) {
            return { status: "today", label: "¡Hoy!", color: "#ef4444" }
        } else if (diffDays <= 7) {
            return { status: "soon", label: `En ${diffDays} día${diffDays > 1 ? "s" : ""}`, color: "#f59e0b" }
        } else {
            return { status: "upcoming", label: "Próximo", color: "#10b981" }
        }
    }

    const getEventColor = () => {
        const colors = [
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
            "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        ]
        const index = (event.id || 0) % colors.length
        return colors[index]
    }

    const eventStatus = getEventStatus()
    // Aplicar la nueva fórmula (x+1) * (y+1)
    const totalCapacity = ((event.rows || 10) + 1) * ((event.seatsPerRow || 15) + 1)

    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <div className="event-card">
            {/* Event Image */}
            <div className="event-card-image">
                {!imageError && event.bannerImageUrl ? (
                    <img
                        src={event.bannerImageUrl || "/placeholder.svg"}
                        alt={event.name || "Evento"}
                        className="card-image"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="card-image-placeholder" style={{ background: getEventColor() }}>
                        <Calendar size={32} />
                        <span>Evento</span>
                    </div>
                )}

                {/* Event Status Badge */}
                <div className="event-status-badge" style={{ backgroundColor: eventStatus.color }}>
                    {eventStatus.label}
                </div>

                {canManage && (
                    <div className="event-card-actions">
                        <button
                            className="actions-toggle"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowActions(!showActions)
                            }}
                        >
                            <MoreVertical size={16} />
                        </button>

                        {showActions && (
                            <div className="actions-menu">
                                <Link
                                    to={`/editar-evento/${event.id}`}
                                    className="action-item edit"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Edit size={14} />
                                    Editar Evento
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Event Content */}
            <div className="event-card-content">
                <div className="event-card-header">
                    <h3 className="event-title">{event.name || "Evento sin nombre"}</h3>
                    <p className="event-description" title={event.descrp || event.description || "Sin descripción disponible"}>
                        {truncateDescription(event.descrp || event.description)}
                    </p>
                </div>

                <div className="event-details">
                    <div className="detail-item">
                        <Calendar className="detail-icon" />
                        <div className="detail-content">
                            <span className="detail-label">Fecha</span>
                            <span className="detail-value">{formatDate(event.eventoDate)}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <Clock className="detail-icon" />
                        <div className="detail-content">
                            <span className="detail-label">Hora</span>
                            <span className="detail-value">{formatTime(event.eventoDate)}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <MapPin className="detail-icon" />
                        <div className="detail-content">
                            <span className="detail-label">Ubicación</span>
                            <span className="detail-value">{event.location || "Sin ubicación"}</span>
                        </div>
                    </div>

                    <div className="detail-item">
                        <Users className="detail-icon" />
                        <div className="detail-content">
                            <span className="detail-label">Capacidad Total</span>
                            <span className="detail-value">{totalCapacity} asientos</span>
                        </div>
                    </div>
                </div>

                <div className="event-card-footer">
                    <div className="event-price">
                        <span className="price-label">Desde</span>
                        <span className="price-value">₡15,000</span>
                    </div>

                    <Link to={`/evento/${event.id}`} className="view-event-btn">
                        <Eye size={16} />
                        Ver Evento
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default EventCard

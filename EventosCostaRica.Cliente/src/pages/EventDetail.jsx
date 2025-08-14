"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { eventService, getErrorMessage } from "../services/api"
import SeatMatrix from "../components/Events/SeatMatrix"
import {
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    ShoppingCart,
    AlertCircle,
    Loader2,
    Info,
    Star,
    Ticket,
} from "lucide-react"
import "./EventDetail.css"

const EventDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [selectedSeats, setSelectedSeats] = useState([])

    useEffect(() => {
        if (id) {
            loadEventDetails()
        }
    }, [id])

    const loadEventDetails = async () => {
        try {
            setLoading(true)
            setError("")

            const eventData = await eventService.getById(id)
            setEvent(eventData)
        } catch (error) {
            console.error("Error loading event details:", error)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handleSeatSelect = (seats) => {
        setSelectedSeats(seats)
    }

    const handlePurchase = () => {
        if (selectedSeats.length === 0) {
            alert("Por favor selecciona al menos un asiento")
            return
        }

        // Navegar a la página de compra con los asientos seleccionados
        navigate(`/comprar-boleto/${id}`, {
            state: { selectedSeats },
        })
    }

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString("es-CR", {
                weekday: "long",
                year: "numeric",
                month: "long",
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

    const getEventStatus = () => {
        if (!event?.eventoDate) return { status: "unknown", label: "Sin fecha", color: "#6b7280" }

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
        ]
        const index = (event?.id || 0) % colors.length
        return colors[index]
    }

    if (loading) {
        return (
            <div className="event-detail-container">
                <div className="event-detail-loading">
                    <Loader2 size={64} className="animate-spin loading-icon" />
                    <h3>Cargando detalles del evento</h3>
                    <p>Preparando toda la información para ti...</p>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="event-detail-container">
                <div className="event-detail-error">
                    <AlertCircle size={64} className="error-icon" />
                    <h2>Error al cargar el evento</h2>
                    <p>{error || "No se pudo encontrar el evento solicitado"}</p>
                    <div className="error-actions">
                        <button onClick={() => navigate(-1)} className="btn btn-secondary">
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                        <button onClick={loadEventDetails} className="btn btn-primary">
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Aplicar la nueva fórmula (x+1) * (y+1)
    const totalCapacity = ((event.rows || 10) + 1) * ((event.seatsPerRow || 15) + 1)
    const eventStatus = getEventStatus()

    return (
        <div className="event-detail-container">
            {/* Header */}
            <div className="event-detail-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={20} />
                    Volver
                </button>
            </div>

            {/* Hero Section */}
            <div className="event-hero-section">
                <div className="hero-image-container">
                    {event.bannerImageUrl ? (
                        <img src={event.bannerImageUrl || "/placeholder.svg"} alt={event.name} className="hero-image" />
                    ) : (
                        <div className="hero-placeholder" style={{ background: getEventColor() }}>
                            <Calendar size={64} />
                            <span>Evento</span>
                        </div>
                    )}
                    <div className="hero-overlay">
                        <div className="hero-content">
                            <div className="event-status-badge" style={{ backgroundColor: eventStatus.color }}>
                                {eventStatus.label}
                            </div>
                            <h1 className="hero-title">{event.name || "Evento sin nombre"}</h1>
                            <p className="hero-description">{event.descrp || event.description || "Sin descripción disponible"}</p>
                            <div className="hero-rating">
                                <Star size={20} fill="currentColor" />
                                <span>4.8</span>
                                <span className="rating-count">(124 reseñas)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Event Info Cards */}
            <div className="event-info-grid">
                <div className="info-card primary">
                    <div className="card-icon">
                        <Calendar size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Fecha y Hora</h3>
                        <p className="primary-text">{formatDate(event.eventoDate)}</p>
                        <p className="secondary-text">{formatTime(event.eventoDate)}</p>
                    </div>
                </div>

                <div className="info-card">
                    <div className="card-icon">
                        <MapPin size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Ubicación</h3>
                        <p className="primary-text">{event.location || "Sin ubicación"}</p>
                        <p className="secondary-text">Ver en mapa</p>
                    </div>
                </div>

                <div className="info-card">
                    <div className="card-icon">
                        <Users size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Capacidad</h3>
                        <p className="primary-text">{totalCapacity} asientos</p>
                    </div>
                </div>

                <div className="info-card">
                    <div className="card-icon">
                        <Ticket size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Precio</h3>
                        <p className="primary-text">₡15,000</p>
                        <p className="secondary-text">Por asiento</p>
                    </div>
                </div>
            </div>

            {/* Seat Selection */}
            {isAuthenticated ? (
                <div className="seat-selection-section">
                    <div className="section-header">
                        <h2>Selecciona tus asientos</h2>
                        <p>Elige los mejores asientos para disfrutar del evento</p>
                    </div>

                    <SeatMatrix
                        eventoId={id}
                        onSeatSelect={handleSeatSelect}
                        selectedSeats={selectedSeats}
                        isAdminMode={false}
                        isEditing={false}
                    />

                    {selectedSeats.length > 0 && (
                        <div className="purchase-summary">
                            <div className="summary-header">
                                <h3>Resumen de Compra</h3>
                                <div className="selected-count">{selectedSeats.length} asientos seleccionados</div>
                            </div>

                            <div className="selected-seats-grid">
                                {selectedSeats.map((seat, index) => (
                                    <div key={index} className="seat-chip">
                                        <span className="seat-position">
                                            Fila {seat.row + 1}, Asiento {seat.column + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="price-breakdown">
                                <div className="price-line">
                                    <span>Precio por asiento:</span>
                                    <span>₡15,000</span>
                                </div>
                                <div className="price-line">
                                    <span>Cantidad:</span>
                                    <span>{selectedSeats.length}</span>
                                </div>
                                <div className="price-line total">
                                    <span>Total:</span>
                                    <span>₡{(selectedSeats.length * 15000).toLocaleString()}</span>
                                </div>
                            </div>

                            <button onClick={handlePurchase} className="purchase-btn">
                                <ShoppingCart size={20} />
                                Comprar Boletos
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="login-prompt">
                    <div className="prompt-content">
                        <Info size={48} className="prompt-icon" />
                        <h3>Inicia sesión para comprar boletos</h3>
                        <p>Necesitas una cuenta para seleccionar asientos y comprar boletos para este evento</p>
                        <div className="prompt-actions">
                            <button onClick={() => navigate("/login")} className="btn btn-primary">
                                Iniciar Sesión
                            </button>
                            <button onClick={() => navigate("/register")} className="btn btn-secondary">
                                Crear Cuenta
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EventDetail

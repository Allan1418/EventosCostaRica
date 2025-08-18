"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useRoles } from "../hooks/useRoles"
import { eventService, getErrorMessage } from "../services/api"
import SeatMatrix from "../components/Events/SeatMatrix"
import { Calendar, MapPin, Users, ArrowLeft, ShoppingCart, AlertCircle, Loader2, Info, Ticket } from "lucide-react"
import "./EventDetail.css"

const EventDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const { hasRole } = useRoles()

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
        if (!event?.eventoDate)
            return { status: "unknown", label: "Sin fecha", className: "status-badge bg-gray-100 text-gray-600" }

        const now = new Date()
        const eventDate = new Date(event.eventoDate)
        const diffTime = eventDate - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
            return { status: "past", label: "Finalizado", className: "status-badge bg-gray-100 text-gray-600" }
        } else if (diffDays === 0) {
            return { status: "today", label: "¡Hoy!", className: "status-badge bg-red-100 text-red-700" }
        } else if (diffDays <= 7) {
            return {
                status: "soon",
                label: `En ${diffDays} día${diffDays > 1 ? "s" : ""}`,
                className: "status-badge bg-yellow-100 text-yellow-700",
            }
        } else {
            return { status: "upcoming", label: "Próximo", className: "status-badge bg-green-100 text-green-700" }
        }
    }

    if (loading) {
        return (
            <div className="event-detail-page">
                <div className="event-detail-content">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                        <div style={{ textAlign: "center" }}>
                            <Loader2
                                className="animate-spin"
                                style={{ width: "48px", height: "48px", color: "#3b82f6", margin: "0 auto 16px" }}
                            />
                            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", margin: "0 0 8px 0" }}>
                                Cargando evento
                            </h3>
                            <p style={{ color: "#64748b", margin: "0" }}>Preparando información...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="event-detail-page">
                <div className="event-detail-content">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                        <div
                            style={{
                                background: "white",
                                padding: "32px",
                                borderRadius: "12px",
                                textAlign: "center",
                                maxWidth: "400px",
                                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            <AlertCircle style={{ width: "48px", height: "48px", color: "#ef4444", margin: "0 auto 16px" }} />
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e293b", margin: "0 0 8px 0" }}>
                                Error al cargar
                            </h2>
                            <p style={{ color: "#64748b", margin: "0 0 24px 0" }}>{error || "Evento no encontrado"}</p>
                            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                                <button onClick={() => navigate(-1)} className="back-button">
                                    <ArrowLeft style={{ width: "16px", height: "16px" }} />
                                    Volver
                                </button>
                                <button
                                    onClick={loadEventDetails}
                                    style={{
                                        padding: "12px 20px",
                                        background: "#3b82f6",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const totalCapacity = ((event.rows || 10) + 1) * ((event.seatsPerRow || 15) + 1)
    const eventStatus = getEventStatus()

    return (
        <div className="event-detail-page">
            <div className="event-detail-content">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft style={{ width: "16px", height: "16px" }} />
                    Volver
                </button>

                <div className="event-header-container">
                    <div className="event-header">
                        <div className="event-image">
                            {event.bannerImageUrl ? (
                                <img src={event.bannerImageUrl || "/placeholder.svg"} alt={event.name} />
                            ) : (
                                <div className="image-placeholder">
                                    <Calendar style={{ width: "48px", height: "48px" }} />
                                    <span>Sin imagen</span>
                                </div>
                            )}
                            <div className={eventStatus.className}>{eventStatus.label}</div>
                        </div>

                        <div className="event-info">
                            <div className="event-title-section">
                                <h1>{event.name || "Evento sin nombre"}</h1>
                                <div className="event-meta">
                                    <span className="event-category">Evento Cultural</span>
                                    <span className="event-organizer">Organizado por EventosCR</span>
                                </div>
                            </div>

                            <p className="event-description">{event.descrp || event.description || "Sin descripción disponible"}</p>

                            <div className="event-details-grid">
                                <div className="detail-card">
                                    <div className="detail-icon">
                                        <Calendar style={{ width: "20px", height: "20px" }} />
                                    </div>
                                    <div className="detail-content">
                                        <div className="detail-label">Fecha y Hora</div>
                                        <div className="detail-value">
                                            {formatDate(event.eventoDate)} - {formatTime(event.eventoDate)}
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <div className="detail-icon">
                                        <MapPin style={{ width: "20px", height: "20px" }} />
                                    </div>
                                    <div className="detail-content">
                                        <div className="detail-label">Ubicación</div>
                                        <div className="detail-value">{event.location || "Sin ubicación"}</div>
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <div className="detail-icon">
                                        <Users style={{ width: "20px", height: "20px" }} />
                                    </div>
                                    <div className="detail-content">
                                        <div className="detail-label">Capacidad</div>
                                        <div className="detail-value">{totalCapacity} asientos</div>
                                    </div>
                                </div>

                                <div className="detail-card">
                                    <div className="detail-icon">
                                        <Ticket style={{ width: "20px", height: "20px" }} />
                                    </div>
                                    <div className="detail-content">
                                        <div className="detail-label">Precio</div>
                                        <div className="detail-value">₡15,000</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isAuthenticated ? (
                    <div className="seat-selection-layout">
                        {/* Matrix Section */}
                        <div className="matrix-section">
                            <div className="matrix-header">
                                <div className="matrix-title">
                                    <h3>Selección de Asientos</h3>
                                    <div className="matrix-subtitle">
                                        <Info style={{ width: "16px", height: "16px" }} />
                                        <span>Haz clic en los asientos disponibles para seleccionarlos</span>
                                    </div>
                                </div>
                            </div>
                            <div className="matrix-wrapper">
                                <SeatMatrix
                                    eventoId={id}
                                    onSeatSelect={handleSeatSelect}
                                    selectedSeats={selectedSeats}
                                    isAdminMode={hasRole("ADMIN")}
                                    isEditing={false}
                                />
                            </div>
                        </div>

                        {/* Purchase Section */}
                        <div className="purchase-section">
                            <div className="purchase-card">
                                <div className="card-header">
                                    <div className="card-title">
                                        <h3>Resumen de Compra</h3>
                                        <div className="card-subtitle">Revisa tu selección</div>
                                    </div>
                                    {selectedSeats.length > 0 && (
                                        <div className="selected-count">
                                            <span>{selectedSeats.length}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="card-content">
                                    {selectedSeats.length > 0 ? (
                                        <>
                                            <div className="selected-seats">
                                                {selectedSeats.map((seat, index) => (
                                                    <div key={index} className="seat-item">
                                                        <div className="seat-number">{(seat.row + 1) * (seat.column + 1)}</div>
                                                        <div className="seat-info">
                                                            <div className="seat-position">
                                                                Fila {seat.row + 1}, Columna {seat.column + 1}
                                                            </div>
                                                            <div className="seat-price">₡15,000</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="price-summary">
                                                <div className="price-line">
                                                    <span>Cantidad:</span>
                                                    <span>
                                                        {selectedSeats.length} asiento{selectedSeats.length > 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                                <div className="price-line">
                                                    <span>Precio unitario:</span>
                                                    <span>₡15,000</span>
                                                </div>
                                                <div className="price-line total">
                                                    <span>Total:</span>
                                                    <span>₡{(selectedSeats.length * 15000).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <button onClick={handlePurchase} className="purchase-button">
                                                <ShoppingCart style={{ width: "16px", height: "16px" }} />
                                                Comprar Boletos
                                            </button>
                                        </>
                                    ) : (
                                        <div className="empty-state">
                                            <div className="empty-icon">
                                                <Ticket style={{ width: "48px", height: "48px" }} />
                                            </div>
                                            <h4>Selecciona asientos</h4>
                                            <p>Haz clic en los asientos disponibles para comenzar tu compra</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            background: "white",
                            padding: "32px",
                            borderRadius: "12px",
                            textAlign: "center",
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <Info style={{ width: "48px", height: "48px", color: "#3b82f6", margin: "0 auto 16px" }} />
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", margin: "0 0 8px 0" }}>
                            Inicia sesión para comprar
                        </h3>
                        <p style={{ color: "#64748b", margin: "0 0 24px 0" }}>Necesitas una cuenta para comprar boletos</p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                onClick={() => navigate("/login")}
                                style={{
                                    padding: "12px 24px",
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                }}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={() => navigate("/register")}
                                style={{
                                    padding: "12px 24px",
                                    background: "#f8fafc",
                                    color: "#64748b",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "8px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                }}
                            >
                                Crear Cuenta
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EventDetail

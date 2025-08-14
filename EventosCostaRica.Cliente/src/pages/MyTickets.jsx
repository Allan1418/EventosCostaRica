"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import { ticketService, getErrorMessage } from "../services/api"
import { Ticket, Calendar, MapPin, Clock, RefreshCw, ArrowLeft, Star, AlertCircle } from "lucide-react"
import "./MyTickets.css"

const MyTickets = () => {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [refreshing, setRefreshing] = useState(false)

    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }
        loadTickets()
    }, [isAuthenticated, navigate])

    const loadTickets = async () => {
        try {
            setLoading(true)
            setError("")
            const ticketsData = await ticketService.getMyTickets()
            setTickets(ticketsData || [])
        } catch (error) {
            console.error("Error loading tickets:", error)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        try {
            setRefreshing(true)
            await loadTickets()
        } catch (error) {
            console.error("Error refreshing tickets:", error)
        } finally {
            setRefreshing(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Fecha no disponible"

        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("es-CR", {
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
        if (!dateString) return "Hora no disponible"

        try {
            const date = new Date(dateString)
            return date.toLocaleTimeString("es-CR", {
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Hora no disponible"
        }
    }

    const formatPrice = (price) => {
        if (!price) return "₡15,000"
        return new Intl.NumberFormat("es-CR", {
            style: "currency",
            currency: "CRC",
            minimumFractionDigits: 0,
        }).format(price)
    }

    const getEventStatus = (eventDate) => {
        if (!eventDate) return { status: "unknown", label: "Estado desconocido", color: "#6b7280" }

        try {
            const now = new Date()
            const eventDateTime = new Date(eventDate)
            const diffTime = eventDateTime - now
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays < 0) {
                return { status: "past", label: "Evento Pasado", color: "#6b7280" }
            } else if (diffDays === 0) {
                return { status: "today", label: "¡Hoy!", color: "#ef4444" }
            } else if (diffDays <= 7) {
                return { status: "soon", label: `En ${diffDays} día(s)`, color: "#f59e0b" }
            } else {
                return { status: "upcoming", label: "Próximo", color: "#10b981" }
            }
        } catch (error) {
            return { status: "unknown", label: "Estado desconocido", color: "#6b7280" }
        }
    }

    if (loading) {
        return (
            <div className="my-tickets-container">
                <div className="my-tickets-loading">
                    <div className="loading"></div>
                    <p>Cargando tus boletos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="my-tickets-container">
            <div className="my-tickets-header">
                <div className="header-content">
                    <button onClick={() => navigate("/")} className="btn btn-secondary btn-sm">
                        <ArrowLeft className="button-icon" />
                        Volver al Inicio
                    </button>
                    <div className="header-info">
                        <h1 className="my-tickets-title">
                            <Ticket className="title-icon" />
                            Mis Boletos
                        </h1>
                        <p className="my-tickets-subtitle">
                            Aquí puedes ver todos tus boletos comprados y la información de los eventos
                        </p>
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={handleRefresh} disabled={refreshing} className="btn btn-outline">
                        <RefreshCw className={`button-icon ${refreshing ? "animate-spin" : ""}`} />
                        Actualizar
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle className="alert-icon" />
                    <div className="alert-content">
                        <h4>Error</h4>
                        <p>{error}</p>
                        <button onClick={loadTickets} className="btn btn-sm btn-secondary">
                            Reintentar
                        </button>
                    </div>
                </div>
            )}

            {tickets.length === 0 ? (
                <div className="no-tickets">
                    <div className="no-tickets-content">
                        <Ticket className="no-tickets-icon" />
                        <h2>No tienes boletos aún</h2>
                        <p>¡Explora nuestros increíbles eventos y compra tu primer boleto!</p>
                        <div className="no-tickets-actions">
                            <Link to="/" className="btn btn-primary">
                                <Star className="button-icon" />
                                Explorar Eventos
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="tickets-summary">
                        <div className="summary-stats">
                            <div className="stat-card">
                                <div className="stat-content">
                                    <span className="stat-number">{tickets.length}</span>
                                    <span className="stat-label">Total de Boletos</span>
                                </div>
                                <Ticket className="stat-icon" />
                            </div>
                            <div className="stat-card">
                                <div className="stat-content">
                                    <span className="stat-number">
                                        {tickets.filter((t) => getEventStatus(t.evento?.eventoDate).status === "upcoming").length}
                                    </span>
                                    <span className="stat-label">Próximos Eventos</span>
                                </div>
                                <Calendar className="stat-icon" />
                            </div>
                            <div className="stat-card">
                                <div className="stat-content">
                                    <span className="stat-number">
                                        {formatPrice(tickets.reduce((total, ticket) => total + (ticket.precio || 15000), 0))}
                                    </span>
                                    <span className="stat-label">Valor Total</span>
                                </div>
                                <Star className="stat-icon" />
                            </div>
                        </div>
                    </div>

                    <div className="tickets-grid">
                        {tickets.map((ticket) => {
                            const eventStatus = getEventStatus(ticket.evento?.eventoDate)

                            return (
                                <div key={ticket.id} className="ticket-card">
                                    <div className="ticket-header">
                                        <div className="event-image">
                                            <img
                                                src={ticket.evento?.bannerImageUrl || "/placeholder.svg?height=200&width=300&query=evento"}
                                                alt={ticket.evento?.name || "Evento"}
                                                onError={(e) => {
                                                    e.target.src = "/placeholder.svg?height=200&width=300"
                                                }}
                                            />
                                            <div className="event-status" style={{ backgroundColor: eventStatus.color }}>
                                                {eventStatus.label}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ticket-content">
                                        <h3 className="event-name">{ticket.evento?.name || "Evento"}</h3>

                                        <div className="ticket-details">
                                            <div className="detail-row">
                                                <Calendar className="detail-icon" />
                                                <div className="detail-content">
                                                    <span className="detail-label">Fecha</span>
                                                    <span className="detail-value">{formatDate(ticket.evento?.eventoDate)}</span>
                                                </div>
                                            </div>

                                            <div className="detail-row">
                                                <Clock className="detail-icon" />
                                                <div className="detail-content">
                                                    <span className="detail-label">Hora</span>
                                                    <span className="detail-value">{formatTime(ticket.evento?.eventoDate)}</span>
                                                </div>
                                            </div>

                                            <div className="detail-row">
                                                <MapPin className="detail-icon" />
                                                <div className="detail-content">
                                                    <span className="detail-label">Ubicación</span>
                                                    <span className="detail-value">{ticket.evento?.location || "No disponible"}</span>
                                                </div>
                                            </div>

                                            <div className="detail-row seat-info">
                                                <Ticket className="detail-icon" />
                                                <div className="detail-content">
                                                    <span className="detail-label">Asiento</span>
                                                    <span className="detail-value seat-number">
                                                        Fila {ticket.seatRow}, Asiento {ticket.seatColumn}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="detail-row price-info">
                                                <div className="detail-content">
                                                    <span className="detail-label">Precio</span>
                                                    <span className="detail-value price">{formatPrice(ticket.precio)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ticket-actions">
                                            <Link
                                                to={`/evento/${ticket.evento?.id}`}
                                                className="btn btn-secondary"
                                                title="Ver detalles del evento"
                                            >
                                                Ver Evento
                                            </Link>
                                            <button onClick={() => window.print()} className="btn btn-primary" title="Imprimir boleto">
                                                Imprimir
                                            </button>
                                        </div>
                                    </div>

                                    <div className="ticket-footer">
                                        <div className="ticket-id">
                                            <span className="id-label">ID Boleto:</span>
                                            <span className="id-value">#{ticket.id}</span>
                                        </div>
                                        <div className="purchase-date">
                                            <span className="purchase-label">Comprado:</span>
                                            <span className="purchase-value">{formatDate(ticket.purchaseDate)}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

export default MyTickets

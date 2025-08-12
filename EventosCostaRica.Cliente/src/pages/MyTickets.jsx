"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { boletosAPI } from "../services/api"
import { Calendar, MapPin, Clock, Ticket } from "lucide-react"
import "./MyTickets.css"

const MyTickets = () => {
    const { user } = useAuth()
    const [boletos, setBoletos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (user) {
            loadBoletos()
        } else {
            setLoading(false)
        }
    }, [user])

    const loadBoletos = async () => {
        try {
            const response = await boletosAPI.getMisBoletos()
            setBoletos(response.data)
            setLoading(false)
        } catch (error) {
            console.error("Error loading tickets:", error)
            setError("Error al cargar los boletos")
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-CR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("es-CR", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "Activo":
                return "status-active"
            case "Usado":
                return "status-used"
            case "Cancelado":
                return "status-cancelled"
            default:
                return "status-default"
        }
    }

    if (loading) {
        return (
            <div className="my-tickets-loading-container">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="my-tickets-empty-container">
                <div className="my-tickets-empty-content">
                    <Ticket className="my-tickets-empty-icon" />
                    <h2 className="my-tickets-empty-title">Error al cargar boletos</h2>
                    <p className="my-tickets-empty-message">{error}</p>
                    <button onClick={loadBoletos} className="my-tickets-empty-button">
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        )
    }

    if (boletos.length === 0) {
        return (
            <div className="my-tickets-empty-container">
                <div className="my-tickets-empty-content">
                    <Ticket className="my-tickets-empty-icon" />
                    <h2 className="my-tickets-empty-title">No tienes boletos</h2>
                    <p className="my-tickets-empty-message">Cuando compres boletos para eventos, apareceran aqui.</p>
                    <a href="/" className="my-tickets-empty-button">
                        Explorar Eventos
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="my-tickets-page-container">
            <div className="my-tickets-header-section">
                <h1 className="my-tickets-main-title">Mis Boletos</h1>
                <p className="my-tickets-subtitle">Aqui puedes ver todos tus boletos comprados</p>
            </div>

            <div className="my-tickets-grid">
                {boletos.map((boleto) => (
                    <div key={boleto.id} className="ticket-card">
                        <div className="ticket-card-header">
                            <Ticket className="ticket-card-icon" />
                        </div>

                        <div className="ticket-card-content">
                            <div className="ticket-card-title-status">
                                <h3 className="ticket-card-title">{boleto.evento?.name}</h3>
                                <span className={`ticket-status-badge ${getStatusColor(boleto.estado)}`}>{boleto.estado}</span>
                            </div>

                            <div className="ticket-card-details">
                                <div className="ticket-card-detail-item">
                                    <Calendar className="ticket-card-detail-icon" />
                                    <span>{formatDate(boleto.evento?.eventoDate)}</span>
                                </div>

                                <div className="ticket-card-detail-item">
                                    <Clock className="ticket-card-detail-icon" />
                                    <span>{formatTime(boleto.evento?.eventoDate)}</span>
                                </div>

                                <div className="ticket-card-detail-item">
                                    <MapPin className="ticket-card-detail-icon" />
                                    <span>{boleto.evento?.location}</span>
                                </div>
                            </div>

                            <div className="ticket-seat-info">
                                <div className="ticket-seat-label">Asiento</div>
                                <div className="ticket-seat-value">
                                    Fila {boleto.seatRow}, Asiento {boleto.seatColumn}
                                </div>
                            </div>

                            <div className="ticket-card-footer">
                                <div className="ticket-price">₡{boleto.precio?.toLocaleString()}</div>
                                <div className="ticket-id">#{boleto.id}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyTickets

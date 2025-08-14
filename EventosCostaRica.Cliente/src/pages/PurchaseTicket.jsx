"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { eventService, ticketService, getErrorMessage } from "../services/api"
import { ArrowLeft, Calendar, MapPin, Users, CreditCard, CheckCircle, AlertCircle, Loader2, Ticket } from "lucide-react"
import "./PurchaseTicket.css"

const PurchaseTicket = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [event, setEvent] = useState(null)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [loading, setLoading] = useState(true)
    const [purchasing, setPurchasing] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [purchasedTickets, setPurchasedTickets] = useState([])

    useEffect(() => {
        if (id) {
            loadEventDetails()
        }

        // Obtener asientos seleccionados del state de navegación
        if (location.state?.selectedSeats) {
            setSelectedSeats(location.state.selectedSeats)
        } else {
            // Si no hay asientos seleccionados, redirigir de vuelta
            navigate(`/evento/${id}`)
        }
    }, [id, location.state, navigate])

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

    const handlePurchase = async () => {
        if (selectedSeats.length === 0) {
            setError("No hay asientos seleccionados")
            return
        }

        if (!event || !event.id) {
            setError("Error: No se pudo cargar la información del evento")
            return
        }

        if (!user) {
            setError("Error: Usuario no autenticado correctamente")
            return
        }

        try {
            setPurchasing(true)
            setError("")

            console.log("=== INICIANDO PROCESO DE COMPRA ===")
            console.log("Usuario:", user)
            console.log("Evento:", event)
            console.log("Asientos seleccionados:", selectedSeats)

            const tickets = []

            for (const seat of selectedSeats) {
                console.log(`Comprando asiento: Fila ${seat.row + 1}, Columna ${seat.column + 1}`)

                // Validar datos del asiento antes de enviar
                if (seat.row === undefined || seat.row === null || seat.row < 0) {
                    throw new Error(`Fila inválida para asiento: ${seat.row}. Debe ser 0 o mayor.`)
                }
                if (seat.column === undefined || seat.column === null || seat.column < 0) {
                    throw new Error(`Columna inválida para asiento: ${seat.column}. Debe ser 0 o mayor.`)
                }

                const ticketData = {
                    eventoId: Number(event.id),
                    seatRow: Number(seat.row),
                    seatColumn: Number(seat.column),
                }

                console.log("Datos del boleto a enviar:", ticketData)
                console.log(
                    `Comprando asiento en posición [${seat.row}, ${seat.column}] (mostrado como Fila ${seat.row + 1}, Asiento ${seat.column + 1})`,
                )

                try {
                    const ticket = await ticketService.create(ticketData)
                    console.log("Boleto creado exitosamente:", ticket)

                    tickets.push({
                        ...ticket,
                        displayRow: seat.row + 1,
                        displayColumn: seat.column + 1,
                    })
                } catch (seatError) {
                    console.error(`Error comprando asiento fila ${seat.row + 1}, columna ${seat.column + 1}:`, seatError)
                    const errorMsg = getErrorMessage(seatError)
                    throw new Error(`Error en asiento Fila ${seat.row + 1}, Asiento ${seat.column + 1}: ${errorMsg}`)
                }
            }

            console.log("=== COMPRA COMPLETADA EXITOSAMENTE ===")
            console.log("Boletos comprados:", tickets)

            setPurchasedTickets(tickets)
            setSuccess(true)

            try {
                await ticketService.refreshSeatStatus(event.id)
            } catch (refreshError) {
                console.warn("No se pudo refrescar el estado de asientos:", refreshError)
            }

            // Redirigir a mis boletos después de 3 segundos
            setTimeout(() => {
                navigate("/mis-boletos")
            }, 3000)
        } catch (error) {
            console.error("=== ERROR EN PROCESO DE COMPRA ===", error)
            const errorMessage = getErrorMessage(error)
            setError(errorMessage)
        } finally {
            setPurchasing(false)
        }
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

    const totalPrice = selectedSeats.length * 15000

    if (loading) {
        return (
            <div className="purchase-container">
                <div className="purchase-loading">
                    <Loader2 size={48} className="animate-spin loading-icon" />
                    <h3>Cargando información de compra</h3>
                    <p>Preparando los detalles del evento...</p>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="purchase-container">
                <div className="purchase-success">
                    <CheckCircle size={64} className="success-icon" />
                    <h2>¡Compra exitosa!</h2>
                    <p>Tus boletos han sido comprados correctamente</p>

                    <div className="success-details">
                        <h3>Detalles de la compra:</h3>
                        <div className="purchase-info">
                            <div className="info-item">
                                <strong>Evento:</strong> {event?.name}
                            </div>
                            <div className="info-item">
                                <strong>Usuario:</strong> {user?.userName || user?.email}
                            </div>
                            <div className="info-item">
                                <strong>Fecha:</strong> {formatDate(event?.eventoDate)}
                            </div>
                        </div>

                        <h3>Boletos comprados:</h3>
                        <div className="tickets-list">
                            {purchasedTickets.map((ticket, index) => (
                                <div key={ticket.id || index} className="ticket-item">
                                    <Ticket size={20} />
                                    <span>
                                        Fila {ticket.displayRow}, Asiento {ticket.displayColumn}
                                    </span>
                                    <span className="ticket-price">₡15,000</span>
                                    <small>ID: {ticket.id}</small>
                                </div>
                            ))}
                        </div>

                        <div className="total-paid">
                            <strong>Total pagado: ₡{Math.round(totalPrice * 1.13).toLocaleString()}</strong>
                        </div>
                    </div>

                    <div className="success-actions">
                        <button onClick={() => navigate("/mis-boletos")} className="btn btn-primary">
                            Ver Mis Boletos
                        </button>
                        <button onClick={() => navigate("/")} className="btn btn-secondary">
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (error && !event) {
        return (
            <div className="purchase-container">
                <div className="purchase-error">
                    <AlertCircle size={48} className="error-icon" />
                    <h2>Error al cargar la información</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)} className="btn btn-primary">
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="purchase-container">
            {/* Header */}
            <div className="purchase-header">
                <button onClick={() => navigate(-1)} className="back-btn">
                    <ArrowLeft size={20} />
                    Volver
                </button>
                <h1>Comprar Boletos</h1>
            </div>

            <div className="purchase-content">
                {/* Event Summary */}
                <div className="event-summary">
                    <h2>Resumen del Evento</h2>

                    <div className="event-info">
                        <h3>{event?.name || "Evento sin nombre"}</h3>

                        <div className="event-details">
                            <div className="detail-item">
                                <Calendar size={16} />
                                <span>
                                    {formatDate(event?.eventoDate)} - {formatTime(event?.eventoDate)}
                                </span>
                            </div>

                            <div className="detail-item">
                                <MapPin size={16} />
                                <span>{event?.location || "Sin ubicación"}</span>
                            </div>

                            <div className="detail-item">
                                <Users size={16} />
                                <span>
                                    {selectedSeats.length} asiento{selectedSeats.length > 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Seats */}
                <div className="selected-seats-section">
                    <h2>Asientos Seleccionados</h2>

                    <div className="seats-grid">
                        {selectedSeats.map((seat, index) => (
                            <div key={index} className="seat-card">
                                <div className="seat-number">Fila {seat.row + 1}</div>
                                <div className="seat-position">Asiento {seat.column + 1}</div>
                                <div className="seat-price">₡15,000</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="payment-summary">
                    <h2>Resumen de Pago</h2>

                    <div className="price-breakdown">
                        <div className="price-line">
                            <span>Precio por asiento:</span>
                            <span>₡15,000</span>
                        </div>

                        <div className="price-line">
                            <span>Cantidad de asientos:</span>
                            <span>{selectedSeats.length}</span>
                        </div>

                        <div className="price-line subtotal">
                            <span>Subtotal:</span>
                            <span>₡{totalPrice.toLocaleString()}</span>
                        </div>

                        <div className="price-line">
                            <span>Impuestos (13%):</span>
                            <span>₡{Math.round(totalPrice * 0.13).toLocaleString()}</span>
                        </div>

                        <div className="price-line total">
                            <span>Total:</span>
                            <span>₡{Math.round(totalPrice * 1.13).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="payment-method">
                    <h2>Método de Pago</h2>

                    <div className="payment-options">
                        <div className="payment-option selected">
                            <CreditCard size={24} />
                            <div className="option-info">
                                <h3>Tarjeta de Crédito/Débito</h3>
                                <p>Pago seguro con tarjeta</p>
                            </div>
                        </div>
                    </div>

                    <div className="card-form">
                        <div className="form-group">
                            <label>Número de Tarjeta</label>
                            <input type="text" placeholder="1234 5678 9012 3456" className="form-input" />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha de Vencimiento</label>
                                <input type="text" placeholder="MM/AA" className="form-input" />
                            </div>

                            <div className="form-group">
                                <label>CVV</label>
                                <input type="text" placeholder="123" className="form-input" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Nombre en la Tarjeta</label>
                            <input type="text" placeholder="Juan Pérez" className="form-input" />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                        <button onClick={() => setError("")} className="close-btn">
                            ×
                        </button>
                    </div>
                )}

                {/* Purchase Button */}
                <div className="purchase-actions">
                    <button onClick={handlePurchase} disabled={purchasing} className="purchase-btn">
                        {purchasing ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Procesando Compra...
                            </>
                        ) : (
                            <>
                                <CreditCard size={20} />
                                Comprar Boletos - ₡{Math.round(totalPrice * 1.13).toLocaleString()}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PurchaseTicket

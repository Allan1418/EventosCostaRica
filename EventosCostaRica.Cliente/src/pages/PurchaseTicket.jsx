"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"
import { CreditCard, User, Mail, Phone, MapPin, Calendar, Clock, Ticket } from "lucide-react"
import api from "../services/api"
import "./PurchaseTicket.css"

const PurchaseTicket = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { user } = useAuth()
    const { selectedSeats, clearCart } = useCart()

    const [evento, setEvento] = useState(null)
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)

    const [purchaseData, setPurchaseData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardName: "",
    })

    useEffect(() => {
        if (!user) {
            navigate("/login")
            return
        }

        if (selectedSeats.length === 0) {
            alert("No has seleccionado asientos")
            navigate(`/event/${id}`)
            return
        }

        fetchEvento()
    }, [id, user, selectedSeats, navigate])

    const fetchEvento = async () => {
        try {
            const response = await api.get(`/evento/${id}`)
            setEvento(response.data)

            // Pre-llenar datos del usuario si están disponibles
            if (user) {
                setPurchaseData((prev) => ({
                    ...prev,
                    email: user.email || "",
                    firstName: user.firstName || "",
                    lastName: user.lastName || "",
                }))
            }
        } catch (error) {
            console.error("Error fetching event:", error)
            alert("Error al cargar el evento")
            navigate("/")
        } finally {
            setLoading(false)
        }
    }

    const calculateSeatPosition = (row, column) => {
        return (row + 1) * (column + 1)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setProcessing(true)

        try {
            // Crear boletos individuales para cada asiento seleccionado
            const boletoPromises = selectedSeats.map((seatId) => {
                const [row, column] = seatId.split("-").map(Number)
                const position = calculateSeatPosition(row - 1, column - 1)

                return api.post("/boleto", {
                    eventoId: Number.parseInt(id),
                    seatRow: row,
                    seatColumn: column,
                    precio: evento.precio || 15000,
                    // Información adicional del comprador
                    compradorNombre: `${purchaseData.firstName} ${purchaseData.lastName}`,
                    compradorEmail: purchaseData.email,
                    compradorTelefono: purchaseData.phone,
                })
            })

            const boletos = await Promise.all(boletoPromises)

            // Limpiar carrito después de compra exitosa
            clearCart()

            alert(`¡Compra realizada exitosamente! Se crearon ${boletos.length} boletos. Revisa tu email para los detalles.`)
            navigate("/my-tickets")
        } catch (error) {
            console.error("Error processing purchase:", error)
            alert("Error al procesar la compra: " + (error.response?.data?.message || error.message))
        } finally {
            setProcessing(false)
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

    const getRowLabel = (rowNumber) => {
        return String.fromCharCode(64 + rowNumber) // A, B, C, etc.
    }

    if (loading) {
        return (
            <div className="purchase-container">
                <div className="loading-spinner"></div>
                <p>Cargando información del evento...</p>
            </div>
        )
    }

    if (!evento) {
        return (
            <div className="purchase-container">
                <p>No se pudo cargar la información del evento.</p>
            </div>
        )
    }

    const totalAmount = selectedSeats.length * (evento.precio || 15000)

    return (
        <div className="purchase-container">
            <div className="purchase-header">
                <h1 className="purchase-title">Finalizar Compra</h1>
                <p className="purchase-subtitle">Completa tu informacion para adquirir tus boletos</p>
            </div>

            <div className="purchase-content">
                <div className="purchase-form-section">
                    <form onSubmit={handleSubmit} className="purchase-form">
                        <div className="form-section">
                            <h2 className="section-title">
                                <User className="section-icon" />
                                Informacion Personal
                            </h2>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        value={purchaseData.firstName}
                                        onChange={(e) => setPurchaseData({ ...purchaseData, firstName: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Apellidos</label>
                                    <input
                                        type="text"
                                        value={purchaseData.lastName}
                                        onChange={(e) => setPurchaseData({ ...purchaseData, lastName: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        <Mail className="form-icon" />
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={purchaseData.email}
                                        onChange={(e) => setPurchaseData({ ...purchaseData, email: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Phone className="form-icon" />
                                        Telefono
                                    </label>
                                    <input
                                        type="tel"
                                        value={purchaseData.phone}
                                        onChange={(e) => setPurchaseData({ ...purchaseData, phone: e.target.value })}
                                        className="form-input"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h2 className="section-title">
                                <CreditCard className="section-icon" />
                                Informacion de Pago
                            </h2>

                            <div className="form-group">
                                <label className="form-label">Nombre en la Tarjeta</label>
                                <input
                                    type="text"
                                    value={purchaseData.cardName}
                                    onChange={(e) => setPurchaseData({ ...purchaseData, cardName: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Numero de Tarjeta</label>
                                <input
                                    type="text"
                                    value={purchaseData.cardNumber}
                                    onChange={(e) => setPurchaseData({ ...purchaseData, cardNumber: e.target.value })}
                                    className="form-input"
                                    placeholder="1234 5678 9012 3456"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Fecha de Vencimiento</label>
                                    <input
                                        type="text"
                                        value={purchaseData.expiryDate}
                                        onChange={(e) => setPurchaseData({ ...purchaseData, expiryDate: e.target.value })}
                                        className="form-input"
                                        placeholder="MM/AA"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">CVV</label>
                                    <input
                                        type="text"
                                        value={purchaseData.cvv}
                                        onChange={(e) => setPurchaseData({ ...purchaseData, cvv: e.target.value })}
                                        className="form-input"
                                        placeholder="123"
                                        maxLength="3"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" className={`purchase-btn ${processing ? "processing" : ""}`} disabled={processing}>
                            {processing ? (
                                <>
                                    <div className="spinner"></div>
                                    Procesando Pago...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="btn-icon" />
                                    Pagar ₡{totalAmount.toLocaleString()}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="purchase-summary-section">
                    <div className="summary-card">
                        <h2 className="summary-title">Resumen de Compra</h2>

                        <div className="event-summary">
                            <h3 className="event-name">{evento.nombre}</h3>

                            <div className="event-details">
                                <div className="event-detail">
                                    <Calendar className="detail-icon" />
                                    <span>{formatDate(evento.fechaEvento)}</span>
                                </div>
                                <div className="event-detail">
                                    <Clock className="detail-icon" />
                                    <span>{formatTime(evento.fechaEvento)}</span>
                                </div>
                                <div className="event-detail">
                                    <MapPin className="detail-icon" />
                                    <span>{evento.ubicacion}</span>
                                </div>
                            </div>
                        </div>

                        <div className="seats-summary">
                            <h4 className="seats-title">
                                <Ticket className="seats-icon" />
                                Asientos Seleccionados
                            </h4>
                            <div className="seats-list">
                                {selectedSeats.map((seatId, index) => {
                                    const [row, column] = seatId.split("-").map(Number)
                                    const position = calculateSeatPosition(row - 1, column - 1)
                                    return (
                                        <div key={index} className="seat-item">
                                            <span className="seat-label">
                                                Fila {getRowLabel(row)}, Asiento {column} (Pos: {position})
                                            </span>
                                            <span className="seat-price">₡{(evento.precio || 15000).toLocaleString()}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="price-breakdown">
                            <div className="price-row">
                                <span>Subtotal ({selectedSeats.length} boletos)</span>
                                <span>₡{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="price-row">
                                <span>Cargos por servicio</span>
                                <span>₡0</span>
                            </div>
                            <div className="price-row total">
                                <span>Total</span>
                                <span>₡{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="security-info">
                            <div className="security-badge">
                                <CreditCard className="security-icon" />
                                <div>
                                    <div className="security-title">Pago Seguro</div>
                                    <div className="security-text">Transaccion protegida con SSL</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PurchaseTicket

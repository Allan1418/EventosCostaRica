"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { boletosAPI } from "../services/api"
import { Trash2, ShoppingBag, ArrowLeft } from "lucide-react"
import "./Cart.css"

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, getTotalPrice } = useCart()
    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }

        setLoading(true)

        try {
            // Crear boletos individuales para cada asiento
            for (const item of cartItems) {
                for (const seat of item.seats) {
                    const boletoData = {
                        eventoId: item.evento.id,
                        seatRow: seat.fila,
                        seatColumn: seat.columna,
                    }
                    await boletosAPI.create(boletoData)
                }
            }

            clearCart()
            alert("Compra realizada exitosamente!")
            navigate("/mis-boletos")
        } catch (error) {
            console.error("Error during checkout:", error)
            alert("Error al procesar la compra. Intentalo de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-CR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-empty-container">
                <div className="cart-empty-content">
                    <ShoppingBag className="cart-empty-icon" />
                    <h2 className="cart-empty-title">Tu carrito esta vacio</h2>
                    <p className="cart-empty-message">Explora nuestros eventos y agrega boletos a tu carrito.</p>
                    <button onClick={() => navigate("/")} className="cart-empty-button">
                        Ver Eventos
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-page-container">
            <div className="cart-content-wrapper">
                <button onClick={() => navigate("/")} className="cart-continue-shopping-link">
                    <ArrowLeft className="cart-continue-shopping-icon" />
                    Continuar comprando
                </button>

                <div className="cart-grid">
                    <div className="cart-items-column">
                        <div className="cart-items-card">
                            <div className="cart-items-header">
                                <h2 className="cart-items-title">
                                    Carrito de Compras ({cartItems.length} evento{cartItems.length !== 1 ? "s" : ""})
                                </h2>
                            </div>

                            <div className="cart-items-list">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item-details">
                                            <div className="cart-item-info">
                                                <h3 className="cart-item-name">{item.evento.name}</h3>

                                                <div className="cart-item-meta">
                                                    <p>{formatDate(item.evento.eventoDate)}</p>
                                                    <p>{item.evento.location}</p>
                                                </div>

                                                <div className="cart-item-seats">
                                                    <h4 className="cart-item-seats-title">Asientos seleccionados:</h4>
                                                    <div className="cart-item-seats-list">
                                                        {item.seats.map((seat, index) => (
                                                            <span key={index} className="cart-item-seat-tag">
                                                                Fila {seat.fila}, Asiento {seat.columna}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="cart-item-price-info">
                                                    <div>
                                                        <span className="cart-item-quantity-price">
                                                            {item.quantity} boleto{item.quantity !== 1 ? "s" : ""} × ₡
                                                            {item.evento.precio.toLocaleString()}
                                                        </span>
                                                        <div className="cart-item-total-price">₡{item.totalPrice.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <button onClick={() => removeFromCart(item.id)} className="cart-item-remove-button">
                                                <Trash2 className="cart-item-remove-icon" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="order-summary-column">
                        <div className="order-summary-card">
                            <h3 className="order-summary-title">Resumen del Pedido</h3>

                            <div className="order-summary-details">
                                <div className="order-summary-item">
                                    <span className="order-summary-label">Subtotal</span>
                                    <span className="order-summary-value">₡{getTotalPrice().toLocaleString()}</span>
                                </div>
                                <div className="order-summary-item">
                                    <span className="order-summary-label">Impuestos</span>
                                    <span className="order-summary-value">₡0</span>
                                </div>
                                <div className="order-summary-total-section">
                                    <div className="order-summary-total-item">
                                        <span className="order-summary-total-label">Total</span>
                                        <span className="order-summary-total-value">₡{getTotalPrice().toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleCheckout} className="order-summary-checkout-button" disabled={loading}>
                                {loading ? "Procesando..." : "Proceder al Pago"}
                            </button>

                            <button onClick={clearCart} className="order-summary-clear-cart-button" disabled={loading}>
                                Vaciar Carrito
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart

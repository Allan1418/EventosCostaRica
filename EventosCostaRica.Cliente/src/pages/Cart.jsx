"use client"

import { Link } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { ShoppingCart, Trash2, Calendar, MapPin, CreditCard } from "lucide-react"
import "./Cart.css"

const Cart = () => {
    const { cartItems, removeFromCart, clearCart, getTotalItems, getTotalPrice, getItemsByEvent } = useCart()

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-CR", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString("es-CR", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleRemoveItem = (itemId) => {
        removeFromCart(itemId)
    }

    const handleClearCart = () => {
        if (window.confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
            clearCart()
        }
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-container">
                <div className="cart-empty">
                    <ShoppingCart className="cart-empty-icon" />
                    <h2 className="cart-empty-title">Tu carrito está vacío</h2>
                    <p className="cart-empty-message">Explora nuestros eventos y agrega boletos a tu carrito</p>
                    <Link to="/" className="cart-empty-button">
                        Ver Eventos
                    </Link>
                </div>
            </div>
        )
    }

    const eventGroups = getItemsByEvent()

    return (
        <div className="cart-container">
            <div className="cart-header">
                <h1 className="cart-title">
                    <ShoppingCart className="cart-title-icon" />
                    Carrito de Compras
                </h1>
                <div className="cart-summary">
                    <span className="cart-items-count">{getTotalItems()} artículo(s)</span>
                    <button onClick={handleClearCart} className="cart-clear-button">
                        <Trash2 className="cart-clear-icon" />
                        Vaciar Carrito
                    </button>
                </div>
            </div>

            <div className="cart-content">
                <div className="cart-items">
                    {eventGroups.map((group) => (
                        <div key={group.evento.id} className="cart-event-group">
                            <div className="cart-event-header">
                                <h3 className="cart-event-name">{group.evento.name}</h3>
                                <div className="cart-event-details">
                                    <div className="cart-event-detail">
                                        <Calendar className="cart-event-detail-icon" />
                                        <span>{formatDate(group.evento.eventoDate)}</span>
                                    </div>
                                    <div className="cart-event-detail">
                                        <MapPin className="cart-event-detail-icon" />
                                        <span>{group.evento.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="cart-event-items">
                                {group.items.map((item) => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item-info">
                                            <div className="cart-item-seat">
                                                Fila {item.fila}, Asiento {item.columna}
                                            </div>
                                            <div className="cart-item-time">{formatTime(item.eventoDate)}</div>
                                        </div>
                                        <div className="cart-item-price">₡{item.precio.toLocaleString()}</div>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="cart-item-remove"
                                            title="Eliminar del carrito"
                                        >
                                            <Trash2 className="cart-item-remove-icon" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="cart-sidebar">
                    <div className="cart-total-card">
                        <h3 className="cart-total-title">Resumen del Pedido</h3>

                        <div className="cart-total-details">
                            <div className="cart-total-line">
                                <span>Subtotal ({getTotalItems()} artículos)</span>
                                <span>₡{getTotalPrice().toLocaleString()}</span>
                            </div>
                            <div className="cart-total-line">
                                <span>Impuestos</span>
                                <span>₡0</span>
                            </div>
                            <div className="cart-total-line cart-total-final">
                                <span>Total</span>
                                <span>₡{getTotalPrice().toLocaleString()}</span>
                            </div>
                        </div>

                        <button className="cart-checkout-button">
                            <CreditCard className="cart-checkout-icon" />
                            Proceder al Pago
                        </button>

                        <Link to="/" className="cart-continue-shopping">
                            Continuar Comprando
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Cart

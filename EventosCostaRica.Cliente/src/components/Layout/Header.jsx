"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"
import { ShoppingCart, LogOut, Calendar, Menu, X, Plus } from "lucide-react"
import { useState } from "react"
import "./Header.css"

const Header = () => {
    const { user, logout, isAuthenticated } = useAuth()
    const { getTotalItems } = useCart()
    const navigate = useNavigate()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        navigate("/")
    }

    return (
        <header className="header">
            <div className="header-container">
                <Link to="/" className="header-logo-link">
                    <Calendar className="header-logo-icon" />
                    <span className="header-logo-text">Eventos Costa Rica</span>
                </Link>

                <nav className="header-nav-desktop">
                    <Link to="/" className="header-nav-link">
                        Eventos
                    </Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/mis-boletos" className="header-nav-link">
                                Mis Boletos
                            </Link>
                            <Link to="/crear-evento" className="header-nav-link header-create-event-link">
                                <Plus className="header-create-icon" />
                                Crear Evento
                            </Link>
                        </>
                    )}
                </nav>

                <div className="header-actions">
                    <Link to="/carrito" className="header-cart-link">
                        <ShoppingCart className="header-cart-icon" />
                        {getTotalItems() > 0 && <span className="header-cart-badge">{getTotalItems()}</span>}
                    </Link>

                    {isAuthenticated ? (
                        <div className="header-auth-info">
                            <span className="header-user-greeting">Hola, {user?.nombre || user?.userName || user?.email}</span>
                            <button onClick={handleLogout} className="header-logout-button">
                                <LogOut className="header-logout-icon" />
                            </button>
                        </div>
                    ) : (
                        <div className="header-auth-buttons">
                            <Link to="/login" className="header-login-link">
                                Iniciar Sesion
                            </Link>
                            <Link to="/register" className="header-register-link">
                                Registrarse
                            </Link>
                        </div>
                    )}

                    <button className="header-mobile-menu-button" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? (
                            <X className="header-mobile-menu-icon" />
                        ) : (
                            <Menu className="header-mobile-menu-icon" />
                        )}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <Link to="/" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                        Eventos
                    </Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/mis-boletos" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                Mis Boletos
                            </Link>
                            <Link to="/crear-evento" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                <Plus className="header-create-icon" />
                                Crear Evento
                            </Link>
                        </>
                    )}
                    {!isAuthenticated && (
                        <>
                            <Link to="/login" className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                                Iniciar Sesion
                            </Link>
                            <Link
                                to="/register"
                                className="mobile-menu-link mobile-menu-register-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                    {isAuthenticated && (
                        <button
                            onClick={() => {
                                handleLogout()
                                setIsMobileMenuOpen(false)
                            }}
                            className="mobile-menu-link mobile-menu-logout-button"
                        >
                            Cerrar Sesion
                        </button>
                    )}
                </div>
            )}
        </header>
    )
}

export default Header

"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Menu, X, User, LogOut, Calendar, Users, Home, Sparkles, Settings, Bell } from "lucide-react"
import "./Header.css"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await logout()
            setIsMenuOpen(false)
            navigate("/")
        } catch (error) {
            console.error("Error during logout:", error)
        }
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    const getRoleDisplayName = (role) => {
        switch (role) {
            case "Admin":
                return "Administrador"
            case "Usuario":
                return "Usuario"
            default:
                return role || "Usuario"
        }
    }

    const getRoleClass = (role) => {
        switch (role) {
            case "Admin":
                return "admin"
            case "Usuario":
                return "user"
            default:
                return "user"
        }
    }

    return (
        <header className="header">
            <div className="header-container">
                {/* Mejorando el logo con gradiente y animación */}
                <Link to="/" className="header-logo" onClick={closeMenu}>
                    <div className="logo-icon">
                        <div className="logo-gradient">
                            <Sparkles className="sparkle-icon" />
                        </div>
                    </div>
                    <div className="logo-text-container">
                        <span className="logo-text">EventosCR    </span>
                        <span className="logo-subtitle">Gestión de Eventos</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    <Link to="/" className="nav-link">
                        <Home className="nav-icon" />
                        <span>Inicio</span>
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/perfil" className="nav-link">
                                <User className="nav-icon" />
                                <span>Mi Perfil</span>
                            </Link>

                            <Link to="/crear-evento" className="nav-link">
                                <Calendar className="nav-icon" />
                                <span>Crear Evento</span>
                            </Link>

                            <Link to="/usuarios" className="nav-link">
                                <Users className="nav-icon" />
                                <span>Usuarios</span>
                            </Link>

                            {/* Mejorando el menú de usuario con dropdown */}
                            <div className="user-menu">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        <div className="avatar-gradient">
                                            <User className="avatar-icon" />
                                        </div>
                                        <div className="status-indicator"></div>
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">{user?.userName || "Usuario"}</span>
                                        <span className={`user-role ${getRoleClass(user?.role)}`}>{getRoleDisplayName(user?.role)}</span>
                                    </div>
                                </div>
                                <div className="user-actions">
                                    <button onClick={handleLogout} className="logout-btn">
                                        <LogOut className="nav-icon" />
                                        <span>Salir</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-secondary">
                                Iniciar Sesión
                            </Link>
                            <Link to="/register" className="btn btn-primary">
                                Registrarse
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="mobile-nav">
                    <div className="mobile-nav-content">
                        <Link to="/" className="mobile-nav-link" onClick={closeMenu}>
                            <Home className="nav-icon" />
                            Inicio
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <div className="mobile-user-info">
                                    <div className="mobile-user-avatar">
                                        <div className="avatar-gradient">
                                            <User className="avatar-icon" />
                                        </div>
                                        <div className="status-indicator"></div>
                                    </div>
                                    <div className="mobile-user-details">
                                        <span className="mobile-user-name">{user?.userName || "Usuario"}</span>
                                        <span className={`mobile-user-role ${getRoleClass(user?.role)}`}>
                                            {getRoleDisplayName(user?.role)}
                                        </span>
                                    </div>
                                </div>

                                <Link to="/perfil" className="mobile-nav-link" onClick={closeMenu}>
                                    <User className="nav-icon" />
                                    Mi Perfil
                                </Link>

                                <Link to="/crear-evento" className="mobile-nav-link" onClick={closeMenu}>
                                    <Calendar className="nav-icon" />
                                    Crear Evento
                                </Link>

                                <Link to="/usuarios" className="mobile-nav-link" onClick={closeMenu}>
                                    <Users className="nav-icon" />
                                    Usuarios
                                </Link>

                                <button onClick={handleLogout} className="mobile-nav-link logout">
                                    <LogOut className="nav-icon" />
                                    Cerrar Sesión
                                </button>
                            </>
                        ) : (
                            <div className="mobile-auth-buttons">
                                <Link to="/login" className="btn btn-secondary" onClick={closeMenu}>
                                    Iniciar Sesión
                                </Link>
                                <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Header

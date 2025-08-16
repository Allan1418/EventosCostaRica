"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { Menu, X, User, LogOut, Calendar, Sparkles, Ticket, Users } from "lucide-react"
import "./Header.css"

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()

    console.log("[v0] Header - User:", user)
    console.log("[v0] Header - User roles:", user?.roles)

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

    const isAdmin = () => {
        const userRoles = user?.roles || []
        const adminCheck = Array.isArray(userRoles) && userRoles.includes("ADMIN")
        console.log("[v0] Header - Admin check:", {
            userRoles,
            isArray: Array.isArray(userRoles),
            includesAdmin: userRoles.includes("ADMIN"),
            adminCheck,
        })
        return adminCheck
    }

    const getRoleDisplayName = (roles) => {
        if (!roles || roles.length === 0) return "Usuario"
        const roleArray = Array.isArray(roles) ? roles : [roles]
        if (roleArray.includes("ADMIN")) return "Administrador"
        return "Usuario"
    }

    const getRoleClass = (roles) => {
        if (!roles || roles.length === 0) return "user"
        const roleArray = Array.isArray(roles) ? roles : [roles]
        if (roleArray.includes("ADMIN")) return "admin"
        return "user"
    }

    const handleNavigation = (path) => {
        navigate(path)
        closeMenu()
    }

    return (
        <header className="header">
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="header-logo" onClick={closeMenu}>
                    <div className="logo-icon">
                        <div className="logo-gradient">
                            <Sparkles className="sparkle-icon" />
                        </div>
                    </div>
                    <div className="logo-text-container">
                        <span className="logo-text">EventosCR</span>
                        <span className="logo-subtitle">Gestión de Eventos</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="desktop-nav">
                    {isAuthenticated ? (
                        <>
                            <button onClick={() => handleNavigation("/perfil")} className="nav-link">
                                <User className="nav-icon" />
                                <span>Mi Perfil</span>
                            </button>

                            <button onClick={() => handleNavigation("/mis-boletos")} className="nav-link">
                                <Ticket className="nav-icon" />
                                <span>Mis Boletos</span>
                            </button>

                            {isAdmin() && (
                                <>
                                    <button onClick={() => handleNavigation("/crear-evento")} className="nav-link">
                                        <Calendar className="nav-icon" />
                                        <span>Crear Evento</span>
                                    </button>

                                    <button onClick={() => handleNavigation("/usuarios")} className="nav-link">
                                        <Users className="nav-icon" />
                                        <span>Usuarios</span>
                                    </button>
                                </>
                            )}

                            {/* User menu */}
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
                                        <span className={`user-role ${getRoleClass(user?.roles)}`}>{getRoleDisplayName(user?.roles)}</span>
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
                                        <span className={`mobile-user-role ${getRoleClass(user?.roles)}`}>
                                            {getRoleDisplayName(user?.roles)}
                                        </span>
                                    </div>
                                </div>

                                <button onClick={() => handleNavigation("/perfil")} className="mobile-nav-link">
                                    <User className="nav-icon" />
                                    Mi Perfil
                                </button>

                                <button onClick={() => handleNavigation("/mis-boletos")} className="mobile-nav-link">
                                    <Ticket className="nav-icon" />
                                    Mis Boletos
                                </button>

                                {isAdmin() && (
                                    <>
                                        <button onClick={() => handleNavigation("/crear-evento")} className="mobile-nav-link">
                                            <Calendar className="nav-icon" />
                                            Crear Evento
                                        </button>

                                        <button onClick={() => handleNavigation("/usuarios")} className="mobile-nav-link">
                                            <Users className="nav-icon" />
                                            Usuarios
                                        </button>
                                    </>
                                )}

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

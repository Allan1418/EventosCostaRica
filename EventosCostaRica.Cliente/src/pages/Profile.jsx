"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { ticketService, authService, getErrorMessage } from "../services/api"
import {
    User,
    Mail,
    Calendar,
    MapPin,
    Ticket,
    Clock,
    Users,
    Shield,
    AlertCircle,
    Loader2,
    RefreshCw,
    Eye,
    Settings,
} from "lucide-react"
import "./Profile.css"

const Profile = () => {
    const { user, isAuthenticated } = useAuth()
    const [userProfile, setUserProfile] = useState(null)
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [profileLoading, setProfileLoading] = useState(true)
    const [error, setError] = useState("")
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (isAuthenticated) {
            loadUserProfile()
            loadTickets()
        }
    }, [isAuthenticated])

    const loadUserProfile = async () => {
        try {
            setProfileLoading(true)
            setError("")

            // Intentar obtener el perfil del usuario desde la API
            const profileData = await authService.getProfile()
            console.log("User profile loaded:", profileData)
            setUserProfile(profileData)
        } catch (error) {
            console.error("Error loading user profile:", error)
            // Si falla, usar los datos del contexto de autenticación
            setUserProfile(user)
        } finally {
            setProfileLoading(false)
        }
    }

    const loadTickets = async () => {
        try {
            setLoading(true)
            setError("")
            const ticketsData = await ticketService.getMyTickets()
            console.log("Tickets loaded:", ticketsData)
            setTickets(Array.isArray(ticketsData) ? ticketsData : [])
        } catch (error) {
            console.error("Error loading tickets:", error)
            setError(getErrorMessage(error))
            setTickets([])
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        try {
            setRefreshing(true)
            await Promise.all([loadUserProfile(), loadTickets()])
        } catch (error) {
            console.error("Error refreshing data:", error)
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
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Fecha inválida"
        }
    }

    const getRoleBadgeClass = (role) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "role-badge admin"
            case "user":
            case "usuario":
                return "role-badge user"
            default:
                return "role-badge default"
        }
    }

    const getRoleDisplayName = (role) => {
        switch (role?.toLowerCase()) {
            case "admin":
                return "Administrador"
            case "user":
            case "usuario":
                return "Usuario"
            default:
                return role || "Usuario"
        }
    }

    // Usar userProfile si está disponible, sino usar user del contexto
    const currentUser = userProfile || user

    if (!isAuthenticated) {
        return (
            <div className="profile-container">
                <div className="profile-error">
                    <AlertCircle size={48} className="error-icon" />
                    <h3>Acceso Restringido</h3>
                    <p>Debes iniciar sesión para ver tu perfil.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="profile-container">
            <div className="profile-layout">
                {/* Sidebar con información del usuario */}
                <div className="profile-sidebar">
                    <div className="user-card">
                        {profileLoading ? (
                            <div className="profile-loading">
                                <Loader2 size={24} className="animate-spin" />
                                <p>Cargando perfil...</p>
                            </div>
                        ) : (
                            <>
                                <div className="user-avatar">
                                    <div className="avatar-circle">
                                        <User size={32} />
                                    </div>
                                    <div className={getRoleBadgeClass(currentUser?.role)}>
                                        <Shield size={12} />
                                        {getRoleDisplayName(currentUser?.role)}
                                    </div>
                                </div>

                                <div className="user-info">
                                    <h2 className="user-name">{currentUser?.userName || "Usuario"}</h2>
                                    <p className="user-subtitle">Miembro desde {new Date().getFullYear()}</p>
                                </div>

                                <div className="user-details">
                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <User size={16} />
                                        </div>
                                        <div className="detail-content">
                                            <span className="detail-label">Nombre de Usuario</span>
                                            <span className="detail-value">{currentUser?.userName || "No disponible"}</span>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <Mail size={16} />
                                        </div>
                                        <div className="detail-content">
                                            <span className="detail-label">Correo Electrónico</span>
                                            <span className="detail-value">{currentUser?.email || "No disponible"}</span>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <Ticket size={16} />
                                        </div>
                                        <div className="detail-content">
                                            <span className="detail-label">Boletos Totales</span>
                                            <span className="detail-value">{tickets.length}</span>
                                        </div>
                                    </div>

                                    {currentUser?.id && (
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <Settings size={16} />
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">ID de Usuario</span>
                                                <span className="detail-value">{currentUser.id}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="user-actions">
                                    <button className="btn btn-outline btn-sm">
                                        <Settings size={16} />
                                        Configuración
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Contenido principal - Boletos */}
                <div className="profile-main">
                    <div className="tickets-section">
                        <div className="section-header">
                            <div className="header-content">
                                <h3 className="section-title">
                                    <Ticket className="section-icon" />
                                    Mis Boletos
                                </h3>
                                <p className="section-subtitle">Gestiona y visualiza todos tus boletos de eventos</p>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="btn btn-outline btn-sm"
                                title="Actualizar datos"
                            >
                                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                                {refreshing ? "Actualizando..." : "Actualizar"}
                            </button>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                <AlertCircle size={16} />
                                <div className="alert-content">
                                    <h4>Error al cargar boletos</h4>
                                    <p>{error}</p>
                                </div>
                                <button onClick={() => setError("")} className="close-btn">
                                    ×
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <div className="tickets-loading">
                                <Loader2 size={32} className="animate-spin loading-icon" />
                                <h4>Cargando boletos...</h4>
                                <p>Obteniendo información de tus boletos</p>
                            </div>
                        ) : tickets.length === 0 ? (
                            <div className="tickets-empty">
                                <Ticket size={48} className="empty-icon" />
                                <h4>No tienes boletos</h4>
                                <p>Cuando compres boletos para eventos, aparecerán aquí.</p>
                                <button className="btn btn-primary">
                                    <Eye size={16} />
                                    Ver Eventos Disponibles
                                </button>
                            </div>
                        ) : (
                            <div className="tickets-grid">
                                {tickets.map((ticket) => (
                                    <div key={ticket.id} className="ticket-card">
                                        <div className="ticket-header">
                                            <div className="ticket-event-name">{ticket.evento?.name || "Evento sin nombre"}</div>
                                            <div className="ticket-id">#{ticket.id}</div>
                                        </div>

                                        <div className="ticket-content">
                                            <div className="ticket-info-grid">
                                                <div className="info-item">
                                                    <Calendar size={14} />
                                                    <div>
                                                        <span className="info-label">Fecha</span>
                                                        <span className="info-value">{formatDate(ticket.evento?.eventoDate)}</span>
                                                    </div>
                                                </div>

                                                <div className="info-item">
                                                    <MapPin size={14} />
                                                    <div>
                                                        <span className="info-label">Ubicación</span>
                                                        <span className="info-value">{ticket.evento?.location || "No especificada"}</span>
                                                    </div>
                                                </div>

                                                <div className="info-item">
                                                    <Users size={14} />
                                                    <div>
                                                        <span className="info-label">Asiento</span>
                                                        <span className="info-value">
                                                            Fila {(ticket.seatRow || 0) + 1}, Asiento {(ticket.seatColumn || 0) + 1}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="info-item">
                                                    <Clock size={14} />
                                                    <div>
                                                        <span className="info-label">Comprado</span>
                                                        <span className="info-value">{formatDate(ticket.purchaseDate)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ticket-footer">
                                            <button className="btn btn-outline btn-sm">
                                                <Eye size={14} />
                                                Ver Detalles
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile

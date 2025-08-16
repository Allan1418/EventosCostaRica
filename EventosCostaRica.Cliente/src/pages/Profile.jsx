"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { authService } from "../services/api"
import { useRoles } from "../hooks/useRoles"
import RoleBasedComponent from "../components/RoleBasedComponent"
import {
    User,
    Mail,
    Calendar,
    Ticket,
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
    const { hasPermission, isAdmin, PERMISSIONS } = useRoles()
    const [userProfile, setUserProfile] = useState(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [error, setError] = useState("")
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (isAuthenticated) {
            loadUserProfile()
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

    const handleRefresh = async () => {
        try {
            setRefreshing(true)
            await loadUserProfile()
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

    const getRoleBadgeClass = (roles) => {
        if (!roles || roles.length === 0) return "role-badge user"

        const roleArray = Array.isArray(roles) ? roles : [roles]

        if (roleArray.includes("ADMIN")) return "role-badge admin"
        return "role-badge user"
    }

    const getRoleDisplayName = (roles) => {
        if (!roles || roles.length === 0) return "Usuario"

        const roleArray = Array.isArray(roles) ? roles : [roles]

        if (roleArray.includes("ADMIN")) return "Administrador"
        if (roleArray.includes("USER")) return "Usuario"

        return roleArray[0] || "Usuario"
    }

    // Usar userProfile si está disponible, sino usar user del contexto
    const currentUser = userProfile || user

    const navigateToUsers = () => {
        window.location.href = "/usuarios"
    }

    const navigateToEvents = () => {
        window.location.href = "/"
    }

    const navigateToTickets = () => {
        window.location.href = "/mis-boletos"
    }

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
                                    <div className={getRoleBadgeClass(currentUser?.roles)}>
                                        <Shield size={12} />
                                        {getRoleDisplayName(currentUser?.roles)}
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

                                    <RoleBasedComponent requiredPermissions={[PERMISSIONS.VIEW_USERS]}>
                                        <div className="detail-item">
                                            <div className="detail-icon">
                                                <Users size={16} />
                                            </div>
                                            <div className="detail-content">
                                                <span className="detail-label">Rol</span>
                                                <span className="detail-value">{getRoleDisplayName(currentUser?.roles)}</span>
                                            </div>
                                        </div>
                                    </RoleBasedComponent>
                                </div>

                                <div className="user-actions">
                                    <button className="btn btn-outline btn-sm">
                                        <Settings size={16} />
                                        Configuración
                                    </button>
                                    <RoleBasedComponent requiredPermissions={[PERMISSIONS.MANAGE_USERS]}>
                                        <button onClick={navigateToUsers} className="btn btn-primary btn-sm">
                                            <Users size={16} />
                                            Panel Admin
                                        </button>
                                    </RoleBasedComponent>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Contenido principal - Acciones de Cuenta */}
                <div className="profile-main">
                    <div className="profile-actions-section">
                        <div className="section-header">
                            <div className="header-content">
                                <h3 className="section-title">
                                    <User className="section-icon" />
                                    Acciones de Cuenta
                                </h3>
                                <p className="section-subtitle">Gestiona tu cuenta y accede a tus funciones</p>
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
                                    <h4>Error al cargar perfil</h4>
                                    <p>{error}</p>
                                </div>
                                <button onClick={() => setError("")} className="close-btn">
                                    ×
                                </button>
                            </div>
                        )}

                        <RoleBasedComponent requiredPermissions={[PERMISSIONS.MANAGE_USERS]}>
                            <div className="admin-section">
                                <div className="admin-header">
                                    <Shield size={24} className="admin-icon" />
                                    <div>
                                        <h4>Panel de Administración</h4>
                                        <p>Acceso exclusivo para administradores</p>
                                    </div>
                                </div>
                                <button onClick={navigateToUsers} className="btn btn-admin btn-lg">
                                    <Users size={20} />
                                    Gestionar Usuarios
                                    <div className="btn-shine"></div>
                                </button>
                            </div>
                        </RoleBasedComponent>

                        <div className="action-cards-grid">
                            <div className="action-card primary-card" onClick={navigateToTickets}>
                                <div className="action-icon">
                                    <Ticket size={32} />
                                </div>
                                <div className="action-content">
                                    <h4>Mis Boletos</h4>
                                    <p>Ver y gestionar todos tus boletos de eventos</p>
                                </div>
                                <div className="action-arrow">
                                    <Eye size={20} />
                                </div>
                            </div>

                            <div className="action-card secondary-card" onClick={navigateToEvents}>
                                <div className="action-icon">
                                    <Calendar size={32} />
                                </div>
                                <div className="action-content">
                                    <h4>Explorar Eventos</h4>
                                    <p>Descubre nuevos eventos y compra boletos</p>
                                </div>
                                <div className="action-arrow">
                                    <Eye size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile

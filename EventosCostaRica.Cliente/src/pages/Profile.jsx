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
    ChevronRight,
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

            const profileData = await authService.getProfile()
            setUserProfile(profileData)
        } catch (error) {
            console.error("Error loading user profile:", error)
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
            <div className="profile-header">
                <div className="header-content">
                    <h1 className="page-title">Mi Perfil</h1>
                    <p className="page-subtitle">Gestiona tu cuenta y configuraciones</p>
                </div>
                <button onClick={handleRefresh} disabled={refreshing} className="refresh-button" title="Actualizar datos">
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    Actualizar
                </button>
            </div>

            {error && (
                <div className="error-banner">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="close-error">
                        ×
                    </button>
                </div>
            )}

            <div className="profile-grid">
                <div className="user-info-card">
                    {profileLoading ? (
                        <div className="loading-state">
                            <Loader2 size={24} className="animate-spin" />
                            <span>Cargando perfil...</span>
                        </div>
                    ) : (
                        <>
                            <div className="user-header">
                                <div className="avatar-container">
                                    <div className="user-avatar">
                                        <User size={32} />
                                    </div>
                                    <div className={`role-indicator ${isAdmin ? "admin" : "user"}`}>
                                        <Shield size={12} />
                                    </div>
                                </div>
                                <div className="user-meta">
                                    <h2 className="user-name">{currentUser?.userName || "Usuario"}</h2>
                                    <span className="user-role">{getRoleDisplayName(currentUser?.roles)}</span>
                                </div>
                            </div>

                            <div className="user-details-grid">
                                <div className="detail-row">
                                    <div className="detail-label">
                                        <User size={16} />
                                        <span>Usuario</span>
                                    </div>
                                    <span className="detail-value">{currentUser?.userName || "No disponible"}</span>
                                </div>

                                <div className="detail-row">
                                    <div className="detail-label">
                                        <Mail size={16} />
                                        <span>Email</span>
                                    </div>
                                    <span className="detail-value">{currentUser?.email || "No disponible"}</span>
                                </div>

                                <div className="detail-row">
                                    <div className="detail-label">
                                        <Calendar size={16} />
                                        <span>Miembro desde</span>
                                    </div>
                                    <span className="detail-value">{new Date().getFullYear()}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="actions-section">
                    <h3 className="section-title">Acciones Rápidas</h3>

                    <div className="action-cards">
                        <button className="action-card primary" onClick={navigateToTickets}>
                            <div className="card-icon primary-bg">
                                <Ticket size={20} />
                            </div>
                            <div className="card-content">
                                <h4>Mis Boletos</h4>
                                <p>Ver y gestionar tus boletos comprados</p>
                            </div>
                            <ChevronRight size={18} className="card-arrow" />
                        </button>

                        <button className="action-card secondary" onClick={navigateToEvents}>
                            <div className="card-icon secondary-bg">
                                <Calendar size={20} />
                            </div>
                            <div className="card-content">
                                <h4>Explorar Eventos</h4>
                                <p>Descubre y compra boletos para nuevos eventos</p>
                            </div>
                            <ChevronRight size={18} className="card-arrow" />
                        </button>

                        <RoleBasedComponent requiredPermissions={[PERMISSIONS.VIEW_USERS]}>
                            <button className="action-card admin" onClick={navigateToUsers}>
                                <div className="card-icon admin-bg">
                                    <Users size={20} />
                                </div>
                                <div className="card-content">
                                    <h4>Gestionar Usuarios</h4>
                                    <p>Panel de administración de usuarios</p>
                                </div>
                                <ChevronRight size={18} className="card-arrow" />
                            </button>
                        </RoleBasedComponent>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile

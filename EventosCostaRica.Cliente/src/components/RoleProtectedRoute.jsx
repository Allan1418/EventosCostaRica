"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useRoles } from "../hooks/useRoles"

const RoleProtectedRoute = ({
    children,
    requiredRoles = [],
    requiredPermissions = [],
    fallbackPath = "/",
    showUnauthorized = false,
}) => {
    const { isAuthenticated, loading } = useAuth()
    const { hasAnyRole, hasAnyPermission } = useRoles()

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p>Verificando permisos...</p>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    // Verificar roles si se especificaron
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        if (showUnauthorized) {
            return (
                <div className="unauthorized-container">
                    <div className="unauthorized-card">
                        <h2>Acceso Denegado</h2>
                        <p>No tienes los permisos necesarios para acceder a esta página.</p>
                        <button onClick={() => window.history.back()}>Volver</button>
                    </div>
                </div>
            )
        }
        return <Navigate to={fallbackPath} replace />
    }

    // Verificar permisos si se especificaron
    if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
        if (showUnauthorized) {
            return (
                <div className="unauthorized-container">
                    <div className="unauthorized-card">
                        <h2>Acceso Denegado</h2>
                        <p>No tienes los permisos necesarios para acceder a esta página.</p>
                        <button onClick={() => window.history.back()}>Volver</button>
                    </div>
                </div>
            )
        }
        return <Navigate to={fallbackPath} replace />
    }

    return children
}

export default RoleProtectedRoute

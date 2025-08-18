"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, loading, user } = useAuth()

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (adminOnly) {
        const userRoles = user?.roles || []
        const isAdmin = Array.isArray(userRoles) && userRoles.includes("ADMIN")

        if (!isAdmin) {
            return (
                <div className="access-denied">
                    <h2>Acceso Denegado</h2>
                    <p>No tienes permisos para acceder a esta página.</p>
                    <p>Esta función está disponible solo para administradores.</p>
                    <p>Tu rol actual: {userRoles.join(", ") || "Sin rol asignado"}</p>
                </div>
            )
        }
    }

    return children
}

export default ProtectedRoute

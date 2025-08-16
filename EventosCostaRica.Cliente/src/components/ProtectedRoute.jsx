"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, loading, user } = useAuth()

    console.log("[v0] ProtectedRoute - User:", user)
    console.log("[v0] ProtectedRoute - AdminOnly:", adminOnly)
    console.log("[v0] ProtectedRoute - User roles:", user?.roles)

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

        console.log("[v0] ProtectedRoute - Is admin check:", {
            userRoles,
            isArray: Array.isArray(userRoles),
            includesAdmin: userRoles.includes("ADMIN"),
            isAdmin,
        })

        if (!isAdmin) {
            console.log("[v0] ProtectedRoute - Access denied for non-admin user")
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

    console.log("[v0] ProtectedRoute - Access granted")
    return children
}

export default ProtectedRoute

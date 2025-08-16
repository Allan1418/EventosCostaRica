"use client"

import { useAuth } from "../context/AuthContext"
import { useRoles } from "../hooks/useRoles"
import RoleBasedComponent from "../components/RoleBasedComponent"
import "./RoleDemo.css"

const RoleDemo = () => {
    const { user, isAuthenticated } = useAuth()
    const { userRoles, userPermissions, hasPermission, isAdmin, PERMISSIONS } = useRoles()

    if (!isAuthenticated) {
        return (
            <div className="role-demo-container">
                <div className="demo-card">
                    <h1>Sistema de Roles - EventosCR</h1>
                    <p>Por favor, inicia sesión para ver la demostración del sistema de roles.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="role-demo-container">
            <div className="demo-header">
                <h1>Demostración del Sistema de Roles</h1>
                <p>Visualiza cómo funciona el sistema de autorización basado en roles</p>
            </div>

            <div className="demo-grid">
                <div className="demo-card">
                    <h2>👤 Información del Usuario</h2>
                    <div className="user-details">
                        <p>
                            <strong>Usuario:</strong> {user?.userName}
                        </p>
                        <p>
                            <strong>Email:</strong> {user?.email}
                        </p>
                        <p>
                            <strong>Roles:</strong>
                            <span className={`role-badge ${isAdmin() ? "admin" : "user"}`}>{userRoles.join(", ")}</span>
                        </p>
                        <p>
                            <strong>Es Admin:</strong>
                            <span className={`status-badge ${isAdmin() ? "yes" : "no"}`}>{isAdmin() ? "Sí" : "No"}</span>
                        </p>
                    </div>
                </div>

                <div className="demo-card">
                    <h2>🔑 Permisos del Usuario</h2>
                    <div className="permissions-list">
                        {userPermissions.length > 0 ? (
                            userPermissions.map((permission) => (
                                <span key={permission} className="permission-badge">
                                    {permission.replace(/_/g, " ").toLowerCase()}
                                </span>
                            ))
                        ) : (
                            <p>No hay permisos asignados</p>
                        )}
                    </div>
                </div>

                <div className="demo-card full-width">
                    <h2>🎯 Componentes Basados en Roles</h2>

                    <div className="components-showcase">
                        <RoleBasedComponent
                            requiredPermissions={[PERMISSIONS.VIEW_USERS]}
                            fallback={
                                <div className="restricted-content">
                                    <p>❌ No tienes permisos para ver la gestión de usuarios</p>
                                </div>
                            }
                        >
                            <div className="allowed-content admin">
                                <h3>👥 Gestión de Usuarios</h3>
                                <p>✅ Tienes acceso a la gestión de usuarios del sistema</p>
                                <button className="demo-btn">Ver Usuarios</button>
                            </div>
                        </RoleBasedComponent>

                        <RoleBasedComponent
                            requiredPermissions={[PERMISSIONS.CREATE_EVENT]}
                            fallback={
                                <div className="restricted-content">
                                    <p>❌ No tienes permisos para crear eventos</p>
                                </div>
                            }
                        >
                            <div className="allowed-content">
                                <h3>📅 Crear Eventos</h3>
                                <p>✅ Puedes crear y gestionar eventos</p>
                                <button className="demo-btn">Crear Evento</button>
                            </div>
                        </RoleBasedComponent>

                        <RoleBasedComponent
                            requiredPermissions={[PERMISSIONS.VIEW_EVENT_ANALYTICS]}
                            fallback={
                                <div className="restricted-content">
                                    <p>❌ No tienes acceso a las analíticas de eventos</p>
                                </div>
                            }
                        >
                            <div className="allowed-content admin">
                                <h3>📊 Analíticas de Eventos</h3>
                                <p>✅ Tienes acceso a las estadísticas y analíticas</p>
                                <button className="demo-btn">Ver Analíticas</button>
                            </div>
                        </RoleBasedComponent>

                        <div className="allowed-content basic">
                            <h3>🎫 Funciones Básicas</h3>
                            <p>✅ Todos los usuarios pueden comprar boletos y ver su perfil</p>
                            <button className="demo-btn">Mi Perfil</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleDemo

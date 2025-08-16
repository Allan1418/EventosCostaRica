"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useRoles } from "../hooks/useRoles"
import { RoleBasedComponent } from "../components/RoleBasedComponent"
import "./UserProfile.css"

const UserProfile = () => {
    const { user, isAuthenticated } = useAuth()
    const { hasPermission, isAdmin, PERMISSIONS } = useRoles()
    const [isEditing, setIsEditing] = useState(false)
    const [profileData, setProfileData] = useState({
        userName: "",
        email: "",
        roles: [],
    })

    useEffect(() => {
        if (user) {
            setProfileData({
                userName: user.userName || "",
                email: user.email || "",
                roles: user.roles || [],
            })
        }
    }, [user])

    const handleEdit = () => {
        if (hasPermission(PERMISSIONS.EDIT_OWN_PROFILE)) {
            setIsEditing(true)
        }
    }

    const handleSave = () => {
        // Aquí iría la lógica para guardar los cambios
        setIsEditing(false)
    }

    const handleCancel = () => {
        // Restaurar datos originales
        setProfileData({
            userName: user.userName || "",
            email: user.email || "",
            roles: user.roles || [],
        })
        setIsEditing(false)
    }

    if (!isAuthenticated) {
        return <div className="profile-container">Debes iniciar sesión para ver tu perfil</div>
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Mi Perfil</h1>
                <RoleBasedComponent requiredPermissions={[PERMISSIONS.EDIT_OWN_PROFILE]}>
                    {!isEditing && (
                        <button className="btn-edit" onClick={handleEdit}>
                            Editar Perfil
                        </button>
                    )}
                </RoleBasedComponent>
            </div>

            <div className="profile-content">
                <div className="profile-field">
                    <label>Nombre de Usuario:</label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={profileData.userName}
                            onChange={(e) => setProfileData({ ...profileData, userName: e.target.value })}
                        />
                    ) : (
                        <span>{profileData.userName}</span>
                    )}
                </div>

                <div className="profile-field">
                    <label>Email:</label>
                    {isEditing ? (
                        <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        />
                    ) : (
                        <span>{profileData.email}</span>
                    )}
                </div>

                <RoleBasedComponent requiredPermissions={[PERMISSIONS.VIEW_USERS]}>
                    <div className="profile-field">
                        <label>Roles:</label>
                        <div className="roles-display">
                            {profileData.roles.map((role, index) => (
                                <span key={index} className={`role-badge ${role.toLowerCase()}`}>
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </RoleBasedComponent>

                {isEditing && (
                    <div className="profile-actions">
                        <button className="btn-save" onClick={handleSave}>
                            Guardar Cambios
                        </button>
                        <button className="btn-cancel" onClick={handleCancel}>
                            Cancelar
                        </button>
                    </div>
                )}
            </div>

            <RoleBasedComponent requiredRoles={["ADMIN"]}>
                <div className="admin-section">
                    <h3>Panel de Administrador</h3>
                    <p>Tienes permisos de administrador para gestionar el sistema.</p>
                </div>
            </RoleBasedComponent>
        </div>
    )
}

export default UserProfile

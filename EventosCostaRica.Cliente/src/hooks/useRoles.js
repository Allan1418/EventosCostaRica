"use client"

import { useMemo } from "react"
import { useAuth } from "../context/AuthContext"

// Definición de roles y permisos
export const ROLES = {
    ADMIN: "ADMIN",
    USER: "USER",
}

export const PERMISSIONS = {
    // Gestión de usuarios
    VIEW_USERS: "view_users",
    MANAGE_USERS: "manage_users",

    // Gestión de eventos
    CREATE_EVENT: "create_event",
    EDIT_ANY_EVENT: "edit_any_event",
    DELETE_ANY_EVENT: "delete_any_event",
    VIEW_EVENT_ANALYTICS: "view_event_analytics",

    // Gestión de boletos
    VIEW_ALL_TICKETS: "view_all_tickets",
    MANAGE_TICKETS: "manage_tickets",

    // Configuración del sistema
    SYSTEM_CONFIG: "system_config",

    // Permisos básicos de usuario
    VIEW_OWN_PROFILE: "view_own_profile",
    EDIT_OWN_PROFILE: "edit_own_profile",
    PURCHASE_TICKETS: "purchase_tickets",
    VIEW_OWN_TICKETS: "view_own_tickets",
}

// Mapeo de roles a permisos
const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
        // Todos los permisos de administrador
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.CREATE_EVENT,
        PERMISSIONS.EDIT_ANY_EVENT,
        PERMISSIONS.DELETE_ANY_EVENT,
        PERMISSIONS.VIEW_EVENT_ANALYTICS,
        PERMISSIONS.VIEW_ALL_TICKETS,
        PERMISSIONS.MANAGE_TICKETS,
        PERMISSIONS.SYSTEM_CONFIG,
        // También incluye permisos básicos
        PERMISSIONS.VIEW_OWN_PROFILE,
        PERMISSIONS.EDIT_OWN_PROFILE,
        PERMISSIONS.PURCHASE_TICKETS,
        PERMISSIONS.VIEW_OWN_TICKETS,
    ],
    [ROLES.USER]: [
        // Solo permisos básicos de usuario
        PERMISSIONS.VIEW_OWN_PROFILE,
        PERMISSIONS.EDIT_OWN_PROFILE,
        PERMISSIONS.PURCHASE_TICKETS,
        PERMISSIONS.VIEW_OWN_TICKETS,
    ],
}

const normalizeRoles = (user) => {
    if (!user) return []


    // Verificar diferentes formatos de roles que puede devolver el backend
    let roles = []

    // Formato 1: user.roles como array
    if (Array.isArray(user.roles)) {
        roles = user.roles
    }
    // Formato 2: user.role como string único
    else if (user.role) {
        roles = [user.role]
    }
    // Formato 3: user.roles como string
    else if (typeof user.roles === "string") {
        roles = [user.roles]
    }
    // Formato 4: roles dentro de un objeto anidado
    else if (user.user && user.user.roles) {
        roles = Array.isArray(user.user.roles) ? user.user.roles : [user.user.roles]
    }
    // Formato 5: verificar propiedades comunes del backend
    else if (user.userRoles) {
        roles = Array.isArray(user.userRoles) ? user.userRoles : [user.userRoles]
    }


    // Si no hay roles, asignar USER por defecto
    if (roles.length === 0) {
        roles = [ROLES.USER]
    }

    return roles
}

export const useRoles = () => {
    const { user, isAuthenticated } = useAuth()

    const userRoles = useMemo(() => {
        if (!isAuthenticated || !user) {
            return []
        }

        return normalizeRoles(user)
    }, [user, isAuthenticated])

    const userPermissions = useMemo(() => {
        if (!isAuthenticated || userRoles.length === 0) return []

        const permissions = new Set()

        userRoles.forEach((role) => {
            const rolePermissions = ROLE_PERMISSIONS[role] || []
            rolePermissions.forEach((permission) => permissions.add(permission))
        })

        return Array.from(permissions)
    }, [userRoles, isAuthenticated])

    const hasRole = (role) => {
        const result = userRoles.includes(role)
        return result
    }

    const hasPermission = (permission) => {
        const result = userPermissions.includes(permission)
        return result
    }

    const hasAnyRole = (roles) => {
        return roles.some((role) => hasRole(role))
    }

    const hasAnyPermission = (permissions) => {
        return permissions.some((permission) => hasPermission(permission))
    }

    const isAdmin = () => {
        const result = hasRole(ROLES.ADMIN)
        return result
    }

    const isUser = () => {
        return hasRole(ROLES.USER)
    }

    return {
        userRoles,
        userPermissions,
        hasRole,
        hasPermission,
        hasAnyRole,
        hasAnyPermission,
        isAdmin,
        isUser,
        ROLES,
        PERMISSIONS,
    }
}

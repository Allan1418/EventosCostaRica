"use client"

import { useRoles } from "../hooks/useRoles"

const RoleBasedComponent = ({
    children,
    requiredRoles = [],
    requiredPermissions = [],
    fallback = null,
    showForUnauthenticated = false,
}) => {
    const { hasAnyRole, hasAnyPermission, userRoles } = useRoles()

    // Si no está autenticado y no se debe mostrar para no autenticados
    if (userRoles.length === 0 && !showForUnauthenticated) {
        return fallback
    }

    // Verificar roles si se especificaron
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        return fallback
    }

    // Verificar permisos si se especificaron
    if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
        return fallback
    }

    return children
}

export { RoleBasedComponent }
export default RoleBasedComponent

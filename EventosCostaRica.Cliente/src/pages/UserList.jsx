"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useRoles } from "../hooks/useRoles"
import { authService, getErrorMessage } from "../services/api"
import { Users, Mail, User, Shield, Calendar, RefreshCw, Edit, Search, Filter } from "lucide-react"

const UserList = () => {
    const { user, isAuthenticated } = useAuth()
    const { hasPermission, isAdmin } = useRoles()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRole, setFilterRole] = useState("all")

    useEffect(() => {
        if (isAuthenticated) {
            loadUsers()
        }
    }, [isAuthenticated, user])

    const loadUsers = async () => {
        try {
            setLoading(true)
            setError("")
            const data = await authService.getUserList()
            setUsers(Array.isArray(data) ? data : [])
        } catch (error) {
            const errorMessage = getErrorMessage(error)
            setError(errorMessage)
            if (error.response?.status === 404) {
                setUsers([])
                setError("")
            }
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("es-CR", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const filteredUsers = users.filter((userData) => {
        const matchesSearch =
            userData.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            userData.email?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRole =
            filterRole === "all" ||
            (filterRole === "admin" && userData.roles?.includes("ADMIN")) ||
            (filterRole === "user" && !userData.roles?.includes("ADMIN"))

        return matchesSearch && matchesRole
    })

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="card-professional p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Acceso Denegado</h2>
                    <p className="text-muted-foreground">Solo los administradores pueden ver la lista de usuarios.</p>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Cargando usuarios</h3>
                        <p className="text-muted-foreground">Obteniendo la información...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="card-professional p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Error al cargar usuarios</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <button
                        onClick={loadUsers}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border">
                <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-primary/20">
                                <Users className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-foreground mb-2">Gestión de Usuarios</h1>
                                <p className="text-muted-foreground text-lg">Administra y supervisa todos los usuarios del sistema</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={loadUsers}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <RefreshCw className="w-5 h-5" />
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="card-professional p-8 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Usuarios</p>
                                <p className="text-4xl font-bold text-foreground mt-2">{users.length}</p>
                                <p className="text-sm text-muted-foreground mt-1">Registrados en el sistema</p>
                            </div>
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                                <Users className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="card-professional p-8 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Administradores</p>
                                <p className="text-4xl font-bold text-foreground mt-2">
                                    {users.filter((u) => u.roles && u.roles.includes("ADMIN")).length}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">Con permisos avanzados</p>
                            </div>
                            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center">
                                <Shield className="w-8 h-8 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="card-professional p-8 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Usuarios Regulares
                                </p>
                                <p className="text-4xl font-bold text-foreground mt-2">
                                    {users.filter((u) => !u.roles || !u.roles.includes("ADMIN")).length}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">Acceso estándar</p>
                            </div>
                            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                                <User className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Search and Filter */}
                <div className="card-professional p-8 mb-8 bg-gradient-to-r from-muted/30 to-muted/10">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-lg"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Filter className="w-5 h-5 text-muted-foreground" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-4 bg-background border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent transition-colors text-lg min-w-[180px]"
                            >
                                <option value="all">Todos los roles</option>
                                <option value="admin">Administradores</option>
                                <option value="user">Usuarios</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="card-professional p-16 text-center">
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-8">
                            <Users className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-3xl font-bold text-foreground mb-3">
                            {searchTerm || filterRole !== "all" ? "No se encontraron usuarios" : "No hay usuarios"}
                        </h3>
                        <p className="text-muted-foreground text-lg">
                            {searchTerm || filterRole !== "all"
                                ? "Intenta ajustar los filtros de búsqueda"
                                : "No se encontraron usuarios en el sistema."}
                        </p>
                    </div>
                ) : (
                    <div className="card-professional overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-muted/50 to-muted/30 border-b border-border">
                                    <tr>
                                        <th className="text-left py-6 px-8 font-bold text-foreground text-lg">Usuario</th>
                                        <th className="text-left py-6 px-8 font-bold text-foreground text-lg">Email</th>
                                        <th className="text-left py-6 px-8 font-bold text-foreground text-lg">Rol</th>
                                        <th className="text-left py-6 px-8 font-bold text-foreground text-lg">Fecha de Registro</th>
                                        <th className="text-left py-6 px-8 font-bold text-foreground text-lg">Estado</th>
                                        <th className="text-left py-6 px-8 font-bold text-foreground text-lg">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredUsers.map((userData) => (
                                        <tr key={userData.id} className="hover:bg-muted/20 transition-colors duration-200">
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                                        <User className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground text-lg">{userData.userName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                                    <span className="text-foreground">{userData.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <span
                                                    className={`status-badge text-sm font-semibold px-3 py-2 ${userData.roles && userData.roles.includes("ADMIN")
                                                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                                            : "bg-blue-100 text-blue-800 border border-blue-200"
                                                        }`}
                                                >
                                                    {userData.roles && userData.roles.includes("ADMIN") ? "Administrador" : "Usuario"}
                                                </span>
                                            </td>
                                            <td className="py-6 px-8">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-muted-foreground" />
                                                    <span className="text-muted-foreground">{formatDate(userData.createdAt || new Date())}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-8">
                                                <span className="status-badge status-success font-semibold">Activo</span>
                                            </td>
                                            <td className="py-6 px-8">
                                                {user && user.id && userData.id && user.id.toString() !== userData.id.toString() ? (
                                                    <button
                                                        onClick={() => (window.location.href = `/editar-usuario/${userData.id}`)}
                                                        className="inline-flex items-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-colors duration-200 font-semibold"
                                                        title="Editar usuario"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Editar
                                                    </button>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 px-4 py-3 bg-muted text-muted-foreground rounded-xl font-semibold">
                                                        <User className="w-4 h-4" />
                                                        Tu usuario
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserList

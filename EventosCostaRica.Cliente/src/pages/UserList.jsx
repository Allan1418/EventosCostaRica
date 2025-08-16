"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useRoles } from "../hooks/useRoles"
import { authService, getErrorMessage } from "../services/api"
import { Users, Mail, User, Shield, Calendar, RefreshCw } from "lucide-react"

const UserList = () => {
    const { user, isAuthenticated } = useAuth()
    const { hasPermission, isAdmin } = useRoles()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        console.log("[v0] UserList - Current user:", user)
        console.log("[v0] UserList - Is authenticated:", isAuthenticated)
        console.log("[v0] UserList - Is admin:", isAdmin)
        console.log("[v0] UserList - Has MANAGE_USERS permission:", hasPermission("MANAGE_USERS"))
        console.log("[v0] UserList - User roles:", user?.roles)
    }, [user, isAuthenticated, isAdmin, hasPermission])

    useEffect(() => {
        if (isAuthenticated) {
            loadUsers()
        }
    }, [isAuthenticated, user])

    const loadUsers = async () => {
        try {
            setLoading(true)
            setError("")
            console.log("[v0] Loading users from API...")
            const data = await authService.getUserList()
            console.log("[v0] Users loaded successfully:", data)
            setUsers(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("[v0] Error loading users:", error)
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

    if (!isAuthenticated || !isAdmin) {
        console.log("[v0] Access denied - isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin)
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
                    <p className="text-slate-600">Solo los administradores pueden ver la lista de usuarios.</p>
                    <div className="mt-4 p-3 bg-gray-100 rounded text-sm text-left">
                        <p>
                            <strong>Debug Info:</strong>
                        </p>
                        <p>Autenticado: {isAuthenticated ? "Sí" : "No"}</p>
                        <p>Es Admin: {isAdmin ? "Sí" : "No"}</p>
                        <p>Roles: {JSON.stringify(user?.roles)}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Cargando usuarios...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Error al cargar usuarios</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={loadUsers}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">Lista de Usuarios</h1>
                            <p className="text-slate-600 mt-1">Visualiza todos los usuarios registrados en el sistema</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">{users.length}</div>
                                <div className="text-slate-600 font-medium">Total Usuarios</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">
                                    {users.filter((u) => u.roles && u.roles.includes("ADMIN")).length}
                                </div>
                                <div className="text-slate-600 font-medium">Administradores</div>
                            </div>
                        </div>
                    </div>
                </div>

                {users.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No hay usuarios</h3>
                        <p className="text-slate-600">No se encontraron usuarios en el sistema.</p>
                    </div>
                ) : (
                    /* Modern table design with better spacing and hover effects */
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Usuario</th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Email</th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Rol</th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Fecha de Registro</th>
                                        <th className="text-left py-4 px-6 font-semibold text-slate-700">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {users.map((userData) => (
                                        <tr key={userData.id} className="hover:bg-slate-50 transition-colors duration-150">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{userData.userName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-700">{userData.email}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${userData.roles && userData.roles.includes("ADMIN")
                                                            ? "bg-purple-100 text-purple-800"
                                                            : "bg-blue-100 text-blue-800"
                                                        }`}
                                                >
                                                    {userData.roles && userData.roles.includes("ADMIN") ? "Administrador" : "Usuario"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-700">{formatDate(userData.createdAt || new Date())}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    Activo
                                                </span>
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

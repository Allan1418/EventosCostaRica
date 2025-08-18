"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useRoles } from "../hooks/useRoles"
import { authService, getErrorMessage } from "../services/api"
import {
    ArrowLeft,
    User,
    Mail,
    Shield,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Sparkles,
    Crown,
    Star,
} from "lucide-react"

const EditUser = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user: currentUser, isAuthenticated } = useAuth()
    const { isAdmin } = useRoles()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [isEditingSelf, setIsEditingSelf] = useState(false)

    const [formData, setFormData] = useState({
        id: "",
        userName: "",
        email: "",
        roles: [],
    })

    useEffect(() => {
        const initializeComponent = async () => {
            if (!isAuthenticated || !isAdmin) {
                navigate("/")
                return
            }

            const editingSelf = currentUser && currentUser.id && id && currentUser.id.toString() === id.toString()
            setIsEditingSelf(editingSelf)

            if (editingSelf) {
                setError("No puedes editar tu propio usuario")
                setLoading(false)
                return
            }

            if (id && !user) {
                try {
                    setLoading(true)
                    setError("")

                    const userData = await authService.getUserById(id)
                    setUser(userData)

                    // Asegurar que USER siempre esté presente en los roles
                    const userRoles = userData.roles || []
                    if (!userRoles.includes("USER")) {
                        userRoles.push("USER")
                    }

                    setFormData({
                        id: userData.id,
                        userName: userData.userName,
                        email: userData.email,
                        roles: userRoles,
                    })
                } catch (error) {
                    setError(getErrorMessage(error))
                } finally {
                    setLoading(false)
                }
            }
        }

        initializeComponent()
    }, [id, isAuthenticated, isAdmin, navigate])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleRoleChange = (role) => {
        console.log("[v0] handleRoleChange called with role:", role)
        console.log("[v0] Current roles:", formData.roles)

        if (role === "USER") {
            // El rol USER no se puede quitar, siempre debe estar presente
            return
        }

        setFormData((prev) => {
            const newRoles = prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role]

            console.log("[v0] New roles will be:", newRoles)

            return {
                ...prev,
                roles: newRoles,
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.userName.trim()) {
            setError("El nombre de usuario es requerido")
            return
        }

        if (!formData.email.trim()) {
            setError("El email es requerido")
            return
        }

        // Asegurar que USER siempre esté presente antes de enviar
        const finalRoles = [...formData.roles]
        if (!finalRoles.includes("USER")) {
            finalRoles.push("USER")
        }

        const finalFormData = {
            ...formData,
            roles: finalRoles,
        }

        try {
            setSaving(true)
            setError("")
            setSuccess("")

            await authService.editUser(id, finalFormData)
            setSuccess("Usuario actualizado exitosamente")

            setTimeout(() => {
                navigate("/usuarios")
            }, 2000)
        } catch (error) {
            setError(getErrorMessage(error))
        } finally {
            setSaving(false)
        }
    }

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-float"></div>
                    <div
                        className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full blur-3xl animate-float"
                        style={{ animationDelay: "2s" }}
                    ></div>
                </div>

                <div className="relative backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-12 text-center max-w-md w-full shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                        Acceso Denegado
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed">Solo los administradores pueden editar usuarios.</p>
                    <div className="mt-6 flex justify-center">
                        <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-full"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (isEditingSelf) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-100 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-yellow-400/30 to-orange-600/30 rounded-full blur-2xl animate-pulse"></div>
                    <div
                        className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-orange-400/30 to-red-600/30 rounded-full blur-2xl animate-pulse"
                        style={{ animationDelay: "1s" }}
                    ></div>
                </div>

                <div className="relative backdrop-blur-xl bg-white/90 border border-white/30 rounded-3xl p-12 text-center max-w-md w-full shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <AlertCircle className="w-10 h-10 text-white animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                        Acción No Permitida
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">
                        No puedes editar tu propio usuario por seguridad.
                    </p>
                    <button
                        onClick={() => navigate("/usuarios")}
                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                    >
                        Volver a la Lista
                    </button>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                    <div
                        className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDelay: "1s" }}
                    ></div>
                </div>

                <div className="relative text-center space-y-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                        </div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
                    </div>
                    <div className="backdrop-blur-sm bg-white/80 rounded-2xl p-8 border border-white/30">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                            Cargando información del usuario
                        </h3>
                        <p className="text-gray-600 text-lg">Preparando los datos...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error && !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-red-400/20 to-pink-600/20 rounded-full blur-2xl animate-float"></div>
                </div>

                <div className="relative backdrop-blur-xl bg-white/90 border border-white/30 rounded-3xl p-12 text-center max-w-md w-full shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                        Error
                    </h2>
                    <p className="text-gray-600 text-lg leading-relaxed mb-8">{error}</p>
                    <button
                        onClick={() => navigate("/usuarios")}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 rounded-2xl font-bold text-lg transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                        Volver a la Lista
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-float"></div>
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-pink-600/10 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: "3s" }}
                ></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div className="relative backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg">
                <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12">
                    <div className="flex items-center gap-6 mb-8">
                        <button
                            onClick={() => navigate("/usuarios")}
                            className="inline-flex items-center gap-3 px-6 py-3 text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white/90 backdrop-blur-sm rounded-2xl transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-semibold">Volver a la Lista</span>
                        </button>
                    </div>

                    <div className="flex items-start gap-8">
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                <User className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-3xl blur-xl animate-pulse"></div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
                                Editar Usuario
                            </h1>
                            <p className="text-gray-600 text-xl mb-6 leading-relaxed">
                                Modifica la información y roles del usuario con precisión
                            </p>

                            {user && (
                                <div className="flex flex-wrap gap-4">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 rounded-xl font-semibold shadow-sm">
                                        <Sparkles className="w-4 h-4" />
                                        <span>ID:</span> {user.id.slice(0, 8)}...
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border border-orange-200 rounded-xl font-semibold shadow-sm">
                                        <Crown className="w-4 h-4 text-white" />
                                        <span>Roles:</span> {user.roles?.join(", ") || "Sin roles"}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-6xl mx-auto p-6 md:p-8 lg:p-12">
                {success && (
                    <div className="mb-8 p-6 backdrop-blur-xl bg-gradient-to-r from-green-50/90 to-emerald-50/90 border border-green-200/50 rounded-3xl shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-green-800 font-bold text-lg">{success}</p>
                                <p className="text-green-600">Redirigiendo a la lista de usuarios...</p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-8 p-6 backdrop-blur-xl bg-gradient-to-r from-red-50/90 to-pink-50/90 border border-red-200/50 rounded-3xl shadow-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-red-800 font-bold text-lg">{error}</p>
                        </div>
                    </div>
                )}

                <div className="backdrop-blur-xl bg-white/90 border border-white/30 rounded-3xl p-8 md:p-12 shadow-2xl hover:shadow-3xl transition-all duration-500">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        Nombre de Usuario
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 text-gray-900 text-lg font-medium shadow-lg hover:shadow-xl placeholder-gray-400"
                                        placeholder="Ingresa el nombre de usuario"
                                        required
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-purple-600/5 pointer-events-none"></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-white" />
                                        </div>
                                        Correo Electrónico
                                    </div>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500/50 transition-all duration-300 text-gray-900 text-lg font-medium shadow-lg hover:shadow-xl placeholder-gray-400"
                                        placeholder="Ingresa el correo electrónico"
                                        required
                                    />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/5 to-teal-600/5 pointer-events-none"></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="block text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-white" />
                                    </div>
                                    Permisos Administrativos
                                </div>
                            </label>

                            <div className="max-w-md">
                                <div className="relative group">
                                    <div
                                        className={`backdrop-blur-xl border-2 rounded-3xl p-8 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 ${formData.roles.includes("ADMIN")
                                                ? "bg-gradient-to-br from-yellow-50/90 to-orange-50/90 border-yellow-300/50 hover:border-yellow-400/70"
                                                : "bg-white/80 border-white/30 hover:border-yellow-300/50"
                                            }`}
                                    >
                                        <div className="flex items-start gap-6">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    id="role-admin"
                                                    checked={formData.roles.includes("ADMIN")}
                                                    onChange={(e) => {
                                                        console.log("[v0] Checkbox clicked, checked:", e.target.checked)
                                                        handleRoleChange("ADMIN")
                                                    }}
                                                    className="w-6 h-6 text-yellow-600 border-2 border-gray-300 rounded-lg focus:ring-yellow-500 focus:ring-2 mt-1 transition-all duration-200 cursor-pointer hover:scale-110 z-10 relative"
                                                />
                                                {formData.roles.includes("ADMIN") && (
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/30 to-orange-600/30 rounded-lg blur-sm animate-pulse"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div
                                                            className={`w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${formData.roles.includes("ADMIN") ? "animate-pulse scale-110" : "hover:scale-105"
                                                                }`}
                                                        >
                                                            <Crown className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xl text-gray-900">Administrador</span>
                                                            {formData.roles.includes("ADMIN") && (
                                                                <div className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 text-xs font-bold rounded-full border border-orange-200 animate-pulse">
                                                                    ACTIVO
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 leading-relaxed">
                                                        Otorga permisos administrativos completos con acceso a gestión de usuarios y configuración
                                                        del sistema.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`absolute inset-0 rounded-3xl transition-opacity duration-300 pointer-events-none ${formData.roles.includes("ADMIN")
                                                ? "bg-gradient-to-r from-yellow-500/10 to-orange-600/10 opacity-100"
                                                : "bg-gradient-to-r from-yellow-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100"
                                            }`}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-white/20">
                            <button
                                type="button"
                                onClick={() => navigate("/usuarios")}
                                className="flex-1 px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 hover:text-gray-900 hover:bg-white/90 rounded-2xl font-bold text-lg transition-all duration-300 border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Guardar Cambios</span>
                                        <Star className="w-4 h-4 animate-pulse" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditUser

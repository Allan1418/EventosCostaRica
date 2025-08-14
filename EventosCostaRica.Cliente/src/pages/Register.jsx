"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import "./Auth.css"

const Register = () => {
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { register, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/")
        }
    }, [isAuthenticated, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        // Limpiar mensajes cuando el usuario empiece a escribir
        if (error) setError("")
        if (success) setSuccess("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        // Validaciones básicas del frontend (solo las esenciales)
        if (!formData.userName.trim()) {
            setError("El nombre de usuario es requerido")
            setLoading(false)
            return
        }

        if (!formData.email.trim()) {
            setError("El correo electrónico es requerido")
            setLoading(false)
            return
        }

        if (!formData.password) {
            setError("La contraseña es requerida")
            setLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden")
            setLoading(false)
            return
        }

        try {
            const result = await register(formData)
            console.log("Register result:", result)

            if (result.success) {
                setSuccess(result.message || "Usuario registrado exitosamente")

                // Si el usuario fue autenticado automáticamente, redirigir
                if (isAuthenticated) {
                    setTimeout(() => {
                        navigate("/")
                    }, 1500)
                } else {
                    // Si no fue autenticado automáticamente, mostrar mensaje y opción de login
                    setTimeout(() => {
                        navigate("/login", {
                            state: {
                                message: "Registro exitoso. Ahora puedes iniciar sesión.",
                            },
                        })
                    }, 2000)
                }
            } else {
                setError(result.message || "Error en el registro")
            }
        } catch (error) {
            console.error("Registration error:", error)
            const { getErrorMessage } = await import("../services/api")
            const errorMessage = getErrorMessage(error)
            setError(errorMessage)
        }

        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Crear Cuenta</h1>
                    <p className="auth-subtitle">Únete a EventosCR y descubre eventos increíbles</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle className="auth-message-icon" />
                        <p>{error}</p>
                    </div>
                )}

                {success && (
                    <div className="auth-success">
                        <CheckCircle className="auth-message-icon" />
                        <p>{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form-group">
                        <label className="auth-label">
                            <User className="auth-label-icon" />
                            Nombre de Usuario
                        </label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            className="auth-input"
                            required
                            disabled={loading}
                            placeholder="Ingresa tu nombre de usuario"
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">
                            <Mail className="auth-label-icon" />
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="auth-input"
                            required
                            disabled={loading}
                            placeholder="ejemplo@correo.com"
                        />
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">
                            <Lock className="auth-label-icon" />
                            Contraseña
                        </label>
                        <div className="auth-password-input">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="auth-input"
                                required
                                disabled={loading}
                                placeholder="Tu contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="auth-password-toggle"
                                disabled={loading}
                            >
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    <div className="auth-form-group">
                        <label className="auth-label">
                            <Lock className="auth-label-icon" />
                            Confirmar Contraseña
                        </label>
                        <div className="auth-password-input">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="auth-input"
                                required
                                disabled={loading}
                                placeholder="Repite tu contraseña"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="auth-password-toggle"
                                disabled={loading}
                            >
                                {showConfirmPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading || success} className="auth-submit-button">
                        {loading ? "Creando cuenta..." : success ? "¡Cuenta creada!" : "Crear Cuenta"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        ¿Ya tienes una cuenta?{" "}
                        <Link to="/login" className="auth-link">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register

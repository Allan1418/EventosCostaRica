"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import "./Auth.css"

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const { login, isAuthenticated } = useAuth()
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
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

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

        try {
            const result = await login(formData.email.trim(), formData.password)

            if (result.success) {
                navigate("/")
            } else {
                setError(result.message || "Error en el inicio de sesión")
            }
        } catch (error) {
            console.error("Login error:", error)
            setError("Error de conexión. Verifica que el servidor esté funcionando.")
        }

        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-title">Iniciar Sesión</h1>
                    <p className="auth-subtitle">Accede a tu cuenta de EventosCR</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
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
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-password-toggle">
                                {showPassword ? <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="auth-submit-button">
                        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        ¿No tienes una cuenta?{" "}
                        <Link to="/register" className="auth-link">
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login

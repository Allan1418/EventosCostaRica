"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Auth.css"

const Login = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const success = await login(email, password)
            if (success) {
                navigate("/")
            } else {
                setError("Credenciales invalidas. Por favor, intentalo de nuevo.")
            }
        } catch (error) {
            console.error("Login error:", error)
            setError("Error al iniciar sesion. Intentalo de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Iniciar Sesion</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <p className="auth-error-message">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Correo Electronico
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Contrasena
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                    <button type="submit" className="form-button" disabled={loading}>
                        {loading ? "Iniciando sesion..." : "Iniciar Sesion"}
                    </button>
                </form>
                <p className="auth-link-text">
                    No tienes una cuenta?{" "}
                    <Link to="/register" className="auth-link">
                        Registrate aqui
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login

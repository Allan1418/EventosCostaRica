"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "./Auth.css"

const Register = () => {
    const [userName, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        setLoading(true)

        if (password !== confirmPassword) {
            setError("Las contrasenas no coinciden.")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError("La contrasena debe tener al menos 6 caracteres.")
            setLoading(false)
            return
        }

        try {
            const registrationSuccess = await register(userName, email, password, confirmPassword)
            if (registrationSuccess) {
                setSuccess("Registro exitoso. Ahora puedes iniciar sesion.")
                setTimeout(() => {
                    navigate("/login")
                }, 2000)
            } else {
                setError("Error en el registro. Por favor, intentalo de nuevo.")
            }
        } catch (error) {
            console.error("Registration error:", error)
            setError("Error en el registro. Verifica tus datos e intentalo de nuevo.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Registrarse</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <p className="auth-error-message">{error}</p>}
                    {success && <p className="auth-success-message">{success}</p>}
                    <div className="form-group">
                        <label htmlFor="userName" className="form-label">
                            Nombre de Usuario
                        </label>
                        <input
                            type="text"
                            id="userName"
                            className="form-input"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
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
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirmar Contrasena
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>
                    <button type="submit" className="form-button" disabled={loading}>
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>
                </form>
                <p className="auth-link-text">
                    Ya tienes una cuenta?{" "}
                    <Link to="/login" className="auth-link">
                        Inicia Sesion
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register

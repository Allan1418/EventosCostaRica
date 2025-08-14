"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authService, getErrorMessage } from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = () => {
        try {
            const token = localStorage.getItem("authToken")
            const userData = localStorage.getItem("userData")

            if (token && userData) {
                const parsedUser = JSON.parse(userData)
                setUser(parsedUser)
                setIsAuthenticated(true)
            }
        } catch (error) {
            console.error("Error checking auth status:", error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            console.log("Attempting login with:", { email, password: "***" })
            const response = await authService.login(email, password)
            console.log("Login response:", response)

            if (response && (response.token || response.user)) {
                const token = response.token || response.accessToken
                const userData = response.user || response

                if (token) {
                    localStorage.setItem("authToken", token)
                    localStorage.setItem("userData", JSON.stringify(userData))
                    setUser(userData)
                    setIsAuthenticated(true)
                    return { success: true, message: response.message || "Login exitoso" }
                }
            }

            return { success: false, message: response.message || "Credenciales inválidas" }
        } catch (error) {
            console.error("Login error:", error)
            const errorMessage = getErrorMessage(error)
            return { success: false, message: errorMessage }
        }
    }

    const register = async (userData) => {
        try {
            console.log("Attempting registration with:", {
                ...userData,
                password: "***",
                confirmPassword: "***",
            })

            const response = await authService.register(userData)
            console.log("Registration response:", response)

            // Manejar diferentes formatos de respuesta exitosa
            if (response) {
                // Si la respuesta tiene token, es un registro con login automático
                if (response.token || response.accessToken) {
                    const token = response.token || response.accessToken
                    const userInfo = response.user || response

                    localStorage.setItem("authToken", token)
                    localStorage.setItem("userData", JSON.stringify(userInfo))
                    setUser(userInfo)
                    setIsAuthenticated(true)
                    return { success: true, message: response.message || "Registro exitoso. ¡Bienvenido!" }
                }

                // Si la respuesta solo confirma el registro sin login automático
                if (response.success !== false && response.message !== undefined) {
                    return { success: true, message: response.message || "Usuario registrado exitosamente" }
                }

                // Si la respuesta es exitosa pero sin estructura específica
                if (response.id || response.userId || response.userName || response.email) {
                    return { success: true, message: response.message || "Usuario registrado exitosamente" }
                }

                // Respuesta exitosa genérica
                return { success: true, message: response.message || "Usuario registrado exitosamente" }
            }

            return { success: false, message: "Error en el registro" }
        } catch (error) {
            console.error("Registration error:", error)

            // Si el error es 200 o 201 (éxito) pero axios lo trata como error
            if (error.response?.status === 200 || error.response?.status === 201) {
                const responseData = error.response.data
                if (responseData) {
                    return { success: true, message: responseData.message || "Usuario registrado exitosamente" }
                }
            }

            const errorMessage = getErrorMessage(error)
            return { success: false, message: errorMessage }
        }
    }

    const logout = async () => {
        try {
            if (isAuthenticated) {
                await authService.logout()
            }
        } catch (error) {
            console.warn("Logout API call failed:", error)
        } finally {
            localStorage.removeItem("authToken")
            localStorage.removeItem("userData")
            setUser(null)
            setIsAuthenticated(false)
        }
    }

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authAPI } from "../services/api"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser))
                setIsAuthenticated(true)
            } catch (e) {
                console.error("Failed to parse user from localStorage", e)
                localStorage.removeItem("token")
                localStorage.removeItem("user")
            }
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password })
            const { token } = response.data

            if (token) {
                localStorage.setItem("token", token)

                // Obtener perfil del usuario despues del login
                try {
                    const profileResponse = await authAPI.getProfile()
                    const userData = profileResponse.data
                    localStorage.setItem("user", JSON.stringify(userData))
                    setUser(userData)
                    setIsAuthenticated(true)
                    return true
                } catch (profileError) {
                    console.error("Error getting user profile:", profileError)
                    // Si no se puede obtener el perfil, usar datos basicos
                    const basicUser = { email }
                    localStorage.setItem("user", JSON.stringify(basicUser))
                    setUser(basicUser)
                    setIsAuthenticated(true)
                    return true
                }
            }
            return false
        } catch (error) {
            console.error("Login failed:", error)
            setIsAuthenticated(false)
            return false
        }
    }

    const register = async (userName, email, password, confirmPassword) => {
        try {
            const response = await authAPI.register({
                userName,
                email,
                password,
                confirmPassword,
            })
            return response.status === 200
        } catch (error) {
            console.error("Registration failed:", error)
            return false
        }
    }

    const logout = async () => {
        try {
            await authAPI.logout()
        } catch (error) {
            console.error("Logout API call failed:", error)
        } finally {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setUser(null)
            setIsAuthenticated(false)
        }
    }

    const loadUserProfile = async () => {
        if (isAuthenticated) {
            try {
                const response = await authAPI.getProfile()
                setUser(response.data)
                localStorage.setItem("user", JSON.stringify(response.data))
            } catch (error) {
                console.error("Failed to load user profile:", error)
                logout()
            }
        }
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading, loadUserProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}

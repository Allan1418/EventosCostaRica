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

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem("authToken")

            if (token) {
                try {
                    const profileData = await authService.getProfile()

                    if (profileData) {
                        const normalizedUser = {
                            id: profileData.id,
                            userName: profileData.userName,
                            email: profileData.email,
                            roles: normalizeRoles(profileData.roles || profileData.role),
                        }

                        localStorage.setItem("userData", JSON.stringify(normalizedUser))
                        setUser(normalizedUser)
                        setIsAuthenticated(true)
                    } else {
                        logout()
                    }
                } catch (apiError) {
                    const userData = localStorage.getItem("userData")
                    if (userData) {
                        try {
                            const parsedUser = JSON.parse(userData)

                            const normalizedUser = {
                                id: parsedUser.id,
                                userName: parsedUser.userName,
                                email: parsedUser.email,
                                roles: normalizeRoles(parsedUser.roles || parsedUser.role),
                            }

                            setUser(normalizedUser)
                            setIsAuthenticated(true)
                        } catch (parseError) {
                            logout()
                        }
                    } else {
                        logout()
                    }
                }
            }
        } catch (error) {
            console.error("Error checking auth status:", error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    const refreshUserData = async () => {
        try {
            const profileData = await authService.getProfile()
            console.log("[v0] AuthContext - Refreshed profile data:", profileData)

            if (profileData) {
                const normalizedUser = {
                    id: profileData.id,
                    userName: profileData.userName,
                    email: profileData.email,
                    roles: normalizeRoles(profileData.roles || profileData.role),
                }

                localStorage.setItem("userData", JSON.stringify(normalizedUser))
                setUser(normalizedUser)
                return normalizedUser
            }
        } catch (error) {
            console.error("[v0] AuthContext - Error refreshing user data:", error)
            throw error
        }
    }

    const login = async (email, password) => {
        try {
            const response = await authService.login(email, password)

            if (response && (response.token || response.user)) {
                const token = response.token || response.accessToken
                const userData = response.user || response

                if (token && userData) {
                    localStorage.setItem("authToken", token)

                    try {
                        const profileData = await authService.getProfile()
                        const normalizedUser = {
                            id: profileData.id,
                            userName: profileData.userName,
                            email: profileData.email,
                            roles: normalizeRoles(profileData.roles || profileData.role),
                        }

                        localStorage.setItem("userData", JSON.stringify(normalizedUser))
                        setUser(normalizedUser)
                        setIsAuthenticated(true)

                        return { success: true, message: response.message || "Login exitoso" }
                    } catch (profileError) {
                        const normalizedUser = {
                            id: userData.id,
                            userName: userData.userName,
                            email: userData.email,
                            roles: normalizeRoles(userData.roles || userData.role),
                        }

                        localStorage.setItem("userData", JSON.stringify(normalizedUser))
                        setUser(normalizedUser)
                        setIsAuthenticated(true)
                        return { success: true, message: response.message || "Login exitoso" }
                    }
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

            if (response) {
                if (response.token || response.accessToken) {
                    const token = response.token || response.accessToken
                    const userInfo = response.user || response

                    if (userInfo) {
                        const normalizedUser = {
                            id: userInfo.id,
                            userName: userInfo.userName,
                            email: userInfo.email,
                            roles: normalizeRoles(userInfo.roles || userInfo.role),
                        }

                        localStorage.setItem("authToken", token)
                        localStorage.setItem("userData", JSON.stringify(normalizedUser))
                        setUser(normalizedUser)
                        setIsAuthenticated(true)
                        return { success: true, message: response.message || "Registro exitoso. ¡Bienvenido!" }
                    }
                }

                if (response.success !== false && response.message !== undefined) {
                    return { success: true, message: response.message || "Usuario registrado exitosamente" }
                }

                if (response.id || response.userId || response.userName || response.email) {
                    return { success: true, message: response.message || "Usuario registrado exitosamente" }
                }

                return { success: true, message: response.message || "Usuario registrado exitosamente" }
            }

            return { success: false, message: "Error en el registro" }
        } catch (error) {
            console.error("Registration error:", error)

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

    const normalizeRoles = (rolesData) => {
        if (!rolesData) return ["USER"]

        if (Array.isArray(rolesData)) {
            return rolesData.length > 0 ? rolesData : ["USER"]
        }

        if (typeof rolesData === "string") {
            return [rolesData]
        }

        if (typeof rolesData === "object") {
            if (rolesData.name) return [rolesData.name]
            if (rolesData.roleName) return [rolesData.roleName]
            if (rolesData.role) return [rolesData.role]
        }

        return ["USER"]
    }

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        refreshUserData,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

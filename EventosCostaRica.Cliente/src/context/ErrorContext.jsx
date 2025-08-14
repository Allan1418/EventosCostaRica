"use client"

import { createContext, useContext, useState } from "react"
import ErrorPopup from "../components/UI/ErrorPopup"

const ErrorContext = createContext()

export const useError = () => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error("useError must be used within an ErrorProvider")
    }
    return context
}

export const ErrorProvider = ({ children }) => {
    const [errors, setErrors] = useState([])

    const showError = (message, type = "error", duration = 5000) => {
        const id = Date.now() + Math.random()
        const newError = {
            id,
            message,
            type,
            duration,
            isVisible: true,
        }

        setErrors((prev) => [...prev, newError])

        return id
    }

    const hideError = (id) => {
        setErrors((prev) => prev.filter((error) => error.id !== id))
    }

    const showSuccess = (message, duration = 4000) => {
        return showError(message, "success", duration)
    }

    const showWarning = (message, duration = 5000) => {
        return showError(message, "warning", duration)
    }

    const showInfo = (message, duration = 4000) => {
        return showError(message, "info", duration)
    }

    const clearAllErrors = () => {
        setErrors([])
    }

    const value = {
        showError,
        showSuccess,
        showWarning,
        showInfo,
        hideError,
        clearAllErrors,
    }

    return (
        <ErrorContext.Provider value={value}>
            {children}
            {errors.map((error) => (
                <ErrorPopup
                    key={error.id}
                    message={error.message}
                    type={error.type}
                    isVisible={error.isVisible}
                    duration={error.duration}
                    onClose={() => hideError(error.id)}
                />
            ))}
        </ErrorContext.Provider>
    )
}

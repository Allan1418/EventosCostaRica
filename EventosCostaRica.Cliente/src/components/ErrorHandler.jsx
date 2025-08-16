"use client"

import { createContext, useContext, useState } from "react"

const ErrorContext = createContext()

export const useError = () => {
    const context = useContext(ErrorContext)
    if (!context) {
        throw new Error("useError must be used within an ErrorProvider")
    }
    return context
}

export const ErrorProvider = ({ children }) => {
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const showError = (message) => {
        setError(message)
        setSuccess(null)
        // Auto-hide after 5 seconds
        setTimeout(() => setError(null), 5000)
    }

    const showSuccess = (message) => {
        setSuccess(message)
        setError(null)
        // Auto-hide after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
    }

    const clearError = () => setError(null)
    const clearSuccess = () => setSuccess(null)

    return (
        <ErrorContext.Provider
            value={{
                error,
                success,
                showError,
                showSuccess,
                clearError,
                clearSuccess,
            }}
        >
            {children}
            {error && (
                <div className="error-toast">
                    <div className="error-content">
                        <span className="error-icon">⚠️</span>
                        <span className="error-message">{error}</span>
                        <button onClick={clearError} className="error-close">
                            ×
                        </button>
                    </div>
                </div>
            )}
            {success && (
                <div className="success-toast">
                    <div className="success-content">
                        <span className="success-icon">✅</span>
                        <span className="success-message">{success}</span>
                        <button onClick={clearSuccess} className="success-close">
                            ×
                        </button>
                    </div>
                </div>
            )}
        </ErrorContext.Provider>
    )
}

"use client"

import { useState } from "react"

export const useErrorPopup = () => {
    const [error, setError] = useState(null)

    const showError = (errorMessage) => {
        setError(errorMessage)
    }

    const clearError = () => {
        setError(null)
    }

    return {
        error,
        showError,
        clearError,
    }
}

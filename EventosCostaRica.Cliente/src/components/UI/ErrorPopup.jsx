"use client"

import { useState, useEffect } from "react"
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"
import "./ErrorPopup.css"

const ErrorPopup = ({ message, type = "error", isVisible, onClose, duration = 5000, position = "top-right" }) => {
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true)
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleClose()
                }, duration)
                return () => clearTimeout(timer)
            }
        }
    }, [isVisible, duration])

    const handleClose = () => {
        setIsAnimating(false)
        setTimeout(() => {
            onClose()
        }, 300)
    }

    const getIcon = () => {
        switch (type) {
            case "success":
                return <CheckCircle className="popup-icon" />
            case "warning":
                return <AlertTriangle className="popup-icon" />
            case "info":
                return <Info className="popup-icon" />
            default:
                return <AlertCircle className="popup-icon" />
        }
    }

    const getTypeClass = () => {
        switch (type) {
            case "success":
                return "popup-success"
            case "warning":
                return "popup-warning"
            case "info":
                return "popup-info"
            default:
                return "popup-error"
        }
    }

    if (!isVisible) return null

    return (
        <div className={`error-popup ${getTypeClass()} ${position} ${isAnimating ? "animate-in" : "animate-out"}`}>
            <div className="popup-content">
                <div className="popup-header">
                    {getIcon()}
                    <div className="popup-text">
                        <p className="popup-message">{message}</p>
                    </div>
                </div>
                <button onClick={handleClose} className="popup-close-btn" aria-label="Cerrar notificación">
                    <X size={16} />
                </button>
            </div>
            <div className="popup-progress-bar">
                <div className="popup-progress-fill" style={{ animationDuration: `${duration}ms` }}></div>
            </div>
        </div>
    )
}

export default ErrorPopup

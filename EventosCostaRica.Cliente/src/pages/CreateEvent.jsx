"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { eventService, seatService, getErrorMessage } from "../services/api"
import {
    Calendar,
    MapPin,
    Users,
    FileText,
    ImageIcon,
    ArrowLeft,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Info,
    Clock,
    X,
    Trash2,
} from "lucide-react"
import "./CreateEvent.css"

const CreateEvent = () => {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [showPreview, setShowPreview] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        descrp: "",
        eventoDate: "",
        location: "",
        bannerImageUrl: "",
        rows: 10,
        seatsPerRow: 15,
    })

    // Verificar autenticación
    if (!isAuthenticated) {
        return (
            <div className="create-event-container">
                <div className="create-event-error">
                    <div className="error-container">
                        <AlertCircle size={48} className="error-icon" />
                        <h3>Acceso Restringido</h3>
                        <p>Debes iniciar sesión para crear eventos.</p>
                        <button onClick={() => navigate("/login")} className="btn btn-primary">
                            Iniciar Sesión
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const handleInputChange = (e) => {
        const { name, value, type } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? Math.max(1, Math.min(100, Number(value) || 1)) : value,
        }))

        // Clear messages when user starts typing
        if (error) setError("")
        if (success) setSuccess("")
    }

    const validateStep1 = () => {
        if (!formData.name.trim()) {
            setError("El nombre del evento es requerido")
            return false
        }
        if (formData.name.trim().length < 3) {
            setError("El nombre del evento debe tener al menos 3 caracteres")
            return false
        }
        if (!formData.descrp.trim()) {
            setError("La descripción del evento es requerida")
            return false
        }
        if (formData.descrp.trim().length < 10) {
            setError("La descripción debe tener al menos 10 caracteres")
            return false
        }
        if (!formData.eventoDate) {
            setError("La fecha del evento es requerida")
            return false
        }
        if (!formData.location.trim()) {
            setError("La ubicación del evento es requerida")
            return false
        }
        if (formData.location.trim().length < 3) {
            setError("La ubicación debe tener al menos 3 caracteres")
            return false
        }

        // Validar que la fecha sea en el futuro
        const eventDate = new Date(formData.eventoDate)
        const now = new Date()
        if (eventDate <= now) {
            setError("La fecha del evento debe ser en el futuro")
            return false
        }

        // Validar dimensiones de la matriz
        if (formData.rows < 1 || formData.rows > 100) {
            setError("El número de filas debe estar entre 1 y 100")
            return false
        }
        if (formData.seatsPerRow < 1 || formData.seatsPerRow > 100) {
            setError("El número de asientos por fila debe estar entre 1 y 100")
            return false
        }

        return true
    }

    const handleNextStep = () => {
        if (currentStep === 1) {
            if (validateStep1()) {
                setCurrentStep(2)
                setError("")
            }
        }
    }

    const handlePreviousStep = () => {
        if (currentStep === 2) {
            setCurrentStep(1)
            setError("")
        }
    }

    const handleSeatSelection = (row, col) => {
        const seatKey = `${row}-${col}`
        setSelectedSeats((prev) => {
            if (prev.includes(seatKey)) {
                return prev.filter((seat) => seat !== seatKey)
            } else {
                return [...prev, seatKey]
            }
        })
    }

    const clearSelectedSeats = () => {
        setSelectedSeats([])
    }

    const removeSeat = (seatKey) => {
        setSelectedSeats((prev) => prev.filter((seat) => seat !== seatKey))
    }

    const handleCreateEvent = async () => {
        setCreating(true)
        setError("")
        setSuccess("")

        try {
            // Preparar datos del evento según el schema de la API
            const eventData = {
                name: formData.name.trim(),
                descrp: formData.descrp.trim(),
                eventoDate: new Date(formData.eventoDate).toISOString(),
                location: formData.location.trim(),
                bannerImageUrl: formData.bannerImageUrl.trim() || "",
                rows: Number(formData.rows),
                seatsPerRow: Number(formData.seatsPerRow),
            }

            console.log("Creating event with data:", eventData)
            const response = await eventService.create(eventData)
            console.log("Event created successfully:", response)

            const eventId = response.id
            if (!eventId) {
                throw new Error("No se pudo obtener el ID del evento creado")
            }

            // Bloquear asientos seleccionados si hay alguno
            if (selectedSeats.length > 0) {
                console.log("Blocking selected seats:", selectedSeats)

                // Procesar asientos uno por uno para mejor manejo de errores
                for (const seatKey of selectedSeats) {
                    try {
                        const [row, col] = seatKey.split("-").map(Number)
                        await seatService.blockSeat({
                            eventoId: eventId,
                            seatRow: row,
                            seatColumn: col,
                        })
                        console.log(`Seat ${row}-${col} blocked successfully`)
                    } catch (seatError) {
                        console.warn(`Failed to block seat ${seatKey}:`, seatError)
                        // Continuar con los demás asientos aunque uno falle
                    }
                }

                console.log("Seat blocking process completed")
            }

            setSuccess(`¡Evento "${formData.name}" creado exitosamente!`)

            // Redirect after success
            setTimeout(() => {
                navigate(`/evento/${eventId}`)
            }, 2000)
        } catch (error) {
            console.error("Error creating event:", error)
            const errorMessage = getErrorMessage(error)
            setError(errorMessage)
        } finally {
            setCreating(false)
        }
    }

    const totalCapacity = formData.rows * formData.seatsPerRow
    const estimatedRevenue = totalCapacity * 15000

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return ""
        try {
            const date = new Date(dateTimeString)
            return date.toLocaleString("es-CR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return dateTimeString
        }
    }

    return (
        <div className="create-event-container">
            <div className="create-event-header">
                <button onClick={() => navigate("/")} className="btn btn-secondary btn-sm" disabled={creating}>
                    <ArrowLeft className="button-icon" />
                    Volver al Inicio
                </button>
                <div className="header-content">
                    <h1 className="create-event-title">
                        <FileText className="title-icon" />
                        Crear Nuevo Evento
                    </h1>
                    <p className="create-event-subtitle">
                        Paso {currentStep} de 2: {currentStep === 1 ? "Información del evento" : "Configuración de asientos"}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar">
                <div className="progress-steps">
                    <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
                        <div className="step-number">1</div>
                        <span>Información</span>
                    </div>
                    <div className={`progress-line ${currentStep >= 2 ? "active" : ""}`}></div>
                    <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
                        <div className="step-number">2</div>
                        <span>Asientos</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle className="alert-icon" />
                    <div className="alert-content">
                        <h4>Error</h4>
                        <p>{error}</p>
                    </div>
                    <button onClick={() => setError("")} className="close-btn">
                        <X size={16} />
                    </button>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <CheckCircle2 className="alert-icon" />
                    <div className="alert-content">
                        <h4>¡Éxito!</h4>
                        <p>{success}</p>
                    </div>
                </div>
            )}

            {/* Step 1: Event Information */}
            {currentStep === 1 && (
                <div className="create-event-form">
                    <div className="form-sections">
                        {/* Basic Information */}
                        <div className="form-section">
                            <div className="section-header">
                                <FileText className="section-icon" />
                                <h2 className="section-title">Información Básica</h2>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Nombre del Evento *<span className="char-count">({formData.name.length}/100)</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                    disabled={creating}
                                    placeholder="Ej: Concierto de Rock en Vivo"
                                    maxLength="100"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Descripción *<span className="char-count">({formData.descrp.length}/500)</span>
                                </label>
                                <textarea
                                    name="descrp"
                                    value={formData.descrp}
                                    onChange={handleInputChange}
                                    className="form-input form-textarea"
                                    required
                                    disabled={creating}
                                    placeholder="Describe tu evento de manera atractiva..."
                                    rows="4"
                                    maxLength="500"
                                />
                            </div>
                        </div>

                        {/* Date and Location */}
                        <div className="form-section">
                            <div className="section-header">
                                <Calendar className="section-icon" />
                                <h2 className="section-title">Fecha y Ubicación</h2>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">
                                        <Calendar className="form-label-icon" />
                                        Fecha y Hora *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventoDate"
                                        value={formData.eventoDate}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        disabled={creating}
                                        min={new Date().toISOString().slice(0, 16)}
                                    />
                                    {formData.eventoDate && (
                                        <p className="form-help">
                                            <Clock size={14} />
                                            {formatDateTime(formData.eventoDate)}
                                        </p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <MapPin className="form-label-icon" />
                                        Ubicación *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        disabled={creating}
                                        placeholder="Ej: Teatro Nacional, San José"
                                        maxLength="200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seat Configuration */}
                        <div className="form-section">
                            <div className="section-header">
                                <Users className="section-icon" />
                                <h2 className="section-title">Configuración de Asientos</h2>
                                <div className="section-info">
                                    <Info size={16} />
                                    <span>Los asientos se numeran desde 0</span>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Número de Filas (1-100)</label>
                                    <input
                                        type="number"
                                        name="rows"
                                        value={formData.rows}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        disabled={creating}
                                        min="1"
                                        max="100"
                                    />
                                    <p className="form-help">Filas numeradas: 0 a {formData.rows - 1}</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Asientos por Fila (1-100)</label>
                                    <input
                                        type="number"
                                        name="seatsPerRow"
                                        value={formData.seatsPerRow}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        required
                                        disabled={creating}
                                        min="1"
                                        max="100"
                                    />
                                    <p className="form-help">Asientos numerados: 0 a {formData.seatsPerRow - 1}</p>
                                </div>
                            </div>

                            <div className="capacity-summary">
                                <div className="summary-card">
                                    <div className="summary-item">
                                        <Users className="summary-icon" />
                                        <div>
                                            <span className="summary-number">{totalCapacity.toLocaleString()}</span>
                                            <span className="summary-label">Capacidad Total</span>
                                        </div>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-icon">₡</span>
                                        <div>
                                            <span className="summary-number">₡{estimatedRevenue.toLocaleString()}</span>
                                            <span className="summary-label">Ingresos Estimados</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Button */}
                            <div className="preview-section">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="btn btn-outline"
                                    disabled={creating}
                                >
                                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                                    {showPreview ? "Ocultar Vista Previa" : "Ver Vista Previa"}
                                </button>
                            </div>

                            {showPreview && (
                                <div className="matrix-preview">
                                    <h4>Vista Previa de la Matriz</h4>
                                    <div className="preview-grid">
                                        {Array.from({ length: Math.min(formData.rows, 10) }, (_, row) => (
                                            <div key={row} className="preview-row">
                                                <span className="preview-row-label">{row}</span>
                                                <div className="preview-seats">
                                                    {Array.from({ length: Math.min(formData.seatsPerRow, 15) }, (_, col) => (
                                                        <div key={col} className="preview-seat" title={`Fila ${row}, Asiento ${col}`}>
                                                            {col}
                                                        </div>
                                                    ))}
                                                    {formData.seatsPerRow > 15 && (
                                                        <div className="preview-seat-more">+{formData.seatsPerRow - 15} más</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {formData.rows > 10 && (
                                            <div className="preview-row-more">
                                                <span>+{formData.rows - 10} filas más</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Image */}
                        <div className="form-section">
                            <div className="section-header">
                                <ImageIcon className="section-icon" />
                                <h2 className="section-title">Imagen del Evento</h2>
                            </div>

                            <div className="form-group">
                                <label className="form-label">URL de Imagen (Opcional)</label>
                                <input
                                    type="url"
                                    name="bannerImageUrl"
                                    value={formData.bannerImageUrl}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    disabled={creating}
                                    placeholder="https://ejemplo.com/imagen-evento.jpg"
                                />
                                <p className="form-help">
                                    Agrega una imagen atractiva para tu evento. Si no tienes una, se generará automáticamente.
                                </p>
                            </div>

                            {formData.bannerImageUrl && (
                                <div className="image-preview">
                                    <img
                                        src={formData.bannerImageUrl || "/placeholder.svg"}
                                        alt="Vista previa"
                                        className="preview-image"
                                        onError={(e) => {
                                            e.target.style.display = "none"
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate("/")} className="btn btn-secondary" disabled={creating}>
                            Cancelar
                        </button>
                        <button type="button" onClick={handleNextStep} className="btn btn-primary btn-lg" disabled={creating}>
                            Siguiente: Configurar Asientos
                            <ArrowLeft className="button-icon" style={{ transform: "rotate(180deg)" }} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Seat Configuration */}
            {currentStep === 2 && (
                <div className="seat-configuration-step">
                    <div className="step-header">
                        <h2>Configuración de Asientos Bloqueados</h2>
                        <p>
                            Selecciona los asientos que estarán bloqueados (no disponibles para compra). Puedes crear el evento sin
                            bloquear asientos si lo prefieres.
                        </p>
                    </div>

                    {/* Event Summary - Mejorado */}
                    <div className="event-summary-card">
                        <div className="summary-header">
                            <h3>
                                <FileText size={20} />
                                Resumen del Evento
                            </h3>
                        </div>
                        <div className="summary-content">
                            <div className="summary-grid">
                                <div className="summary-item">
                                    <div className="item-icon">
                                        <FileText size={16} />
                                    </div>
                                    <div className="item-content">
                                        <span className="item-label">Nombre</span>
                                        <span className="item-value">{formData.name}</span>
                                    </div>
                                </div>

                                <div className="summary-item">
                                    <div className="item-icon">
                                        <Calendar size={16} />
                                    </div>
                                    <div className="item-content">
                                        <span className="item-label">Fecha</span>
                                        <span className="item-value">{formatDateTime(formData.eventoDate)}</span>
                                    </div>
                                </div>

                                <div className="summary-item">
                                    <div className="item-icon">
                                        <MapPin size={16} />
                                    </div>
                                    <div className="item-content">
                                        <span className="item-label">Ubicación</span>
                                        <span className="item-value">{formData.location}</span>
                                    </div>
                                </div>

                                <div className="summary-item">
                                    <div className="item-icon">
                                        <Users size={16} />
                                    </div>
                                    <div className="item-content">
                                        <span className="item-label">Capacidad</span>
                                        <span className="item-value">
                                            {totalCapacity} asientos ({formData.rows} filas × {formData.seatsPerRow} asientos)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seat Matrix */}
                    <div className="seat-matrix-section">
                        <div className="matrix-header">
                            <h3>
                                <Users size={20} />
                                Matriz de Asientos
                            </h3>
                            <div className="matrix-controls">
                                <div className="matrix-info">
                                    <Info size={16} />
                                    <span>Haz clic en los asientos para bloquearlos</span>
                                </div>
                                {selectedSeats.length > 0 && (
                                    <button onClick={clearSelectedSeats} className="btn btn-outline btn-sm" disabled={creating}>
                                        <Trash2 size={14} />
                                        Limpiar ({selectedSeats.length})
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="seat-matrix-container">
                            <div className="matrix-stage">
                                <span>ESCENARIO</span>
                            </div>

                            <div className="seats-grid">
                                {Array.from({ length: formData.rows }, (_, row) => (
                                    <div key={row} className="seat-row">
                                        <div className="row-label">{row}</div>
                                        <div className="row-seats">
                                            {Array.from({ length: formData.seatsPerRow }, (_, col) => {
                                                const seatKey = `${row}-${col}`
                                                const isSelected = selectedSeats.includes(seatKey)
                                                return (
                                                    <button
                                                        key={col}
                                                        className={`seat ${isSelected ? "selected" : "available"}`}
                                                        onClick={() => handleSeatSelection(row, col)}
                                                        title={`Fila ${row}, Asiento ${col} - ${isSelected ? "Bloqueado" : "Disponible"}`}
                                                        disabled={creating}
                                                    >
                                                        {col}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        <div className="row-label">{row}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="seat-legend">
                                <div className="legend-item">
                                    <div className="seat available"></div>
                                    <span>Disponible</span>
                                </div>
                                <div className="legend-item">
                                    <div className="seat selected"></div>
                                    <span>Bloqueado</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Seats Summary - Mejorado */}
                    {selectedSeats.length > 0 && (
                        <div className="selected-seats-card">
                            <div className="selected-header">
                                <h4>
                                    <Users size={18} />
                                    Asientos Seleccionados para Bloquear ({selectedSeats.length})
                                </h4>
                                <button onClick={clearSelectedSeats} className="btn btn-outline btn-sm" disabled={creating}>
                                    <Trash2 size={14} />
                                    Limpiar Todo
                                </button>
                            </div>
                            <div className="selected-grid">
                                {selectedSeats.map((seatKey, index) => {
                                    const [row, col] = seatKey.split("-")
                                    return (
                                        <div key={index} className="selected-seat-item">
                                            <div className="seat-info">
                                                <Users size={14} />
                                                <span>
                                                    Fila {row}, Asiento {col}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeSeat(seatKey)}
                                                className="remove-seat-btn"
                                                disabled={creating}
                                                title="Remover asiento"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    <div className="step-actions">
                        <button type="button" onClick={handlePreviousStep} className="btn btn-secondary" disabled={creating}>
                            <ArrowLeft className="button-icon" />
                            Anterior
                        </button>
                        <button type="button" onClick={handleCreateEvent} disabled={creating} className="btn btn-primary btn-lg">
                            {creating ? (
                                <>
                                    <Loader2 className="button-icon animate-spin" />
                                    Creando Evento...
                                </>
                            ) : (
                                <>
                                    <Save className="button-icon" />
                                    Crear Evento
                                    {selectedSeats.length > 0 && ` (${selectedSeats.length} asientos bloqueados)`}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateEvent

"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useError } from "../components/ErrorHandler"
import { eventService, seatService, getErrorMessage } from "../services/api"
import SeatMatrix from "../components/Events/SeatMatrix"
import {
    Calendar,
    MapPin,
    ImageIcon,
    Users,
    Settings,
    Save,
    ArrowLeft,
    ArrowRight,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Loader2,
    Edit3,
    Eye,
    Grid3X3,
    Info,
    ShoppingCart,
} from "lucide-react"
import "./EditEvent.css"

const EditEvent = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const { showError } = useError()

    // Estados para el formulario
    const [formData, setFormData] = useState({
        name: "",
        descrp: "",
        eventoDate: "",
        location: "",
        bannerImageUrl: "",
        rows: 10,
        seatsPerRow: 10,
    })

    // Estados para la matriz de asientos
    const [seatGrid, setSeatGrid] = useState([])
    const [originalSeatGrid, setOriginalSeatGrid] = useState([])
    const [blockedSeats, setBlockedSeats] = useState(new Set())
    const [occupiedSeats, setOccupiedSeats] = useState(new Set())

    // Estados de UI
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [step, setStep] = useState(1)
    const [validationWarning, setValidationWarning] = useState("")
    const [validationDetails, setValidationDetails] = useState(null)

    // Verificar permisos de administrador
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }

        loadEventData()
    }, [user, id, navigate, isAuthenticated])

    // Cargar datos del evento
    const loadEventData = async () => {
        try {
            setLoading(true)
            setError("")

            // Cargar información básica del evento
            const eventData = await eventService.getById(id)
            console.log("Event data loaded:", eventData)

            setFormData({
                name: eventData.name || "",
                descrp: eventData.descrp || "",
                eventoDate: eventData.eventoDate ? eventData.eventoDate.split("T")[0] : "",
                location: eventData.location || "",
                bannerImageUrl: eventData.bannerImageUrl || "",
                rows: eventData.rows || 10,
                seatsPerRow: eventData.seatsPerRow || 10,
            })

            // Cargar grid de asientos
            const gridData = await eventService.getSeatGrid(id)
            console.log("Seat grid loaded:", gridData)

            // Procesar el grid para identificar asientos bloqueados y ocupados
            const blocked = new Set()
            const occupied = new Set()

            if (gridData && gridData.rows && Array.isArray(gridData.rows)) {
                gridData.rows.forEach((rowData) => {
                    if (rowData.seats && Array.isArray(rowData.seats)) {
                        rowData.seats.forEach((seat) => {
                            const seatKey = `${seat.row}-${seat.column}`
                            if (seat.type === "Bloqueado" || seat.type === "Blocked") {
                                blocked.add(seatKey)
                            }
                            if (seat.type === "Ocupado" || seat.type === "Occupied") {
                                occupied.add(seatKey)
                            }
                        })
                    }
                })
            }

            setBlockedSeats(blocked)
            setOccupiedSeats(occupied)

            // Crear matriz inicial
            const initialGrid = createSeatGrid(eventData.rows, eventData.seatsPerRow, blocked, occupied)
            setSeatGrid(initialGrid)
            setOriginalSeatGrid(initialGrid)
        } catch (error) {
            console.error("Error loading event data:", error)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    // Crear grid de asientos
    const createSeatGrid = (rows, seatsPerRow, blocked = new Set(), occupied = new Set()) => {
        const grid = []
        for (let row = 0; row < rows; row++) {
            const seatRow = []
            for (let seat = 0; seat < seatsPerRow; seat++) {
                const seatKey = `${row}-${seat}`
                seatRow.push({
                    row,
                    seat,
                    isBlocked: blocked.has(seatKey),
                    isOccupied: occupied.has(seatKey),
                    isSelected: false,
                })
            }
            grid.push(seatRow)
        }
        return grid
    }

    // Manejar cambios en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Validar cambios en la matriz de asientos con detalles específicos
    const validateMatrixChanges = async (newRows, newSeatsPerRow) => {
        try {
            setValidationWarning("")
            setValidationDetails(null)

            const currentRows = formData.rows
            const currentSeatsPerRow = formData.seatsPerRow

            const eventDate = new Date(formData.eventoDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (eventDate < today) {
                const errorMessage = "❌ No se puede modificar la matriz porque el evento ya ha iniciado."
                showError(errorMessage)
                return false
            }

            // Si no hay reducción, permitir el cambio
            if (newRows >= currentRows && newSeatsPerRow >= currentSeatsPerRow) {
                return true
            }

            // Analizar qué filas y columnas se eliminarían
            const rowsToRemove = []
            const columnsToRemove = []
            const affectedSeats = {
                occupied: [],
            }

            // Verificar filas que se eliminarían
            if (newRows < currentRows) {
                for (let row = newRows; row < currentRows; row++) {
                    rowsToRemove.push(row)

                    for (let seat = 0; seat < currentSeatsPerRow; seat++) {
                        const seatKey = `${row}-${seat}`
                        if (occupiedSeats.has(seatKey)) {
                            affectedSeats.occupied.push({ row: row + 1, seat: seat + 1, type: "fila" })
                        }
                    }
                }
            }

            // Verificar columnas que se eliminarían
            if (newSeatsPerRow < currentSeatsPerRow) {
                for (let seat = newSeatsPerRow; seat < currentSeatsPerRow; seat++) {
                    columnsToRemove.push(seat)

                    for (let row = 0; row < Math.min(newRows, currentRows); row++) {
                        const seatKey = `${row}-${seat}`
                        if (occupiedSeats.has(seatKey)) {
                            affectedSeats.occupied.push({ row: row + 1, seat: seat + 1, type: "columna" })
                        }
                    }
                }
            }

            // Si hay asientos ocupados afectados, bloquear completamente
            if (affectedSeats.occupied.length > 0) {
                const occupiedDetails = affectedSeats.occupied
                    .map((seat) => `Fila ${seat.row}, Asiento ${seat.seat} (${seat.type} a eliminar)`)
                    .join(", ")

                const errorMessage =
                    `❌ No se puede reducir la matriz porque hay asientos con boletos vendidos que se eliminarían:\n\n` +
                    `🎫 Asientos ocupados: ${occupiedDetails}\n\n` +
                    `Los asientos con boletos vendidos no pueden ser removidos. ` +
                    `Contacta a los compradores para reembolsar o reubicar antes de continuar.`

                showError(errorMessage)
                return false
            }

            // Los asientos bloqueados se pueden eliminar sin problema

            return true
        } catch (error) {
            showError(error.message)
            return false
        }
    }

    // Manejar cambios en las dimensiones de la matriz
    const handleMatrixChange = async (field, value) => {
        const numValue = Number.parseInt(value)
        if (isNaN(numValue) || numValue < 1 || numValue > 50) {
            setError("Las dimensiones deben ser números entre 1 y 50")
            return
        }

        const newFormData = { ...formData, [field]: numValue }
        const newRows = field === "rows" ? numValue : formData.rows
        const newSeatsPerRow = field === "seatsPerRow" ? numValue : formData.seatsPerRow

        // Validar cambios
        const isValid = await validateMatrixChanges(newRows, newSeatsPerRow)
        if (!isValid) {
            return // Error, no continuar
        }

        // Actualizar form data
        setFormData(newFormData)

        // Recrear la matriz con las nuevas dimensiones
        const newGrid = createSeatGrid(newRows, newSeatsPerRow, blockedSeats, occupiedSeats)
        setSeatGrid(newGrid)
    }

    const handleSeatToggle = async (row, seat) => {
        try {
            const seatKey = `${row}-${seat}`

            // No permitir cambios en asientos ocupados
            if (occupiedSeats.has(seatKey)) {
                setError("No se puede modificar un asiento que ya tiene boletos vendidos")
                return
            }

            const isCurrentlyBlocked = blockedSeats.has(seatKey)

            const seatData = {
                eventoId: Number.parseInt(id, 10),
                seatRow: Number.parseInt(row, 10),
                seatColumn: Number.parseInt(seat, 10),
            }

            if (isNaN(seatData.eventoId) || isNaN(seatData.seatRow) || isNaN(seatData.seatColumn)) {
                throw new Error(
                    `Datos inválidos: eventoId=${seatData.eventoId}, seatRow=${seatData.seatRow}, seatColumn=${seatData.seatColumn}`,
                )
            }

            if (seatData.seatRow < 0 || seatData.seatColumn < 0) {
                throw new Error(`Posición inválida: fila=${seatData.seatRow}, columna=${seatData.seatColumn}`)
            }

            console.log("Sending seat data:", seatData)

            if (isCurrentlyBlocked) {
                // Desbloquear asiento
                await seatService.unblockSeat(seatData)

                setBlockedSeats((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(seatKey)
                    return newSet
                })
            } else {
                // Bloquear asiento
                await seatService.blockSeat(seatData)

                setBlockedSeats((prev) => new Set(prev).add(seatKey))
            }

            // Actualizar la matriz
            setSeatGrid((prevGrid) =>
                prevGrid.map((rowArray, rowIndex) =>
                    rowArray.map((seatObj, seatIndex) =>
                        rowIndex === row && seatIndex === seat ? { ...seatObj, isBlocked: !isCurrentlyBlocked } : seatObj,
                    ),
                ),
            )

            setError("")
            setSuccess(isCurrentlyBlocked ? "Asiento desbloqueado" : "Asiento bloqueado")
            setTimeout(() => setSuccess(""), 2000)
        } catch (error) {
            console.error("Error toggling seat:", error)
            setError(getErrorMessage(error))
        }
    }

    // Guardar cambios del evento
    const handleSave = async () => {
        try {
            setSaving(true)
            setError("")

            // Validar campos requeridos
            if (!formData.name.trim()) {
                throw new Error("El nombre del evento es requerido")
            }
            if (!formData.descrp.trim()) {
                throw new Error("La descripción del evento es requerida")
            }
            if (!formData.eventoDate) {
                throw new Error("La fecha del evento es requerida")
            }
            if (!formData.location.trim()) {
                throw new Error("La ubicación del evento es requerida")
            }

            // Validar fecha
            const eventDate = new Date(formData.eventoDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            if (eventDate < today) {
                throw new Error("La fecha del evento no puede ser en el pasado")
            }

            // Preparar datos para enviar
            const updateData = {
                name: formData.name.trim(),
                descrp: formData.descrp.trim(),
                eventoDate: formData.eventoDate,
                location: formData.location.trim(),
                bannerImageUrl: formData.bannerImageUrl.trim() || "/placeholder.svg?height=400&width=800",
                rows: formData.rows,
                seatsPerRow: formData.seatsPerRow,
            }

            console.log("Updating event with data:", updateData)

            // Actualizar evento
            await eventService.update(id, updateData)

            setSuccess("¡Evento actualizado exitosamente!")
            setTimeout(() => {
                navigate(`/evento/${id}`)
            }, 2000)
        } catch (error) {
            console.error("Error updating event:", error)
            setError(getErrorMessage(error))
        } finally {
            setSaving(false)
        }
    }

    // Renderizado de loading
    if (loading) {
        return (
            <div className="edit-event-page">
                <div className="edit-event-container">
                    <div className="loading-state">
                        <div className="loading-content">
                            <Loader2 size={48} className="animate-spin loading-icon" />
                            <h3>Cargando evento</h3>
                            <p>Obteniendo información del evento...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="edit-event-page">
            <div className="edit-event-container">
                {/* Header */}
                <div className="edit-event-header">
                    <div className="header-content">
                        <div className="header-title">
                            <Edit3 className="title-icon" size={32} />
                            <div>
                                <h1>Editar Evento</h1>
                                <p>Modifica la información y configuración de tu evento</p>
                            </div>
                        </div>
                        <button onClick={() => navigate(`/evento/${id}`)} className="btn btn-secondary btn-icon">
                            <Eye size={16} />
                            Ver Evento
                        </button>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="progress-container">
                    <div className="progress-steps">
                        <div className={`progress-step ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}>
                            <div className="step-circle">{step > 1 ? <CheckCircle size={20} /> : <span>1</span>}</div>
                            <div className="step-info">
                                <span className="step-title">Información Básica</span>
                                <span className="step-subtitle">Datos del evento</span>
                            </div>
                        </div>

                        <div className="progress-line"></div>

                        <div className={`progress-step ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
                            <div className="step-circle">{step > 2 ? <CheckCircle size={20} /> : <span>2</span>}</div>
                            <div className="step-info">
                                <span className="step-title">Configuración de Asientos</span>
                                <span className="step-subtitle">Matriz y bloqueos</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="alert alert-error">
                        <XCircle size={20} />
                        <div className="alert-content">
                            <h4>Error</h4>
                            <pre className="error-details">{error}</pre>
                        </div>
                        <button onClick={() => setError("")} className="alert-close">
                            <XCircle size={16} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <CheckCircle size={20} />
                        <div className="alert-content">
                            <h4>Éxito</h4>
                            <p>{success}</p>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="edit-event-content">
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="step-content">
                            <div className="step-header">
                                <h2>
                                    <Info size={24} />
                                    Información del Evento
                                </h2>
                                <p>Actualiza los datos básicos de tu evento</p>
                            </div>

                            <div className="form-sections">
                                {/* Event Details */}
                                <div className="form-section">
                                    <div className="section-header">
                                        <h3>Detalles del Evento</h3>
                                    </div>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label htmlFor="name" className="form-label">
                                                <Edit3 size={16} />
                                                Nombre del Evento
                                                <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Concierto de Rock 2024"
                                                className="form-input"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="eventoDate" className="form-label">
                                                <Calendar size={16} />
                                                Fecha del Evento
                                                <span className="required">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                id="eventoDate"
                                                name="eventoDate"
                                                value={formData.eventoDate}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split("T")[0]}
                                                className="form-input"
                                                required
                                            />
                                        </div>

                                        <div className="form-group form-group-full">
                                            <label htmlFor="descrp" className="form-label">
                                                <Edit3 size={16} />
                                                Descripción
                                                <span className="required">*</span>
                                            </label>
                                            <textarea
                                                id="descrp"
                                                name="descrp"
                                                value={formData.descrp}
                                                onChange={handleInputChange}
                                                placeholder="Describe tu evento en detalle..."
                                                rows="4"
                                                className="form-input form-textarea"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="location" className="form-label">
                                                <MapPin size={16} />
                                                Ubicación
                                                <span className="required">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="location"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder="Ej: Teatro Nacional, San José"
                                                className="form-input"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="bannerImageUrl" className="form-label">
                                                <ImageIcon size={16} />
                                                URL de la Imagen
                                            </label>
                                            <input
                                                type="url"
                                                id="bannerImageUrl"
                                                name="bannerImageUrl"
                                                value={formData.bannerImageUrl}
                                                onChange={handleInputChange}
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                className="form-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Image Preview */}
                                    {formData.bannerImageUrl && (
                                        <div className="image-preview">
                                            <h4>Vista Previa</h4>
                                            <img
                                                src={formData.bannerImageUrl || "/placeholder.svg"}
                                                alt="Preview"
                                                className="preview-image"
                                                onError={(e) => {
                                                    e.target.src = ""
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="step-actions">
                                <button type="button" onClick={() => navigate(`/evento/${id}`)} className="btn btn-secondary">
                                    <ArrowLeft size={16} />
                                    Cancelar
                                </button>
                                <button type="button" onClick={() => setStep(2)} className="btn btn-primary">
                                    Siguiente
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Seat Configuration */}
                    {step === 2 && (
                        <div className="step-content">
                            <div className="step-header">
                                <h2>
                                    <Grid3X3 size={24} />
                                    Configuración de Asientos
                                </h2>
                                <p>Ajusta las dimensiones y gestiona los asientos bloqueados</p>
                            </div>

                            <div className="form-sections">
                                {/* Matrix Configuration */}
                                <div className="form-section">
                                    <div className="section-header">
                                        <h3>Dimensiones de la Matriz</h3>
                                        <div className="capacity-info">
                                            <Users size={16} />
                                            <span>Capacidad Total: {formData.rows * formData.seatsPerRow} asientos</span>
                                        </div>
                                    </div>

                                    <div className="matrix-config">
                                        <div className="config-controls">
                                            <div className="form-group">
                                                <label htmlFor="rows" className="form-label">
                                                    Número de Filas
                                                </label>
                                                <input
                                                    type="number"
                                                    id="rows"
                                                    name="rows"
                                                    value={formData.rows}
                                                    onChange={(e) => handleMatrixChange("rows", e.target.value)}
                                                    min="1"
                                                    max="50"
                                                    className="form-input"
                                                />
                                                <span className="form-help">Filas numeradas del 1 al {formData.rows}</span>
                                            </div>

                                            <div className="form-group">
                                                <label htmlFor="seatsPerRow" className="form-label">
                                                    Asientos por Fila
                                                </label>
                                                <input
                                                    type="number"
                                                    id="seatsPerRow"
                                                    name="seatsPerRow"
                                                    value={formData.seatsPerRow}
                                                    onChange={(e) => handleMatrixChange("seatsPerRow", e.target.value)}
                                                    min="1"
                                                    max="50"
                                                    className="form-input"
                                                />
                                                <span className="form-help">Asientos numerados del 1 al {formData.seatsPerRow}</span>
                                            </div>
                                        </div>

                                        {/* Validation Info */}
                                        <div className="validation-info">
                                            <div className="info-item">
                                                <ShoppingCart size={16} />
                                                <span>No se pueden eliminar filas/columnas con asientos vendidos</span>
                                            </div>
                                            <div className="info-item">
                                                <Calendar size={16} />
                                                <span>No se puede editar la matriz si el evento ya ha iniciado</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seat Matrix */}
                                <div className="form-section">
                                    <div className="section-header">
                                        <h3>Gestión de Asientos</h3>
                                        <div className="matrix-stats">
                                            <div className="stat">
                                                <span className="stat-value">{blockedSeats.size}</span>
                                                <span className="stat-label">Bloqueados</span>
                                            </div>
                                            <div className="stat">
                                                <span className="stat-value">{occupiedSeats.size}</span>
                                                <span className="stat-label">Ocupados</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="matrix-container">
                                        <div className="matrix-instructions">
                                            <div className="instruction-item">
                                                <Settings size={16} />
                                                <span>Haz clic en los asientos para bloquear/desbloquear</span>
                                            </div>
                                            <div className="instruction-item">
                                                <AlertTriangle size={16} />
                                                <span>Los asientos ocupados (vendidos) no se pueden modificar</span>
                                            </div>
                                        </div>

                                        <SeatMatrix
                                            seatGrid={seatGrid}
                                            onSeatClick={handleSeatToggle}
                                            isAdmin={true}
                                            showBlockedSeats={true}
                                            eventoId={id}
                                            isEditing={true}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="step-actions">
                                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                                    <ArrowLeft size={16} />
                                    Anterior
                                </button>
                                <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary btn-save">
                                    {saving ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EditEvent

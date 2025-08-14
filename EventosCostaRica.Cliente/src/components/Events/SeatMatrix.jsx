"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "../../context/AuthContext"
import { eventService, seatService, getErrorMessage } from "../../services/api"
import { Eye, EyeOff, Users, MapPin, Info, AlertCircle, Loader2, RefreshCw, Settings, Ban } from "lucide-react"
import "./SeatMatrix.css"

const SeatMatrix = ({ eventoId, onSeatSelect, selectedSeats = [], isAdminMode = false, isEditing = false }) => {
    const { user, isAuthenticated } = useAuth()
    const [seatGrid, setSeatGrid] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [showAllSeats, setShowAllSeats] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const statistics = useMemo(() => {
        let total = 0
        let available = 0
        let occupied = 0
        let blocked = 0
        const selected = selectedSeats.length

        seatGrid.forEach((row) => {
            row.forEach((seat) => {
                total++
                if (seat.isOccupied) {
                    occupied++
                } else if (seat.isBlocked) {
                    blocked++
                } else if (seat.isAvailable) {
                    available++
                }
            })
        })

        const actualRows = seatGrid.length
        const actualColumns = seatGrid.length > 0 ? Math.max(...seatGrid.map((row) => row.length)) : 0

        return { total, available, occupied, blocked, selected, actualRows, actualColumns }
    }, [seatGrid, selectedSeats])

    const loadSeatGrid = useCallback(async () => {
        try {
            setLoading(true)
            setError("")

            console.log("Loading seat grid for event:", eventoId)
            const response = await eventService.getSeatGrid(eventoId)
            console.log("Seat grid response:", response)

            if (response && response.rows && Array.isArray(response.rows)) {
                const processedGrid = processSeatGridFromAPI(response)
                setSeatGrid(processedGrid)
            } else {
                throw new Error("Formato de respuesta inválido")
            }
        } catch (error) {
            console.error("Error loading seat grid:", error)
            setError(getErrorMessage(error))

            // En caso de error, crear un grid por defecto
            try {
                const eventData = await eventService.getById(eventoId)
                const defaultGrid = createDefaultGrid(eventData.rows || 10, eventData.seatsPerRow || 15)
                setSeatGrid(defaultGrid)
                setError("") // Limpiar error si pudimos crear el grid por defecto
            } catch (eventError) {
                console.error("Error loading event data:", eventError)
            }
        } finally {
            setLoading(false)
        }
    }, [eventoId])

    useEffect(() => {
        if (eventoId) {
            loadSeatGrid()
        }
    }, [eventoId, loadSeatGrid])

    const processSeatGridFromAPI = (apiResponse) => {
        const grid = []

        if (!apiResponse.rows || !Array.isArray(apiResponse.rows)) {
            return grid
        }

        apiResponse.rows.forEach((rowData) => {
            const rowSeats = []

            if (rowData.seats && Array.isArray(rowData.seats)) {
                rowData.seats.forEach((seatData) => {
                    const isSelected = selectedSeats.some((s) => s.row === seatData.row && s.column === seatData.column)

                    rowSeats.push({
                        row: seatData.row,
                        column: seatData.column,
                        type: seatData.type,
                        isBlocked: seatData.type === "Bloqueado" || seatData.type === "Blocked",
                        isOccupied: seatData.type === "Ocupado" || seatData.type === "Occupied",
                        isAvailable: seatData.type === "Disponible" || seatData.type === "Available",
                        isSelected: isSelected,
                    })
                })
            }

            // Ordenar asientos por columna
            rowSeats.sort((a, b) => a.column - b.column)
            grid.push(rowSeats)
        })

        // Ordenar filas por número de fila
        grid.sort((a, b) => {
            if (a.length > 0 && b.length > 0) {
                return a[0].row - b[0].row
            }
            return 0
        })

        return grid
    }

    const createDefaultGrid = (rows, seatsPerRow) => {
        const grid = []
        for (let row = 0; row < rows; row++) {
            const rowSeats = []
            for (let col = 0; col < seatsPerRow; col++) {
                const isSelected = selectedSeats.some((s) => s.row === row && s.column === col)

                rowSeats.push({
                    row,
                    column: col,
                    type: "Disponible",
                    isBlocked: false,
                    isOccupied: false,
                    isAvailable: true,
                    isSelected: isSelected,
                })
            }
            grid.push(rowSeats)
        }
        return grid
    }

    const handleSeatClick = async (seat) => {
        console.log("Seat clicked:", seat) // Debug log

        // No permitir interacción con asientos ocupados
        if (seat.isOccupied) {
            console.log("Seat is occupied, cannot interact")
            return
        }

        // Si es modo edición, manejar toggle de bloqueo
        if (isEditing) {
            await handleSeatToggle(seat)
            return
        }

        if (onSeatSelect && seat.isAvailable && !seat.isBlocked) {
            const newSelectedSeats = [...selectedSeats]
            const existingIndex = newSelectedSeats.findIndex((s) => s.row === seat.row && s.column === seat.column)

            if (existingIndex >= 0) {
                // Deseleccionar
                newSelectedSeats.splice(existingIndex, 1)
                console.log("Deselected seat:", seat)
            } else {
                // Seleccionar - Permitir cualquier posición válida incluyendo 0,0
                newSelectedSeats.push({ row: seat.row, column: seat.column })
                console.log("Selected seat:", seat)
            }

            // Actualizar inmediatamente el estado local
            setSeatGrid((prevGrid) =>
                prevGrid.map((row) =>
                    row.map((s) => {
                        if (s.row === seat.row && s.column === seat.column) {
                            return { ...s, isSelected: !s.isSelected }
                        }
                        // Actualizar otros asientos seleccionados
                        const isNowSelected = newSelectedSeats.some((ns) => ns.row === s.row && ns.column === s.column)
                        return { ...s, isSelected: isNowSelected }
                    }),
                ),
            )

            onSeatSelect(newSelectedSeats)
        }
    }

    const handleSeatToggle = async (seat) => {
        try {
            const eventoIdNum = Number.parseInt(eventoId, 10)
            const seatRowNum = Number.parseInt(seat.row, 10)
            const seatColumnNum = Number.parseInt(seat.column, 10)

            // Validar que los números sean válidos (permitir 0 explícitamente)
            if (isNaN(eventoIdNum) || isNaN(seatRowNum) || isNaN(seatColumnNum)) {
                console.error("Invalid seat data:", { eventoId, seat })
                setError("Error: Datos de asiento inválidos")
                return
            }

            if (eventoIdNum <= 0 || seatRowNum < 0 || seatColumnNum < 0) {
                console.error("Invalid seat coordinates:", { eventoIdNum, seatRowNum, seatColumnNum })
                setError("Error: Coordenadas de asiento inválidas")
                return
            }

            const seatData = {
                eventoId: eventoIdNum,
                seatRow: seatRowNum, // Permitir explícitamente fila 0
                seatColumn: seatColumnNum, // Permitir explícitamente columna 0
            }

            console.log("Toggling seat with data:", seatData)

            if (seat.isBlocked) {
                // Desbloquear asiento
                console.log("Attempting to unblock seat:", seatData)
                await seatService.unblockSeat(seatData)
                console.log("Seat unblocked successfully")
            } else {
                // Bloquear asiento
                console.log("Attempting to block seat:", seatData)
                await seatService.blockSeat(seatData)
                console.log("Seat blocked successfully")
            }

            // Actualizar inmediatamente el estado local
            setSeatGrid((prevGrid) =>
                prevGrid.map((row) =>
                    row.map((s) => {
                        if (s.row === seat.row && s.column === seat.column) {
                            return {
                                ...s,
                                isBlocked: !s.isBlocked,
                                isAvailable: s.isBlocked, // Si estaba bloqueado, ahora está disponible
                                type: s.isBlocked ? "Disponible" : "Bloqueado",
                            }
                        }
                        return s
                    }),
                ),
            )
        } catch (error) {
            console.error("Error toggling seat:", error)
            setError(getErrorMessage(error))
        }
    }

    const refreshGrid = async () => {
        try {
            setRefreshing(true)
            await loadSeatGrid()
        } catch (error) {
            console.error("Error refreshing grid:", error)
        } finally {
            setRefreshing(false)
        }
    }

    const getSeatClass = (seat) => {
        const classes = ["seat"]

        // Para usuarios normales, los asientos bloqueados se muestran como espacios vacíos
        if (seat.isBlocked && !showAllSeats && !isAdminMode && !isEditing) {
            classes.push("blocked-hidden")
            return classes.join(" ")
        }

        if (seat.isSelected) {
            classes.push("selected")
        } else if (seat.isOccupied) {
            classes.push("occupied")
        } else if (seat.isBlocked) {
            classes.push("blocked")
        } else if (seat.isAvailable) {
            classes.push("available")
        }

        if (isEditing && !seat.isOccupied) {
            classes.push("editable")
        }

        return classes.join(" ")
    }

    const getSeatTitle = (seat) => {
        const displayRow = seat.row + 1
        const displayColumn = seat.column + 1
        const seatNumber = displayRow * displayColumn
        const position = `Fila ${displayRow}, Asiento ${displayColumn} (Nº ${seatNumber})`

        if (seat.isBlocked && !showAllSeats && !isAdminMode && !isEditing) {
            return `${position} - No disponible`
        }

        if (seat.isSelected) {
            return `${position} - Seleccionado`
        } else if (seat.isOccupied) {
            return `${position} - Ocupado`
        } else if (seat.isBlocked) {
            return `${position} - Bloqueado`
        } else if (seat.isAvailable) {
            return `${position} - Disponible`
        }

        return position
    }

    const getSeatContent = (seat) => {
        // Para usuarios normales, los asientos bloqueados no muestran contenido
        if (seat.isBlocked && !showAllSeats && !isAdminMode && !isEditing) {
            return ""
        }
        return (seat.row + 1) * (seat.column + 1)
    }

    if (loading) {
        return (
            <div className="seat-matrix-container">
                <div className="seat-matrix-loading">
                    <Loader2 size={48} className="animate-spin loading-icon" />
                    <h3>Cargando matriz de asientos</h3>
                    <p>Obteniendo información de asientos...</p>
                </div>
            </div>
        )
    }

    if (error && seatGrid.length === 0) {
        return (
            <div className="seat-matrix-container">
                <div className="seat-matrix-error">
                    <AlertCircle size={48} className="error-icon" />
                    <h3>Error al cargar asientos</h3>
                    <p>{error}</p>
                    <button onClick={loadSeatGrid} className="btn btn-primary">
                        <RefreshCw size={16} />
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="seat-matrix-container">
            {/* Header con información */}
            <div className="seat-matrix-header">
                <div className="matrix-info">
                    <h3 className="matrix-title">
                        <MapPin size={20} />
                        {isEditing ? "Gestión de Asientos" : "Selección de Asientos"}
                        <span className="matrix-dimensions">
                            (Matriz: {statistics.actualRows} × {statistics.actualColumns})
                        </span>
                    </h3>
                    <p className="matrix-subtitle">
                        {isEditing
                            ? "Haz clic en los asientos para bloquear/desbloquear. Numeración: (fila+1)×(columna+1)"
                            : "Selecciona tus asientos preferidos. Numeración: (fila+1)×(columna+1)"}
                    </p>
                </div>

                <div className="matrix-controls">
                    {!isEditing && isAuthenticated && (
                        <button
                            onClick={() => setShowAllSeats(!showAllSeats)}
                            className={`toggle-btn ${showAllSeats ? "active" : ""}`}
                            title={showAllSeats ? "Vista normal" : "Vista administrativa"}
                        >
                            {showAllSeats ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showAllSeats ? "Vista Normal" : "Vista Admin"}
                        </button>
                    )}

                    <button onClick={refreshGrid} disabled={refreshing} className="refresh-btn" title="Actualizar matriz">
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                        {refreshing ? "Actualizando..." : "Actualizar"}
                    </button>
                </div>
            </div>

            {/* Mensajes de error */}
            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="close-btn">
                        ×
                    </button>
                </div>
            )}

            {/* Estadísticas */}
            <div className="seat-statistics">
                <div className="stat-item">
                    <Users size={16} />
                    <span className="stat-number">{statistics.total}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-item available">
                    <span className="stat-number">{statistics.available}</span>
                    <span className="stat-label">Disponibles</span>
                </div>
                <div className="stat-item occupied">
                    <span className="stat-number">{statistics.occupied}</span>
                    <span className="stat-label">Ocupados</span>
                </div>
                <div className="stat-item blocked">
                    <Ban size={16} />
                    <span className="stat-number">{statistics.blocked}</span>
                    <span className="stat-label">Bloqueados</span>
                </div>
                {statistics.selected > 0 && (
                    <div className="stat-item selected">
                        <span className="stat-number">{statistics.selected}</span>
                        <span className="stat-label">Seleccionados</span>
                    </div>
                )}
            </div>

            {/* Leyenda */}
            <div className="seat-legend">
                <div className="legend-item">
                    <div className="seat-sample available">1</div>
                    <span>Disponible</span>
                </div>
                <div className="legend-item">
                    <div className="seat-sample occupied">2</div>
                    <span>Ocupado</span>
                </div>
                {(isAdminMode || isEditing || showAllSeats) && (
                    <div className="legend-item">
                        <div className="seat-sample blocked">3</div>
                        <span>Bloqueado</span>
                    </div>
                )}
                <div className="legend-item">
                    <div className="seat-sample selected">4</div>
                    <span>Seleccionado</span>
                </div>
                {!showAllSeats && !isAdminMode && !isEditing && (
                    <div className="legend-item">
                        <div className="seat-sample blocked-hidden"></div>
                        <span>No disponible</span>
                    </div>
                )}
            </div>

            {/* Escenario */}
            <div className="stage">
                <div className="stage-content">
                    <span>ESCENARIO</span>
                </div>
            </div>

            {/* Matriz de asientos */}
            <div className="seat-grid">
                {[...seatGrid].reverse().map((row, rowIndex) => {
                    if (!row || row.length === 0) return null

                    const rowNumber = row[0]?.row ?? seatGrid.length - 1 - rowIndex

                    return (
                        <div key={rowIndex} className="seat-row">
                            <div className="row-label left">{rowNumber + 1}</div>
                            <div className="seats-container">
                                {row.map((seat, seatIndex) => {
                                    return (
                                        <button
                                            key={`${seat.row}-${seat.column}`}
                                            className={getSeatClass(seat)}
                                            onClick={() => handleSeatClick(seat)}
                                            disabled={seat.isOccupied || (seat.isBlocked && !isEditing) || refreshing}
                                            title={getSeatTitle(seat)}
                                        >
                                            {getSeatContent(seat)}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="row-label right">{rowNumber + 1}</div>
                        </div>
                    )
                })}
            </div>

            {/* Información adicional */}
            <div className="matrix-footer">
                {!isEditing && (
                    <div className="user-info">
                        <Info size={16} />
                        <span>
                            {showAllSeats || isAdminMode
                                ? "Vista administrativa: Se muestran todos los asientos incluyendo bloqueados. Numeración: (fila+1)×(columna+1)"
                                : "Vista de usuario: Los asientos bloqueados no se muestran. Numeración única por asiento: (fila+1)×(columna+1). Matriz ordenada de abajo hacia arriba."}
                        </span>
                    </div>
                )}

                {isEditing && (
                    <div className="editing-info">
                        <Settings size={16} />
                        <span>
                            Modo edición: Haz clic en los asientos para bloquear/desbloquear. Los asientos ocupados no se pueden
                            modificar. Numeración: (fila+1)×(columna+1). Matriz de abajo hacia arriba. Total bloqueados:{" "}
                            {statistics.blocked}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SeatMatrix

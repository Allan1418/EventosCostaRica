"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useAuth } from "../../context/AuthContext"
import { eventService, seatService, getErrorMessage } from "../../services/api"
import { Users, MapPin, Info, AlertCircle, Loader2, RefreshCw, Settings, Ban } from "lucide-react"
import { useRoles } from "../../hooks/useRoles"
import "./SeatMatrix.css"

const SeatMatrix = ({ eventoId, onSeatSelect, selectedSeats = [], isAdminMode = false, isEditing = false }) => {
    const { user, isAuthenticated } = useAuth()
    const { hasRole, hasPermission } = useRoles()

    const [seatGrid, setSeatGrid] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
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

            try {
                const eventData = await eventService.getById(eventoId)
                const defaultGrid = createDefaultGrid(eventData.rows || 10, eventData.seatsPerRow || 15)
                setSeatGrid(defaultGrid)
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
    }, [eventoId])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && eventoId) {
                console.log("Página visible nuevamente, recargando asientos...")
                loadSeatGrid()
            }
        }

        const handleFocus = () => {
            if (eventoId) {
                console.log("Ventana enfocada, recargando asientos...")
                loadSeatGrid()
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("focus", handleFocus)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.removeEventListener("focus", handleFocus)
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

            rowSeats.sort((a, b) => a.column - b.column)
            grid.push(rowSeats)
        })

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
        console.log("Seat clicked:", seat)

        if (seat.isOccupied) {
            console.log("Seat is occupied, cannot interact")
            return
        }

        if (isEditing) {
            await handleSeatToggle(seat)
            return
        }

        if (onSeatSelect && seat.isAvailable && !seat.isBlocked) {
            const newSelectedSeats = [...selectedSeats]
            const existingIndex = newSelectedSeats.findIndex((s) => s.row === seat.row && s.column === seat.column)

            if (existingIndex >= 0) {
                newSelectedSeats.splice(existingIndex, 1)
                console.log("Deselected seat:", seat)
            } else {
                newSelectedSeats.push({ row: seat.row, column: seat.column })
                console.log("Selected seat:", seat)
            }

            setSeatGrid((prevGrid) =>
                prevGrid.map((row) =>
                    row.map((s) => {
                        if (s.row === seat.row && s.column === seat.column) {
                            return { ...s, isSelected: !s.isSelected }
                        }
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
            const seatData = {
                eventoId: Number(eventoId),
                seatRow: Number(seat.row),
                seatColumn: Number(seat.column),
            }

            console.log("Toggling seat with data:", seatData)

            if (seat.isBlocked) {
                console.log("Attempting to unblock seat:", seatData)
                await seatService.unblockSeat(seatData)
                console.log("Seat unblocked successfully")
            } else {
                console.log("Attempting to block seat:", seatData)
                await seatService.blockSeat(seatData)
                console.log("Seat blocked successfully")
            }

            setSeatGrid((prevGrid) =>
                prevGrid.map((row) =>
                    row.map((s) => {
                        if (s.row === seat.row && s.column === seat.column) {
                            return {
                                ...s,
                                isBlocked: !s.isBlocked,
                                isAvailable: s.isBlocked,
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

    const getSeatNumber = (seat) => {
        const totalColumns = seatGrid.length > 0 ? Math.max(...seatGrid.map((row) => row.length)) : 0
        const totalRows = seatGrid.length
        // Calculate from bottom-left: (totalRows - currentRow - 1) * totalColumns + column + 1
        const rowFromBottom = totalRows - seat.row - 1
        const seatNumber = rowFromBottom * totalColumns + seat.column + 1
        return seatNumber.toString()
    }

    const getSeatClass = (seat) => {
        const classes = ["seat"]

        if (seat.isBlocked && !isEditing) {
            if (hasRole("ADMIN")) {
                classes.push("blocked-admin-view")
            } else {
                classes.push("blocked-invisible")
            }
            return classes.join(" ")
        }

        if (seat.isSelected) {
            classes.push("selected")
        } else if (seat.isOccupied) {
            classes.push("occupied")
        } else if (seat.isBlocked) {
            if (hasRole("ADMIN")) {
                classes.push("blocked-admin")
            } else {
                classes.push("blocked")
            }
        } else if (seat.isAvailable) {
            classes.push("available")
        }

        if (isEditing && !seat.isOccupied && hasPermission("MANAGE_EVENTS")) {
            classes.push("editable")
        }

        return classes.join(" ")
    }

    const getSeatTitle = (seat) => {
        const seatNumber = getSeatNumber(seat)
        const position = `Asiento ${seatNumber}`

        if (seat.isBlocked && !isEditing) {
            if (hasRole("ADMIN")) {
                return `${position} - Bloqueado (Vista Admin)`
            } else {
                return ""
            }
        }

        if (seat.isSelected) {
            return `${position} - Seleccionado`
        } else if (seat.isOccupied) {
            return `${position} - Ocupado`
        } else if (seat.isBlocked) {
            if (hasRole("ADMIN")) {
                return `${position} - Bloqueado (Admin)`
            } else {
                return `${position} - Bloqueado`
            }
        } else if (seat.isAvailable) {
            return `${position} - Disponible`
        }

        return position
    }

    const getSeatContent = (seat) => {
        if (seat.isBlocked && !isEditing) {
            if (hasRole("ADMIN")) {
                return getSeatNumber(seat)
            } else {
                return ""
            }
        }
        return getSeatNumber(seat)
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
            <div className="seat-matrix-header">
                <div className="matrix-info">
                    <h3 className="matrix-title">
                        <MapPin size={20} />
                        {isEditing ? "Gestión de Asientos" : "Selección de Asientos"}
                    </h3>
                    
                </div>

                <div className="matrix-controls">
                    <button onClick={refreshGrid} disabled={refreshing} className="refresh-btn" title="Actualizar matriz">
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                        {refreshing ? "Actualizando..." : "Actualizar"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button onClick={() => setError("")} className="close-btn">
                        ×
                    </button>
                </div>
            )}

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
                {hasRole("ADMIN") && (
                    <div className="stat-item blocked">
                        <Ban size={16} />
                        <span className="stat-number">{statistics.blocked}</span>
                        <span className="stat-label">Bloqueados</span>
                    </div>
                )}
                {statistics.selected > 0 && (
                    <div className="stat-item selected">
                        <span className="stat-number">{statistics.selected}</span>
                        <span className="stat-label">Seleccionados</span>
                    </div>
                )}
            </div>

            <div className="seat-legend">
                <div className="legend-item">
                    <div className="seat-sample available">1</div>
                    <span>Disponible</span>
                </div>
                <div className="legend-item">
                    <div className="seat-sample occupied">2</div>
                    <span>Ocupado</span>
                </div>
                {(isEditing || hasRole("ADMIN")) && (
                    <div className="legend-item">
                        <div className={`seat-sample ${hasRole("ADMIN") ? "blocked-admin" : "blocked"}`}>3</div>
                        <span>{hasRole("ADMIN") ? "Bloqueado (Admin)" : "Bloqueado"}</span>
                    </div>
                )}
                <div className="legend-item">
                    <div className="seat-sample selected">4</div>
                    <span>Seleccionado</span>
                </div>
            </div>

            <div className="stage">
                <div className="stage-content">
                    <span>ESCENARIO</span>
                </div>
            </div>

            <div className="seat-grid">
                {seatGrid.map((row, rowIndex) => {
                    if (!row || row.length === 0) return null

                    const rowNumber = row[0]?.row ?? rowIndex

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
                                            disabled={seat.isOccupied || (seat.isBlocked && !isEditing && !hasRole("ADMIN")) || refreshing}
                                            title={getSeatTitle(seat)}
                                            style={{
                                                visibility: seat.isBlocked && !isEditing && !hasRole("ADMIN") ? "hidden" : "visible",
                                            }}
                                        >
                                            {getSeatContent(seat)}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}

                <div className="column-indicators bottom">
                    {seatGrid.length > 0 &&
                        seatGrid[0].map((_, colIndex) => (
                            <div key={colIndex} className="column-label">
                                {colIndex + 1}
                            </div>
                        ))}
                </div>
            </div>

        </div>
    )
}

export default SeatMatrix

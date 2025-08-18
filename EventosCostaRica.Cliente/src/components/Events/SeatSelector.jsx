"use client"

import { useState, useEffect } from "react"
import { eventService, seatService, ticketService, getErrorMessage } from "../../services/api"
import { Users, Eye, EyeOff } from "lucide-react"
import "./SeatSelector.css"

const SeatSelector = ({ evento, onSeatSelect }) => {
    const [seatGrid, setSeatGrid] = useState([])
    const [blockedSeats, setBlockedSeats] = useState([])
    const [selectedSeats, setSelectedSeats] = useState([])
    const [purchasedSeats, setPurchasedSeats] = useState([]) // Agregar asientos comprados
    const [seatOwners, setSeatOwners] = useState({}) // Mapeo de asientos a usuarios
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [showUsers, setShowUsers] = useState(false) // Toggle para mostrar usuarios
    const [purchasing, setPurchasing] = useState(false)
    const [purchaseError, setPurchaseError] = useState("")

    useEffect(() => {
        if (evento?.id) {
            loadSeatData()
        }
    }, [evento?.id])

    useEffect(() => {
        if (onSeatSelect) {
            onSeatSelect(selectedSeats)
        }
    }, [selectedSeats, onSeatSelect])

    const loadSeatData = async () => {
        try {
            setLoading(true)
            setError("")

            // Cargar grid de asientos
            const gridData = await eventService.getSeatGrid(evento.id)
            setSeatGrid(gridData)

            // Cargar asientos bloqueados
            const blockedData = await seatService.getBlockedSeats(evento.id)
            setBlockedSeats(blockedData)

            try {
                const ticketsData = await ticketService.getByEvent(evento.id)
                const purchased = []
                const owners = {}

                if (ticketsData && Array.isArray(ticketsData)) {
                    ticketsData.forEach((ticket) => {
                        const seatKey = `${ticket.seatRow}-${ticket.seatColumn}`
                        purchased.push({ fila: ticket.seatRow, columna: ticket.seatColumn })
                        owners[seatKey] = {
                            userName: ticket.userName || "Usuario",
                            userEmail: ticket.userEmail || "",
                            purchaseDate: ticket.purchaseDate,
                        }
                    })
                }

                setPurchasedSeats(purchased)
                setSeatOwners(owners)
            } catch (ticketError) {
                console.warn("No se pudieron cargar los tickets:", ticketError)
                setPurchasedSeats([])
                setSeatOwners({})
            }
        } catch (error) {
            const errorMessage = getErrorMessage(error)
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const isSeatBlocked = (row, column) => {
        return blockedSeats.some((seat) => seat.fila === row && seat.columna === column)
    }

    const isSeatPurchased = (row, column) => {
        return purchasedSeats.some((seat) => seat.fila === row && seat.columna === column)
    }

    const isSeatSelected = (row, column) => {
        return selectedSeats.includes(`${row}-${column}`)
    }

    const getSeatOwner = (row, column) => {
        const seatKey = `${row}-${column}`
        return seatOwners[seatKey]
    }

    const handleSeatClick = async (row, column) => {
        const seatId = `${row}-${column}`

        if (isSeatBlocked(row, column) || isSeatPurchased(row, column)) {
            return
        }

        const eventoIdNum = Number(evento.id)
        const rowNum = Number(row)
        const columnNum = Number(column)

        // Validar que los números sean válidos
        if (isNaN(eventoIdNum) || isNaN(rowNum) || isNaN(columnNum)) {
            console.error("Invalid seat data:", { eventoId: evento.id, row, column })
            alert("Error: Datos de asiento inválidos")
            return
        }

        if (eventoIdNum <= 0 || rowNum < 0 || columnNum < 0) {
            console.error("Invalid seat coordinates:", { eventoIdNum, rowNum, columnNum })
            alert("Error: Coordenadas de asiento inválidas")
            return
        }

        if (isSeatSelected(row, column)) {
            // Deseleccionar asiento
            setSelectedSeats((prev) => prev.filter((id) => id !== seatId))

            // Desbloquear asiento en el servidor
            try {
                await seatService.unblockSeat({
                    eventoId: eventoIdNum,
                    seatRow: rowNum,
                    seatColumn: columnNum,
                })

                // Actualizar lista de asientos bloqueados
                setBlockedSeats((prev) => prev.filter((seat) => !(seat.fila === row && seat.columna === column)))
            } catch (error) {
                console.error("Error unblocking seat:", error)
            }
        } else {
            // Seleccionar asiento
            try {
                await seatService.blockSeat({
                    eventoId: eventoIdNum,
                    seatRow: rowNum,
                    seatColumn: columnNum,
                })

                setSelectedSeats((prev) => [...prev, seatId])

                // Actualizar lista de asientos bloqueados
                setBlockedSeats((prev) => [...prev, { eventoId: evento.id, fila: row, columna: column }])
            } catch (error) {
                const errorMessage = getErrorMessage(error)
                alert(`Error al seleccionar asiento: ${errorMessage}`)
            }
        }
    }

    const handlePurchaseSeats = async () => {
        if (selectedSeats.length === 0) {
            alert("Por favor selecciona al menos un asiento")
            return
        }

        setPurchasing(true)
        setPurchaseError("")

        try {
            console.log("[v0] Iniciando compra de asientos:", selectedSeats)

            // Comprar cada asiento seleccionado
            const purchasePromises = selectedSeats.map(async (seatId) => {
                const [row, column] = seatId.split("-").map(Number)

                console.log("[v0] Comprando asiento:", { eventoId: evento.id, seatRow: row, seatColumn: column })

                return await ticketService.create({
                    eventoId: evento.id,
                    seatRow: row,
                    seatColumn: column,
                })
            })

            const purchaseResults = await Promise.all(purchasePromises)
            console.log("[v0] Compras completadas:", purchaseResults)

            // Limpiar asientos seleccionados
            setSelectedSeats([])

            // Recargar datos para actualizar el estado
            await loadSeatData()

            alert(`¡Compra exitosa! Se compraron ${purchaseResults.length} asiento(s)`)
        } catch (error) {
            console.error("[v0] Error en compra:", error)
            const errorMessage = getErrorMessage(error)
            setPurchaseError(errorMessage)
            alert(`Error en la compra: ${errorMessage}`)
        } finally {
            setPurchasing(false)
        }
    }

    const getSeatClass = (row, column) => {
        if (isSeatSelected(row, column)) {
            return "seat selected"
        }
        if (isSeatPurchased(row, column)) {
            return "seat purchased" // Nueva clase para asientos comprados
        }
        if (isSeatBlocked(row, column)) {
            return "seat blocked-hidden" // Nueva clase para asientos bloqueados ocultos
        }
        return "seat available"
    }

    const getSeatTitle = (row, column) => {
        const displayRow = row + 1
        const displayColumn = column + 1
        // Número único basado en posición secuencial
        const seatNumber = row * evento.seatsPerRow + column + 1
        const baseTitle = `Fila ${displayRow}, Asiento ${displayColumn} (Nº ${seatNumber})`

        if (isSeatPurchased(row, column)) {
            const owner = getSeatOwner(row, column)
            if (owner && showUsers) {
                return `${baseTitle} - Comprado por: ${owner.userName}`
            }
            return `${baseTitle} - Comprado`
        }

        if (isSeatSelected(row, column)) {
            return `${baseTitle} - Seleccionado`
        }

        if (isSeatBlocked(row, column)) {
            return "" // Sin tooltip para asientos bloqueados
        }

        return `${baseTitle} - Disponible`
    }

    const renderSeatGrid = () => {
        const rows = []

        for (let row = evento.rows - 1; row >= 0; row--) {
            const seats = []

            for (let column = 0; column < evento.seatsPerRow; column++) {
                const owner = getSeatOwner(row, column)
                const seatNumber = row * evento.seatsPerRow + column + 1

                if (isSeatBlocked(row, column)) {
                    seats.push(
                        <div key={`${row}-${column}`} className="seat-empty-space" title="">
                            {/* Espacio completamente vacío */}
                        </div>,
                    )
                } else {
                    seats.push(
                        <button
                            key={`${row}-${column}`}
                            className={getSeatClass(row, column)}
                            onClick={() => handleSeatClick(row, column)}
                            disabled={isSeatPurchased(row, column)}
                            title={getSeatTitle(row, column)}
                        >
                            {showUsers && owner ? (
                                <span className="seat-user-initial">{owner.userName.charAt(0).toUpperCase()}</span>
                            ) : (
                                seatNumber
                            )}
                        </button>,
                    )
                }
            }

            rows.push(
                <div key={row} className="seat-row">
                    <div className="row-label">{row + 1}</div>
                    <div className="seats">{seats}</div>
                </div>,
            )
        }

        return rows
    }

    if (loading) {
        return (
            <div className="seat-selector-container">
                <div className="seat-selector-loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando asientos...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="seat-selector-container">
                <div className="seat-selector-error">
                    <h3>Error al cargar asientos</h3>
                    <p>{error}</p>
                    <button onClick={loadSeatData} className="retry-button">
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="seat-selector-container">
            <div className="seat-selector-header">
                <h3 className="seat-selector-title">
                    Seleccionar Asientos
                    <span className="capacity-info">
                        (Matriz: {evento.rows} × {evento.seatsPerRow} = {evento.rows * evento.seatsPerRow} asientos)
                    </span>
                </h3>

                <div className="header-controls">
                    <button
                        onClick={() => setShowUsers(!showUsers)}
                        className={`toggle-users-btn ${showUsers ? "active" : ""}`}
                        title={showUsers ? "Ocultar usuarios" : "Mostrar usuarios"}
                    >
                        {showUsers ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showUsers ? "Ocultar Usuarios" : "Mostrar Usuarios"}
                    </button>
                </div>

                <div className="seat-legend">
                    <div className="legend-item">
                        <div className="seat available"></div>
                        <span>Disponible</span>
                    </div>
                    <div className="legend-item">
                        <div className="seat selected"></div>
                        <span>Seleccionado</span>
                    </div>
                    <div className="legend-item">
                        <div className="seat purchased"></div>
                        <span>Comprado</span>
                    </div>
                </div>
            </div>

            <div className="seat-selector-stage">
                <div className="stage">ESCENARIO</div>
            </div>

            <div className="seat-grid">{renderSeatGrid()}</div>

            <div className="seat-statistics">
                <div className="stat-item">
                    <Users size={16} />
                    <span>Total: {evento.rows * evento.seatsPerRow}</span>
                </div>
                <div className="stat-item available">
                    <span>Disponibles: {evento.rows * evento.seatsPerRow - purchasedSeats.length}</span>
                </div>
                <div className="stat-item purchased">
                    <span>Comprados: {purchasedSeats.length}</span>
                </div>
            </div>

            {selectedSeats.length > 0 && (
                <div className="seat-selector-summary">
                    <h4>Asientos Seleccionados: {selectedSeats.length}</h4>
                    <div className="selected-seats-list">
                        {selectedSeats.map((seatId) => {
                            const [row, column] = seatId.split("-").map(Number)
                            const seatNumber = row * evento.seatsPerRow + column + 1
                            return (
                                <span key={seatId} className="selected-seat-tag">
                                    Fila {row + 1}, Asiento {column + 1} (Nº {seatNumber})
                                </span>
                            )
                        })}
                    </div>

                    <div className="purchase-section">
                        {purchaseError && (
                            <div className="purchase-error">
                                <p>{purchaseError}</p>
                            </div>
                        )}
                        <button
                            onClick={handlePurchaseSeats}
                            disabled={purchasing || selectedSeats.length === 0}
                            className={`purchase-button ${purchasing ? "purchasing" : ""}`}
                        >
                            {purchasing ? (
                                <>
                                    <div className="purchase-spinner"></div>
                                    Comprando...
                                </>
                            ) : (
                                `Comprar ${selectedSeats.length} Asiento${selectedSeats.length > 1 ? "s" : ""}`
                            )}
                        </button>
                    </div>
                </div>
            )}

            {showUsers && Object.keys(seatOwners).length > 0 && (
                <div className="users-list">
                    <h4>Usuarios con Asientos Comprados:</h4>
                    <div className="users-grid">
                        {Object.entries(seatOwners).map(([seatKey, owner]) => {
                            const [row, column] = seatKey.split("-").map(Number)
                            const seatNumber = row * evento.seatsPerRow + column + 1
                            return (
                                <div key={seatKey} className="user-item">
                                    <div className="user-avatar">{owner.userName.charAt(0).toUpperCase()}</div>
                                    <div className="user-info">
                                        <span className="user-name">{owner.userName}</span>
                                        <span className="user-seat">
                                            Fila {row + 1}, Asiento {column + 1} (Nº {seatNumber})
                                        </span>
                                        {owner.userEmail && <span className="user-email">{owner.userEmail}</span>}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SeatSelector

"use client"

import { useState, useEffect } from "react"
import { useCart } from "../../context/CartContext"
import api from "../../services/api"
import "./SeatSelector.css"

const SeatSelector = ({ evento }) => {
    const { selectedSeats, setSelectedSeats } = useCart()
    const [seatGrid, setSeatGrid] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSeatGrid()
    }, [evento.id])

    const loadSeatGrid = async () => {
        try {
            const response = await api.get(`/evento/${evento.id}/grid`)
            setSeatGrid(response.data)
            setLoading(false)
        } catch (error) {
            console.error("Error loading seat grid:", error)
            generateFallbackGrid()
            setLoading(false)
        }
    }

    const generateFallbackGrid = () => {
        const rows = []
        for (let i = 0; i < (evento.rows || 8); i++) {
            const seats = []
            for (let j = 0; j < (evento.seatsPerRow || 10); j++) {
                seats.push({
                    row: i + 1,
                    column: j + 1,
                    type: "Disponible",
                })
            }
            rows.push({
                row: i + 1,
                seats: seats,
            })
        }
        setSeatGrid({ idEvento: evento.id, rows: rows })
    }

    const calculateSeatPosition = (row, column) => {
        return (row + 1) * (column + 1)
    }

    const handleSeatClick = async (seatData) => {
        const seatId = `${seatData.row}-${seatData.column}`
        const seatPosition = calculateSeatPosition(seatData.row - 1, seatData.column - 1)

        if (seatData.type !== "Disponible") {
            return
        }

        try {
            if (selectedSeats.includes(seatId)) {
                await api.delete("/blockedseat", {
                    data: {
                        eventoId: evento.id,
                        seatRow: seatData.row,
                        seatColumn: seatData.column,
                    },
                })
                setSelectedSeats((prev) => prev.filter((s) => s !== seatId))
            } else {
                await api.post("/blockedseat", {
                    eventoId: evento.id,
                    seatRow: seatData.row,
                    seatColumn: seatData.column,
                })
                setSelectedSeats((prev) => [...prev, seatId])
            }
            // Recargar grid para obtener estado actualizado
            await loadSeatGrid()
        } catch (error) {
            console.error("Error blocking/unblocking seat:", error)
            alert("Error al seleccionar asiento. Intenta de nuevo.")
        }
    }

    const getSeatClass = (seat) => {
        let className = "seat"
        if (seat.type === "Bloqueado") {
            className += " seat-blocked"
        } else if (seat.type === "Ocupado") {
            className += " seat-occupied"
        } else if (selectedSeats.includes(`${seat.row}-${seat.column}`)) {
            className += " seat-selected"
        } else {
            className += " seat-available"
        }
        return className
    }

    const getRowLabel = (rowNumber) => {
        return String.fromCharCode(64 + rowNumber) // A, B, C, etc.
    }

    if (loading) {
        return (
            <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    if (!seatGrid || !seatGrid.rows || seatGrid.rows.length === 0) {
        return <div className="no-seats-available">No hay informacion de asientos disponible para este evento.</div>
    }

    return (
        <div className="seat-selector-container">
            <h3 className="seat-selector-title">Selecciona tus asientos</h3>

            <div className="seat-legend">
                <div className="seat-legend-item">
                    <div className="seat-legend-color seat-available"></div>
                    <span>Disponible</span>
                </div>
                <div className="seat-legend-item">
                    <div className="seat-legend-color seat-selected"></div>
                    <span>Seleccionado</span>
                </div>
                <div className="seat-legend-item">
                    <div className="seat-legend-color seat-occupied"></div>
                    <span>Ocupado</span>
                </div>
                <div className="seat-legend-item">
                    <div className="seat-legend-color seat-blocked"></div>
                    <span>Bloqueado</span>
                </div>
            </div>

            <div className="seat-stage">ESCENARIO</div>

            <div className="seats-grid">
                {seatGrid.rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="seat-row">
                        <span className="seat-row-label">{getRowLabel(row.row)}</span>
                        <div className="seat-row-buttons">
                            {row.seats.map((seat) => (
                                <button
                                    key={`${seat.row}-${seat.column}`}
                                    className={getSeatClass(seat)}
                                    onClick={() => handleSeatClick(seat)}
                                    disabled={seat.type !== "Disponible" && !selectedSeats.includes(`${seat.row}-${seat.column}`)}
                                    title={`Fila ${getRowLabel(seat.row)}, Asiento ${seat.column} (${seat.type}) - Posicion: ${calculateSeatPosition(seat.row - 1, seat.column - 1)}`}
                                >
                                    {seat.column}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedSeats.length > 0 && (
                <div className="selected-seats-summary">
                    <h4 className="selected-seats-count">Asientos seleccionados: {selectedSeats.length}</h4>
                    <div className="selected-seats-list">
                        {selectedSeats.map((seat) => {
                            const [row, column] = seat.split("-").map(Number)
                            const position = calculateSeatPosition(row - 1, column - 1)
                            return (
                                <span key={seat} className="selected-seat-tag">
                                    Fila {getRowLabel(row)}, Asiento {column} (Pos: {position})
                                </span>
                            )
                        })}
                    </div>
                    <div className="selected-seats-total">
                        Total: ₡{(selectedSeats.length * (evento.precio || 15000)).toLocaleString()}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SeatSelector

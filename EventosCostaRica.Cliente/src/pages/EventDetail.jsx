"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Calendar, MapPin, Clock, Users, Grid, Settings } from "lucide-react"
import api from "../services/api"
import "./CreateEvent.css"

const CreateEvent = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const [eventData, setEventData] = useState({
    nombre: "",
    descripcion: "",
    fechaEvento: "",
    ubicacion: "",
    bannerImageUrl: "",
    rows: "8",
    seatsPerRow: "10",
  })

  const [seatMatrix, setSeatMatrix] = useState(null)
  const [showMatrix, setShowMatrix] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  const calculateSeatPosition = (row, column) => {
    return (row + 1) * (column + 1)
  }

  const generateSeatMatrix = () => {
    const rows = Number.parseInt(eventData.rows)
    const seatsPerRow = Number.parseInt(eventData.seatsPerRow)
    const matrix = []

    for (let i = 0; i < rows; i++) {
      const rowLetter = String.fromCharCode(65 + i) // A, B, C, etc.
      const row = {
        row: i + 1,
        rowLetter: rowLetter,
        seats: [],
      }

      for (let j = 0; j < seatsPerRow; j++) {
        const position = calculateSeatPosition(i, j)
        row.seats.push({
          row: i + 1,
          column: j + 1,
          position: position,
          type: "Disponible",
          blocked: false,
        })
      }
      matrix.push(row)
    }

    setSeatMatrix(matrix)
    setShowMatrix(true)
  }

  const toggleSeatBlock = (rowIndex, seatIndex) => {
    const newMatrix = [...seatMatrix]
    const seat = newMatrix[rowIndex].seats[seatIndex]
    seat.blocked = !seat.blocked
    seat.type = seat.blocked ? "Bloqueado" : "Disponible"
    setSeatMatrix(newMatrix)
  }

  const getSeatClass = (seat) => {
    return `seat ${seat.blocked ? "seat-blocked" : "seat-available"}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const eventPayload = {
        nombre: eventData.nombre,
        descripcion: eventData.descripcion,
        fechaEvento: new Date(eventData.fechaEvento).toISOString(),
        ubicacion: eventData.ubicacion,
        bannerImageUrl: eventData.bannerImageUrl || null,
      }

      const response = await api.post("/evento", eventPayload)

      alert("Evento creado exitosamente!")
      navigate(`/event/${response.data.id}`)
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Error al crear el evento: " + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h1 className="create-event-title">Crear Nuevo Evento</h1>
        <p className="create-event-subtitle">Configura todos los detalles de tu evento</p>
      </div>

      <form onSubmit={handleSubmit} className="create-event-form">
        <div className="form-grid">
          <div className="form-section">
            <h2 className="section-title">
              <Calendar className="section-icon" />
              Informacion del Evento
            </h2>

            <div className="form-group">
              <label className="form-label">Nombre del Evento</label>
              <input
                type="text"
                value={eventData.nombre}
                onChange={(e) => setEventData({ ...eventData, nombre: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripcion</label>
              <textarea
                value={eventData.descripcion}
                onChange={(e) => setEventData({ ...eventData, descripcion: e.target.value })}
                className="form-textarea"
                rows="4"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <MapPin className="form-icon" />
                  Ubicacion
                </label>
                <input
                  type="text"
                  value={eventData.ubicacion}
                  onChange={(e) => setEventData({ ...eventData, ubicacion: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock className="form-icon" />
                  Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  value={eventData.fechaEvento}
                  onChange={(e) => setEventData({ ...eventData, fechaEvento: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">URL de Imagen (Opcional)</label>
              <input
                type="url"
                value={eventData.bannerImageUrl}
                onChange={(e) => setEventData({ ...eventData, bannerImageUrl: e.target.value })}
                className="form-input"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">
              <Grid className="section-icon" />
              Configuracion de Asientos
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <Users className="form-icon" />
                  Numero de Filas
                </label>
                <input
                  type="number"
                  value={eventData.rows}
                  onChange={(e) => setEventData({ ...eventData, rows: e.target.value })}
                  className="form-input"
                  min="1"
                  max="20"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Asientos por Fila</label>
                <input
                  type="number"
                  value={eventData.seatsPerRow}
                  onChange={(e) => setEventData({ ...eventData, seatsPerRow: e.target.value })}
                  className="form-input"
                  min="1"
                  max="50"
                  required
                />
              </div>
            </div>

            <div className="capacity-info">
              <div className="capacity-card">
                <Users className="capacity-icon" />
                <div>
                  <div className="capacity-number">{eventData.rows * eventData.seatsPerRow}</div>
                  <div className="capacity-label">Capacidad Total</div>
                </div>
              </div>
            </div>

            <button type="button" onClick={generateSeatMatrix} className="generate-matrix-btn">
              <Grid className="btn-icon" />
              Generar Matriz de Asientos
            </button>
          </div>
        </div>

        {showMatrix && seatMatrix && (
          <div className="seat-matrix-section">
            <h2 className="section-title">
              <Settings className="section-icon" />
              Matriz de Asientos - Bloquear/Desbloquear
            </h2>

            <div className="matrix-legend">
              <div className="legend-item">
                <div className="legend-color seat-available"></div>
                <span>Disponible</span>
              </div>
              <div className="legend-item">
                <div className="legend-color seat-blocked"></div>
                <span>Bloqueado</span>
              </div>
            </div>

            <div className="seat-stage">ESCENARIO</div>

            <div className="seats-matrix">
              {seatMatrix.map((row, rowIndex) => (
                <div key={rowIndex} className="matrix-row">
                  <span className="matrix-row-label">{row.rowLetter}</span>
                  <div className="matrix-row-seats">
                    {row.seats.map((seat, seatIndex) => (
                      <button
                        key={`${seat.row}-${seat.column}`}
                        type="button"
                        className={getSeatClass(seat)}
                        onClick={() => toggleSeatBlock(rowIndex, seatIndex)}
                        title={`Fila ${row.rowLetter}, Asiento ${seat.column} - Posicion: ${seat.position} - Click para ${seat.blocked ? "desbloquear" : "bloquear"}`}
                      >
                        {seat.column}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="matrix-stats">
              <div className="stat-card">
                <div className="stat-number">
                  {seatMatrix.reduce((total, row) => total + row.seats.filter((seat) => !seat.blocked).length, 0)}
                </div>
                <div className="stat-label">Asientos Disponibles</div>
              </div>
              <div className="stat-card blocked">
                <div className="stat-number">
                  {seatMatrix.reduce((total, row) => total + row.seats.filter((seat) => seat.blocked).length, 0)}
                </div>
                <div className="stat-label">Asientos Bloqueados</div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/")} className="cancel-btn">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creando..." : "Crear Evento"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateEvent

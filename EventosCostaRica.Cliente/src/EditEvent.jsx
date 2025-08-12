"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import api from "../services/api"
import "./CreateEvent.css"

const EditEvent = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        fechaEvento: "",
        ubicacion: "",
        bannerImageUrl: "",
    })

    useEffect(() => {
        if (!user) {
            navigate("/login")
            return
        }
        fetchEvento()
    }, [id, user, navigate])

    const fetchEvento = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/evento/${id}`)
            const evento = response.data

            const fechaFormateada = new Date(evento.fechaEvento).toISOString().slice(0, 16)

            setFormData({
                nombre: evento.nombre,
                descripcion: evento.descripcion,
                fechaEvento: fechaFormateada,
                ubicacion: evento.ubicacion,
                bannerImageUrl: evento.bannerImageUrl || "",
            })
        } catch (error) {
            console.error("Error fetching event:", error)
            alert("Error al cargar el evento")
            navigate("/")
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setUpdating(true)
        try {
            const eventData = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                fechaEvento: new Date(formData.fechaEvento).toISOString(),
                ubicacion: formData.ubicacion,
                bannerImageUrl: formData.bannerImageUrl || null,
            }

            await api.put(`/evento/${id}`, eventData)

            alert("Evento actualizado exitosamente")
            navigate(`/event/${id}`)
        } catch (error) {
            console.error("Error updating event:", error)
            alert("Error al actualizar el evento: " + (error.response?.data?.message || error.message))
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="create-event-page">
                <div className="create-event-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando evento...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="create-event-page">
            <div className="create-event-container">
                <div className="create-event-header">
                    <h1>Editar Evento</h1>
                    <p>Actualiza la informacion de tu evento</p>
                </div>

                <form onSubmit={handleSubmit} className="create-event-form">
                    <div className="form-section">
                        <h3>Informacion Basica</h3>

                        <div className="form-group">
                            <label htmlFor="nombre">Nombre del Evento *</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                                placeholder="Ingresa el nombre del evento"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="descripcion">Descripcion *</label>
                            <textarea
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                                required
                                rows="4"
                                placeholder="Describe tu evento"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="fechaEvento">Fecha del Evento *</label>
                                <input
                                    type="datetime-local"
                                    id="fechaEvento"
                                    name="fechaEvento"
                                    value={formData.fechaEvento}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="ubicacion">Ubicacion *</label>
                                <input
                                    type="text"
                                    id="ubicacion"
                                    name="ubicacion"
                                    value={formData.ubicacion}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ubicacion del evento"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="bannerImageUrl">URL de Imagen (Opcional)</label>
                            <input
                                type="url"
                                id="bannerImageUrl"
                                name="bannerImageUrl"
                                value={formData.bannerImageUrl}
                                onChange={handleInputChange}
                                placeholder="https://ejemplo.com/imagen.jpg"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate(`/event/${id}`)} className="btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" disabled={updating} className="btn-primary">
                            {updating ? "Actualizando..." : "Actualizar Evento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditEvent

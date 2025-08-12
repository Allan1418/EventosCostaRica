"use client"

import { useState, useEffect } from "react"
import { eventosAPI } from "../services/api"
import EventCard from "../components/Events/EventCard"
import { Search, Filter } from "lucide-react"
import "./Home.css"

const Home = () => {
    const [eventos, setEventos] = useState([])
    const [filteredEventos, setFilteredEventos] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("fecha")

    useEffect(() => {
        loadEventos()
    }, [])

    useEffect(() => {
        filterAndSortEventos()
    }, [eventos, searchTerm, sortBy])

    const loadEventos = async () => {
        try {
            const response = await eventosAPI.getAll()
            const eventosConPrecio = response.data.map((evento) => ({
                ...evento,
                precio: evento.precio || 15000, // Precio base de ₡15,000 si no tiene precio
            }))
            setEventos(eventosConPrecio)
            setLoading(false)
        } catch (error) {
            console.error("Error loading events:", error)
            setLoading(false)
        }
    }

    const filterAndSortEventos = () => {
        const filtered = eventos.filter(
            (evento) =>
                evento.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                evento.descrp.toLowerCase().includes(searchTerm.toLowerCase()) ||
                evento.location.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        // Sort events
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "fecha":
                    return new Date(a.eventoDate) - new Date(b.eventoDate)
                case "precio":
                    return a.precio - b.precio
                case "nombre":
                    return a.name.localeCompare(b.name)
                default:
                    return 0
            }
        })

        setFilteredEventos(filtered)
    }

    if (loading) {
        return (
            <div className="home-loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Cargando eventos increibles...</p>
            </div>
        )
    }

    return (
        <div className="home-page-container">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Descubre los Mejores Eventos</h1>
                    <p className="hero-subtitle">En Costa Rica, tu proxima experiencia inolvidable te espera</p>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="search-filter-section">
                <div className="search-filter-card">
                    <div className="search-filter-controls">
                        <div className="search-input-wrapper">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Buscar eventos..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-select-wrapper">
                            <Filter className="filter-icon" />
                            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="fecha">Ordenar por fecha</option>
                                <option value="precio">Ordenar por precio</option>
                                <option value="nombre">Ordenar por nombre</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                {filteredEventos.length === 0 ? (
                    <div className="no-events-found">
                        <h3 className="no-events-title">No se encontraron eventos</h3>
                        <p className="no-events-message">Intenta con otros terminos de busqueda o revisa mas tarde.</p>
                    </div>
                ) : (
                    <div className="events-grid">
                        {filteredEventos.map((evento) => (
                            <EventCard key={evento.id} evento={evento} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Home

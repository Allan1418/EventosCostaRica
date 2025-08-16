"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useRoles } from "../hooks/useRoles"
import { eventService, getErrorMessage } from "../services/api"
import EventCard from "../components/Events/EventCard"
import { Search, Calendar, Filter, Plus, Sparkles, RefreshCw, MapPin, AlertCircle, Loader2 } from "lucide-react"
import "./Home.css"

const Home = () => {
    const { user, isAuthenticated } = useAuth()
    const { isAdmin } = useRoles()
    const [events, setEvents] = useState([])
    const [filteredEvents, setFilteredEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedLocation, setSelectedLocation] = useState("")
    const [dateFilter, setDateFilter] = useState("")
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        loadEvents()
    }, [])

    useEffect(() => {
        filterEvents()
    }, [events, searchTerm, selectedLocation, dateFilter])

    const loadEvents = async () => {
        try {
            setLoading(true)
            setError("")
            console.log("Loading events...")

            const data = await eventService.getAll()
            console.log("Events loaded from API:", data)

            // Asegurar que data es un array
            const eventsArray = Array.isArray(data) ? data : []
            console.log("Events array processed:", eventsArray)

            setEvents(eventsArray)
            console.log("Events state updated with:", eventsArray.length, "events")
        } catch (error) {
            console.error("Error loading events:", error)
            const errorMessage = getErrorMessage(error)
            setError(errorMessage)
            setEvents([]) // Asegurar que events sea un array vacío en caso de error
        } finally {
            setLoading(false)
        }
    }

    const filterEvents = () => {
        console.log("Filtering events. Total events:", events.length)
        let filtered = [...events]

        // Filtro por término de búsqueda
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase().trim()
            filtered = filtered.filter(
                (event) =>
                    event.name?.toLowerCase().includes(searchLower) ||
                    event.descrp?.toLowerCase().includes(searchLower) ||
                    event.location?.toLowerCase().includes(searchLower),
            )
        }

        // Filtro por ubicación
        if (selectedLocation.trim()) {
            const locationLower = selectedLocation.toLowerCase().trim()
            filtered = filtered.filter((event) => event.location?.toLowerCase().includes(locationLower))
        }

        // Filtro por fecha
        if (dateFilter) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            filtered = filtered.filter((event) => {
                if (!event.eventoDate) return false

                const eventDate = new Date(event.eventoDate)
                eventDate.setHours(0, 0, 0, 0)

                switch (dateFilter) {
                    case "today":
                        return eventDate.getTime() === today.getTime()
                    case "week":
                        const weekFromNow = new Date(today)
                        weekFromNow.setDate(today.getDate() + 7)
                        return eventDate >= today && eventDate <= weekFromNow
                    case "month":
                        const monthFromNow = new Date(today)
                        monthFromNow.setMonth(today.getMonth() + 1)
                        return eventDate >= today && eventDate <= monthFromNow
                    case "upcoming":
                        return eventDate >= today
                    default:
                        return true
                }
            })
        }

        // Ordenar por fecha (próximos primero)
        filtered.sort((a, b) => {
            const dateA = new Date(a.eventoDate || 0)
            const dateB = new Date(b.eventoDate || 0)
            return dateA - dateB
        })

        console.log("Filtered events:", filtered.length)
        setFilteredEvents(filtered)
    }

    const getUniqueLocations = () => {
        const locations = events
            .map((event) => event.location)
            .filter(Boolean)
            .filter((location, index, arr) => arr.indexOf(location) === index)
        return locations.sort()
    }

    const clearFilters = () => {
        setSearchTerm("")
        setSelectedLocation("")
        setDateFilter("")
    }

    const refreshEvents = async () => {
        try {
            setRefreshing(true)
            await loadEvents()
        } catch (error) {
            console.error("Error refreshing events:", error)
        } finally {
            setRefreshing(false)
        }
    }

    const getEventStats = () => {
        const now = new Date()
        const stats = {
            total: events.length,
            upcoming: 0,
            today: 0,
            thisWeek: 0,
            locations: getUniqueLocations().length,
        }

        events.forEach((event) => {
            if (!event.eventoDate) return

            const eventDate = new Date(event.eventoDate)
            const diffTime = eventDate - now
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays >= 0) {
                stats.upcoming++
                if (diffDays === 0) stats.today++
                if (diffDays <= 7) stats.thisWeek++
            }
        })

        return stats
    }

    if (loading) {
        return (
            <div className="home-container">
                <div className="home-loading">
                    <Loader2 size={48} className="animate-spin loading-icon" />
                    <h3>Cargando eventos increíbles</h3>
                    <p className="loading-text">Preparando la mejor experiencia para ti...</p>
                </div>
            </div>
        )
    }

    if (error && events.length === 0) {
        return (
            <div className="home-container">
                <div className="home-error">
                    <AlertCircle size={48} className="error-icon" />
                    <h2>Error al cargar eventos</h2>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={loadEvents} className="btn btn-primary">
                            <RefreshCw size={16} />
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const stats = getEventStats()

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Descubre Eventos Increíbles en Costa Rica</h1>
                    <p className="hero-subtitle">
                        Conecta con experiencias únicas, desde conciertos hasta conferencias. Tu próxima aventura te está esperando.
                    </p>

                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <>
                                {isAdmin() && (
                                    <Link to="/crear-evento" className="hero-btn btn-primary">
                                        <Plus size={20} />
                                        Crear Evento
                                    </Link>
                                )}
                                <Link to="/perfil" className="hero-btn btn-secondary">
                                    <Calendar size={20} />
                                    Mi Perfil
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register" className="hero-btn btn-primary">
                                    <Sparkles size={20} />
                                    Comenzar Ahora
                                </Link>
                                <Link to="/login" className="hero-btn btn-secondary">
                                    <Calendar size={20} />
                                    Iniciar Sesión
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Eventos Totales</span>
                        </div>
                        <div className="hero-stat">
                            <span className="stat-number">{stats.upcoming}</span>
                            <span className="stat-label">Próximos</span>
                        </div>
                        <div className="hero-stat">
                            <span className="stat-number">{stats.locations}</span>
                            <span className="stat-label">Ubicaciones</span>
                        </div>
                        {stats.today > 0 && (
                            <div className="hero-stat">
                                <span className="stat-number">{stats.today}</span>
                                <span className="stat-label">¡Hoy!</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="search-section">
                <div className="search-container">
                    <div className="search-header">
                        <h2 className="search-title">Encuentra tu evento perfecto</h2>
                        <p className="search-subtitle">Usa nuestros filtros para descubrir exactamente lo que buscas</p>

                        <button
                            onClick={refreshEvents}
                            disabled={refreshing}
                            className="refresh-events-btn"
                            title="Actualizar eventos"
                        >
                            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                            {refreshing ? "Actualizando..." : "Actualizar"}
                        </button>
                    </div>

                    <div className="search-filters">
                        <div className="filters-grid">
                            <div className="search-box">
                                <Search className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Buscar eventos, artistas, ubicaciones..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm("")} className="clear-search-btn" title="Limpiar búsqueda">
                                        ×
                                    </button>
                                )}
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">
                                    <MapPin className="filter-icon" />
                                    Ubicación
                                </label>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="">Todas las ubicaciones</option>
                                    {getUniqueLocations().map((location) => (
                                        <option key={location} value={location}>
                                            {location}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label">
                                    <Calendar className="filter-icon" />
                                    Fecha
                                </label>
                                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select">
                                    <option value="">Todas las fechas</option>
                                    <option value="today">Hoy</option>
                                    <option value="week">Esta semana</option>
                                    <option value="month">Este mes</option>
                                    <option value="upcoming">Próximos</option>
                                </select>
                            </div>

                            <button
                                onClick={clearFilters}
                                className="clear-filters-btn"
                                disabled={!searchTerm && !selectedLocation && !dateFilter}
                            >
                                <Filter className="clear-icon" />
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Events Section */}
            <section className="events-section">
                <div className="events-container">
                    <div className="events-header">
                        <div>
                            <h2 className="events-title">
                                {filteredEvents.length > 0 ? "Eventos Disponibles" : "No se encontraron eventos"}
                            </h2>
                            <p className="events-count">
                                {filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}
                                {searchTerm || selectedLocation || dateFilter ? " encontrado" : " disponible"}
                                {filteredEvents.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        {isAdmin() && (
                            <Link to="/crear-evento" className="create-event-btn">
                                <Plus className="create-icon" />
                                Crear Evento
                            </Link>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                            <button onClick={() => setError("")} className="close-btn">
                                ×
                            </button>
                        </div>
                    )}

                    {filteredEvents.length === 0 ? (
                        <div className="no-events">
                            <Calendar className="no-events-icon" />
                            <h3>No se encontraron eventos</h3>
                            <p>
                                {searchTerm || selectedLocation || dateFilter
                                    ? "Intenta cambiar los filtros de búsqueda para encontrar más eventos"
                                    : events.length === 0
                                        ? "Aún no hay eventos creados en la plataforma"
                                        : "Todos los eventos están filtrados"}
                            </p>
                            <div className="no-events-actions">
                                {(searchTerm || selectedLocation || dateFilter) && (
                                    <button onClick={clearFilters} className="btn btn-secondary">
                                        <Filter size={18} />
                                        Limpiar Filtros
                                    </button>
                                )}
                                {isAdmin() && (
                                    <Link to="/crear-evento" className="btn btn-primary">
                                        <Plus size={18} />
                                        {events.length === 0 ? "Crear Primer Evento" : "Crear Evento"}
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {filteredEvents.map((event) => (
                                <EventCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}

export default Home

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import { ticketService, eventService, getErrorMessage } from "../services/api"
import {
    Ticket,
    Calendar,
    MapPin,
    RefreshCw,
    ArrowLeft,
    AlertCircle,
    User,
    Eye,
    ExternalLink,
    Filter,
    Search,
    Zap,
    TrendingUp,
} from "lucide-react"

const MyTickets = () => {
    const [tickets, setTickets] = useState([])
    const [events, setEvents] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [refreshing, setRefreshing] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")

    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }
        loadTickets()
    }, [isAuthenticated, navigate])

    const loadTickets = async () => {
        try {
            setLoading(true)
            setError("")

            const ticketsData = await ticketService.getMyTickets()
            const ticketsArray = Array.isArray(ticketsData) ? ticketsData : []
            setTickets(ticketsArray)

            const eventIds = [...new Set(ticketsArray.map((ticket) => ticket.eventoId).filter(Boolean))]
            const eventsData = {}

            for (const eventId of eventIds) {
                try {
                    const eventData = await eventService.getById(eventId)
                    eventsData[eventId] = eventData
                } catch (eventError) {
                    console.warn(`Error loading event ${eventId}:`, eventError)
                    eventsData[eventId] = ticketsArray.find((t) => t.eventoId === eventId)?.evento || null
                }
            }

            setEvents(eventsData)
        } catch (error) {
            console.error("Error loading tickets:", error)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        try {
            setRefreshing(true)
            await loadTickets()
        } catch (error) {
            console.error("Error refreshing tickets:", error)
        } finally {
            setRefreshing(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Fecha no disponible"

        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("es-CR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        } catch (error) {
            return "Fecha no disponible"
        }
    }

    const formatShortDate = (dateString) => {
        if (!dateString) return "N/A"
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("es-CR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            })
        } catch (error) {
            return "N/A"
        }
    }

    const formatTime = (dateString) => {
        if (!dateString) return "Hora no disponible"

        try {
            const date = new Date(dateString)
            return date.toLocaleTimeString("es-CR", {
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Hora no disponible"
        }
    }

    const formatPrice = (price) => {
        if (!price && price !== 0) return "₡15,000"
        return new Intl.NumberFormat("es-CR", {
            style: "currency",
            currency: "CRC",
            minimumFractionDigits: 0,
        }).format(price)
    }

    const getEventStatus = (eventDate) => {
        if (!eventDate)
            return { status: "unknown", label: "Estado desconocido", className: "bg-muted text-muted-foreground" }

        try {
            const now = new Date()
            const eventDateTime = new Date(eventDate)
            const diffTime = eventDateTime - now
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays < 0) {
                return { status: "past", label: "Finalizado", className: "bg-muted text-muted-foreground" }
            } else if (diffDays === 0) {
                return { status: "today", label: "¡Hoy!", className: "bg-accent text-accent-foreground animate-pulse-soft" }
            } else if (diffDays <= 7) {
                return { status: "soon", label: `En ${diffDays} día(s)`, className: "bg-primary/10 text-primary" }
            } else {
                return { status: "upcoming", label: "Próximo", className: "bg-secondary text-secondary-foreground" }
            }
        } catch (error) {
            return { status: "unknown", label: "Estado desconocido", className: "bg-muted text-muted-foreground" }
        }
    }

    const getDaysUntilEvent = (eventDate) => {
        if (!eventDate) return null
        try {
            const now = new Date()
            const eventDateTime = new Date(eventDate)
            const diffTime = eventDateTime - now
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays
        } catch (error) {
            return null
        }
    }

    const getUpcomingEvents = () => {
        return tickets.filter((ticket) => {
            const eventDate = events[ticket.eventoId]?.eventoDate || ticket.evento?.eventoDate
            if (!eventDate) return false
            const now = new Date()
            const eventDateTime = new Date(eventDate)
            return eventDateTime > now
        }).length
    }

    const getTodayEvents = () => {
        return tickets.filter((ticket) => {
            const eventDate = events[ticket.eventoId]?.eventoDate || ticket.evento?.eventoDate
            if (!eventDate) return false
            const now = new Date()
            const eventDateTime = new Date(eventDate)
            const diffDays = Math.ceil((eventDateTime - now) / (1000 * 60 * 60 * 24))
            return diffDays === 0
        }).length
    }

    const calculateSeatNumber = (ticket) => {
        if (!ticket.evento || ticket.seatRow === undefined || ticket.seatColumn === undefined) {
            return "N/A"
        }
        const seatsPerRow = ticket.evento.seatsPerRow || 10
        return ticket.seatRow * seatsPerRow + ticket.seatColumn + 1
    }

    const getOrganizerInfo = (ticket) => {
        return ticket.evento?.organizer || ticket.evento?.organizerName || "EventosCR"
    }

    const getEventInfo = (ticket) => {
        const fullEvent = events[ticket.eventoId] || ticket.evento
        return fullEvent || {}
    }

    const formatEventDescription = (description) => {
        if (!description) return "Descripción no disponible"
        return description.length > 100 ? description.substring(0, 100) + "..." : description
    }

    const getEventCapacity = (eventInfo) => {
        if (eventInfo.capacity) return eventInfo.capacity
        if (eventInfo.rows && eventInfo.seatsPerRow) {
            return eventInfo.rows * eventInfo.seatsPerRow
        }
        return "No especificada"
    }

    const filteredTickets = tickets.filter((ticket) => {
        const eventInfo = getEventInfo(ticket)
        const matchesSearch =
            !searchTerm ||
            eventInfo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id?.toString().includes(searchTerm)

        if (filterStatus === "all") return matchesSearch

        const eventStatus = getEventStatus(eventInfo.eventoDate)
        return matchesSearch && eventStatus.status === filterStatus
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/50 p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center space-y-10 animate-scale-in">
                            <div className="w-28 h-28 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce-gentle hover-scale">
                                <RefreshCw className="w-14 h-14 text-white animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-gradient mb-6">Cargando tus Boletos</h3>
                                <p className="text-muted-foreground text-2xl mb-8">Preparando toda la información...</p>
                                <div className="mt-8 w-80 h-3 bg-muted rounded-full mx-auto overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full shimmer animate-gradient-shift"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/50">
            <div className="glass-effect border-b border-border/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-all duration-300 group hover-lift p-3 rounded-2xl glass-morphism"
                            >
                                <ArrowLeft size={28} className="group-hover:-translate-x-3 transition-transform duration-300" />
                                <span className="font-bold text-xl">Volver al inicio</span>
                            </button>
                            <div className="h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gradient">Mis Boletos</h1>
                                <p className="text-muted-foreground text-xl mt-2">Gestiona y visualiza todos tus boletos</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="button-premium disabled:from-muted disabled:to-muted text-white font-bold py-4 px-8 rounded-2xl flex items-center gap-4 hover-scale"
                        >
                            <RefreshCw size={24} className={refreshing ? "animate-spin" : ""} />
                            {refreshing ? "Actualizando..." : "Actualizar"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
                {/* Error Banner */}
                {error && (
                    <div className="mb-10 gradient-border rounded-2xl p-6 flex items-start gap-4 bg-destructive/5 animate-scale-in">
                        <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <p className="font-bold text-destructive mb-2 text-lg">Error al cargar los boletos</p>
                            <p className="text-destructive/80">{error}</p>
                        </div>
                        <button
                            onClick={loadTickets}
                            className="button-premium text-white font-semibold py-2 px-4 rounded-xl text-sm"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-10 text-white shadow-2xl hover-lift animate-fade-in ticket-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 font-bold uppercase tracking-wider mb-3">Total de Boletos</p>
                                <p className="text-5xl font-bold mb-2">{tickets.length}</p>
                                <p className="text-white/60 text-lg">En tu colección</p>
                            </div>
                            <div className="w-20 h-20 glass-effect rounded-3xl flex items-center justify-center animate-float hover-scale">
                                <Ticket className="w-10 h-10" />
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-gradient-to-br from-accent to-accent/80 rounded-3xl p-10 text-white shadow-2xl hover-lift animate-fade-in ticket-card"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 font-bold uppercase tracking-wider mb-3">Eventos Próximos</p>
                                <p className="text-5xl font-bold mb-2">{getUpcomingEvents()}</p>
                                <p className="text-white/60 text-lg">Por disfrutar</p>
                            </div>
                            <div
                                className="w-20 h-20 glass-effect rounded-3xl flex items-center justify-center animate-float hover-scale"
                                style={{ animationDelay: "0.5s" }}
                            >
                                <TrendingUp className="w-10 h-10" />
                            </div>
                        </div>
                    </div>

                    <div
                        className="card-premium rounded-3xl p-10 shadow-2xl hover-lift animate-fade-in ticket-card"
                        style={{ animationDelay: "0.2s" }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted-foreground font-bold uppercase tracking-wider mb-3">Eventos Hoy</p>
                                <p className="text-5xl font-bold text-gradient mb-2">{getTodayEvents()}</p>
                                <p className="text-muted-foreground text-lg">¡No te los pierdas!</p>
                            </div>
                            <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl flex items-center justify-center animate-bounce-gentle hover-scale">
                                <Zap className="w-10 h-10 text-primary animate-glow" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-premium rounded-3xl shadow-xl p-10 mb-12 hover-lift">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 relative">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre del evento o ID del boleto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-8 py-5 bg-input border-2 border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-foreground placeholder:text-muted-foreground text-xl transition-all duration-300 hover-lift"
                            />
                        </div>
                        <div className="flex items-center gap-6">
                            <Filter className="w-6 h-6 text-muted-foreground" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-input border-2 border-border rounded-2xl px-8 py-5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-xl transition-all duration-300 hover-lift"
                            >
                                <option value="all">Todos los eventos</option>
                                <option value="today">Hoy</option>
                                <option value="soon">Próximos (7 días)</option>
                                <option value="upcoming">Futuros</option>
                                <option value="past">Finalizados</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Tickets Grid */}
                {filteredTickets.length === 0 ? (
                    <div className="card-premium rounded-3xl shadow-xl p-20 text-center animate-scale-in">
                        <div className="w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center mx-auto mb-8 animate-float hover-scale">
                            <Ticket className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-3xl font-bold text-gradient mb-6">
                            {searchTerm || filterStatus !== "all" ? "No se encontraron boletos" : "No tienes boletos"}
                        </h3>
                        <p className="text-muted-foreground text-xl mb-10">
                            {searchTerm || filterStatus !== "all"
                                ? "Intenta ajustar tus filtros de búsqueda"
                                : "Cuando compres boletos, aparecerán aquí"}
                        </p>
                        {!searchTerm && filterStatus === "all" && (
                            <button
                                onClick={() => navigate("/")}
                                className="button-premium text-white font-bold py-5 px-10 rounded-2xl text-xl hover-scale"
                            >
                                Explorar Eventos
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTickets.map((ticket, index) => {
                            const eventInfo = getEventInfo(ticket)
                            const eventStatus = getEventStatus(eventInfo.eventoDate)
                            const daysUntil = getDaysUntilEvent(eventInfo.eventoDate)
                            const organizerInfo = getOrganizerInfo(ticket)

                            return (
                                <div
                                    key={ticket.id}
                                    className="card-premium rounded-3xl shadow-xl overflow-hidden hover-lift animate-fade-in ticket-card"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                                        {eventInfo.bannerImageUrl ? (
                                            <img
                                                src={eventInfo.bannerImageUrl || "/placeholder.svg"}
                                                alt={eventInfo.name || "Evento"}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = "none"
                                                    e.target.nextElementSibling.style.display = "flex"
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20"
                                            style={{ display: eventInfo.bannerImageUrl ? "none" : "flex" }}
                                        >
                                            <Calendar className="w-20 h-20 text-primary/60 animate-float" />
                                        </div>

                                        <div
                                            className={`absolute top-6 right-6 px-6 py-3 rounded-full text-lg font-bold ${eventStatus.className} status-indicator hover-scale`}
                                        >
                                            {eventStatus.label}
                                        </div>

                                        <div className="absolute top-6 left-6 glass-effect text-white px-6 py-3 rounded-full text-lg font-bold flex items-center gap-3 hover-scale">
                                            <Ticket className="w-5 h-5" />#{ticket.id}
                                        </div>
                                    </div>

                                    <div className="p-10 space-y-8">
                                        <div className="flex items-start justify-between gap-6">
                                            <h3 className="font-bold text-foreground text-2xl leading-tight line-clamp-2">
                                                {eventInfo.name || "Evento sin nombre"}
                                            </h3>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-2xl font-bold text-gradient">
                                                    {formatPrice(ticket.precio || eventInfo.price || 15000)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Event Description */}
                                        {eventInfo.descrp && (
                                            <p className="text-muted-foreground line-clamp-2">{formatEventDescription(eventInfo.descrp)}</p>
                                        )}

                                        {/* Countdown */}
                                        {daysUntil !== null && daysUntil >= 0 && (
                                            <div
                                                className={`text-center py-3 px-6 rounded-2xl font-bold ${daysUntil === 0
                                                        ? "bg-gradient-to-r from-accent to-accent/80 text-white animate-glow"
                                                        : daysUntil === 1
                                                            ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary"
                                                            : "bg-secondary text-secondary-foreground"
                                                    }`}
                                            >
                                                {daysUntil === 0
                                                    ? "🎉 ¡El evento es hoy!"
                                                    : daysUntil === 1
                                                        ? "⏰ ¡Mañana es el evento!"
                                                        : daysUntil <= 7
                                                            ? `🔥 Faltan solo ${daysUntil} días`
                                                            : `📅 Faltan ${daysUntil} días`}
                                            </div>
                                        )}

                                        {/* Event Details */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold text-foreground">{formatDate(eventInfo.eventoDate)}</p>
                                                    <p className="text-muted-foreground">{formatTime(eventInfo.eventoDate)}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold text-foreground">{eventInfo.location || "Ubicación no disponible"}</p>
                                                    <p className="text-muted-foreground">
                                                        {eventInfo.venue || eventInfo.address || "Venue no especificado"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <User className="w-5 h-5 text-primary flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold text-foreground">{ticket.userName || user?.userName || "Usuario"}</p>
                                                    <p className="text-muted-foreground">
                                                        Comprado: {formatShortDate(ticket.purchaseDate || ticket.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Seat Info */}
                                        <div className="gradient-border rounded-2xl p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-muted-foreground font-medium">Tu asiento</p>
                                                    <p className="font-bold text-foreground text-lg">
                                                        Fila {(ticket.seatRow || 0) + 1}, Asiento {(ticket.seatColumn || 0) + 1}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-muted-foreground font-medium">Organizador</p>
                                                    <p className="font-bold text-foreground">{organizerInfo}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-6 pt-6">
                                            <Link
                                                to={`/boleto/${ticket.id}`}
                                                className="flex-1 button-premium text-white font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-4 hover-scale"
                                            >
                                                <Eye className="w-6 h-6" />
                                                Ver Boleto
                                            </Link>
                                            <Link
                                                to={`/evento/${ticket.eventoId}`}
                                                className="flex-1 card-premium hover:bg-secondary/80 text-secondary-foreground font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-4 border-2 border-border hover-lift"
                                            >
                                                <ExternalLink className="w-6 h-6" />
                                                Evento
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyTickets

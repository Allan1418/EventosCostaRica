"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useRoles } from "../../hooks/useRoles"
import { Calendar, MapPin, Users, Edit, Eye, MoreVertical, Star } from "lucide-react"

const EventCard = ({ event }) => {
    const { isAuthenticated } = useAuth()
    const { isAdmin } = useRoles()
    const [showActions, setShowActions] = useState(false)
    const [imageError, setImageError] = useState(false)

    const canEditEvent = isAdmin()

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString("es-CR", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
            })
        } catch (error) {
            return "Fecha no disponible"
        }
    }

    const formatTime = (dateString) => {
        try {
            return new Date(dateString).toLocaleTimeString("es-CR", {
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Hora no disponible"
        }
    }

    const truncateDescription = (text, maxLength = 100) => {
        if (!text) return "Sin descripción disponible"
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength).trim() + "..."
    }

    const getEventStatus = () => {
        if (!event.eventoDate)
            return { status: "unknown", label: "Sin fecha", className: "status-badge bg-gray-100 text-gray-600" }

        const now = new Date()
        const eventDate = new Date(event.eventoDate)
        const diffTime = eventDate - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
            return { status: "past", label: "Finalizado", className: "status-badge bg-gray-100 text-gray-600" }
        } else if (diffDays === 0) {
            return { status: "today", label: "¡Hoy!", className: "status-badge bg-red-100 text-red-700" }
        } else if (diffDays <= 7) {
            return {
                status: "soon",
                label: `En ${diffDays} día${diffDays > 1 ? "s" : ""}`,
                className: "status-badge bg-yellow-100 text-yellow-700",
            }
        } else {
            return { status: "upcoming", label: "Próximo", className: "status-badge bg-green-100 text-green-700" }
        }
    }

    const eventStatus = getEventStatus()
    const totalCapacity = (event.rows || 10) * (event.seatsPerRow || 15)

    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <div className="card-professional overflow-hidden group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:rotate-1">
            <div className="relative h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 overflow-hidden">
                {!imageError && event.bannerImageUrl ? (
                    <img
                        src={event.bannerImageUrl || "/placeholder.svg"}
                        alt={event.name || "Evento"}
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000 ease-out"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center">
                        <Calendar className="w-20 h-20 text-primary/50" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <span className={`${eventStatus.className} glass-effect shadow-xl border-white/30`}>{eventStatus.label}</span>
                </div>

                {/* Admin Actions */}
                {canEditEvent && (
                    <div className="absolute top-4 right-4">
                        <div className="relative">
                            <button
                                className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setShowActions(!showActions)
                                }}
                            >
                                <MoreVertical className="w-4 h-4 text-gray-600" />
                            </button>

                            {showActions && (
                                <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-border py-1 min-w-[140px] z-10">
                                    <Link
                                        to={`/editar-evento/${event.id}`}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar Evento
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 glass-effect rounded-full px-4 py-2 shadow-xl border border-white/30">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                        <span className="text-sm font-bold text-gray-800 dark:text-white">4.8</span>
                        <span className="text-xs text-gray-600 dark:text-gray-300 ml-1">(124)</span>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="mb-8">
                    <h3 className="text-2xl font-black text-foreground mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-500 leading-tight">
                        {event.name || "Evento sin nombre"}
                    </h3>
                    <p
                        className="text-muted-foreground text-base line-clamp-3 leading-relaxed font-medium"
                        title={event.descrp || event.description || "Sin descripción disponible"}
                    >
                        {truncateDescription(event.descrp || event.description, 140)}
                    </p>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
                            <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-foreground">{formatDate(event.eventoDate)}</p>
                            <p className="text-sm text-muted-foreground font-medium">{formatTime(event.eventoDate)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-sm">
                            <MapPin className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-foreground line-clamp-1">{event.location || "Sin ubicación"}</p>
                            <p className="text-sm text-muted-foreground font-medium">Ubicación del evento</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center border border-blue-200 shadow-sm">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-foreground">{totalCapacity.toLocaleString()} asientos</p>
                            <p className="text-sm text-muted-foreground font-medium">Capacidad total</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-border/50">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Desde</p>
                        <p className="text-3xl font-black text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text">
                            ₡15,000
                        </p>
                    </div>

                    <Link
                        to={`/evento/${event.id}`}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary rounded-2xl font-bold transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                    >
                        <Eye className="w-5 h-5" />
                        Ver Evento
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default EventCard

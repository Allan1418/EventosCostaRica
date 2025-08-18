"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { ticketService, eventService, getErrorMessage } from "../services/api"
import {
    ArrowLeft,
    Ticket,
    Calendar,
    MapPin,
    User,
    Printer,
    Download,
    QrCode,
    Star,
    AlertCircle,
    CheckCircle,
    RefreshCw,
    Clock,
    Shield,
    Sparkles,
    Award,
} from "lucide-react"

const TicketInfo = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()

    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }
        if (id) {
            loadTicketInfo()
        }
    }, [id, isAuthenticated, navigate])

    const loadTicketInfo = async () => {
        try {
            setLoading(true)
            setError("")

            console.log("[v0] Loading ticket info for ID:", id)

            const ticketData = await ticketService.getById(id)
            console.log("[v0] Ticket data received:", ticketData)

            if (ticketData.eventoId) {
                try {
                    console.log("[v0] Loading event data for ID:", ticketData.eventoId)
                    const eventData = await eventService.getById(ticketData.eventoId)
                    console.log("[v0] Event data received:", eventData)
                    ticketData.evento = eventData
                } catch (eventError) {
                    console.warn("[v0] Could not load event details:", eventError)
                }
            }

            setTicket(ticketData)
        } catch (error) {
            console.error("[v0] Error loading ticket:", error)
            setError(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Fecha no disponible"
        try {
            return new Date(dateString).toLocaleDateString("es-CR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            })
        } catch (error) {
            return "Fecha no disponible"
        }
    }

    const formatTime = (dateString) => {
        if (!dateString) return "Hora no disponible"
        try {
            return new Date(dateString).toLocaleTimeString("es-CR", {
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
            return { status: "unknown", label: "Estado desconocido", className: "status-badge bg-gray-100 text-gray-600" }

        try {
            const now = new Date()
            const eventDateTime = new Date(eventDate)
            const diffTime = eventDateTime - now
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays < 0) {
                return { status: "past", label: "Finalizado", className: "status-badge bg-gray-100 text-gray-600" }
            } else if (diffDays === 0) {
                return { status: "today", label: "¡Hoy!", className: "status-badge bg-red-100 text-red-700" }
            } else if (diffDays <= 7) {
                return {
                    status: "soon",
                    label: `En ${diffDays} día(s)`,
                    className: "status-badge bg-yellow-100 text-yellow-700",
                }
            } else {
                return { status: "upcoming", label: "Próximo", className: "status-badge bg-green-100 text-green-700" }
            }
        } catch (error) {
            return { status: "unknown", label: "Estado desconocido", className: "status-badge bg-gray-100 text-gray-600" }
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const handleDownload = () => {
        try {
            const element = document.createElement("a")
            const ticketContent = `BOLETO DIGITAL - EVENTOS COSTA RICA
        =====================================
        
        Evento: ${ticket?.evento?.name || "Evento"}
        Fecha: ${formatDate(ticket?.evento?.eventoDate)}
        Hora: ${formatTime(ticket?.evento?.eventoDate)}
        Ubicación: ${ticket?.evento?.location || "Sin ubicación"}
        
        Asiento: Fila ${(ticket?.seatRow || 0) + 1}, Asiento ${(ticket?.seatColumn || 0) + 1}
        Número de Asiento: ${(ticket?.seatRow || 0) * (ticket?.evento?.seatsPerRow || 15) + (ticket?.seatColumn || 0) + 1}
        
        Titular: ${ticket?.userName || user?.userName || "Usuario"}
        Email: ${ticket?.userEmail || user?.email || ""}
        
        ID del Boleto: ${ticket?.id}
        Precio: ${formatPrice(ticket?.precio)}
        Fecha de Compra: ${formatDate(ticket?.purchaseDate)}
        
        =====================================
        Presenta este boleto en la entrada del evento
        
        IMPORTANTE:
        - Llega 30 minutos antes del evento
        - Este boleto es personal e intransferible
        - Mantén este boleto hasta el final del evento`

            const blob = new Blob([ticketContent], { type: "text/plain" })
            element.href = URL.createObjectURL(blob)
            element.download = `boleto-${ticket?.id || "ticket"}.txt`
            document.body.appendChild(element)
            element.click()
            document.body.removeChild(element)
            URL.revokeObjectURL(element.href)
        } catch (error) {
            console.error("[v0] Error downloading ticket:", error)
            alert("Error al descargar el boleto")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 flex items-center justify-center p-4">
                <div className="text-center space-y-8 animate-scale-in">
                    <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-r from-primary via-accent to-primary rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce-gentle">
                            <RefreshCw className="w-16 h-16 text-white animate-spin" />
                        </div>
                        <div className="absolute inset-0 w-32 h-32 bg-gradient-to-r from-primary via-accent to-primary rounded-full mx-auto animate-ping opacity-20"></div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gradient mb-4">Cargando tu Boleto Premium</h3>
                        <p className="text-muted-foreground text-xl">Preparando todos los detalles exclusivos...</p>
                        <div className="mt-8 w-96 h-2 bg-muted rounded-full mx-auto overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary via-accent to-primary rounded-full animate-gradient-shift"></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 flex items-center justify-center p-4">
                <div className="card-premium p-12 text-center max-w-lg w-full animate-scale-in shadow-2xl">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <AlertCircle className="w-12 h-12 text-destructive" />
                        </div>
                        <div className="absolute inset-0 w-24 h-24 bg-destructive/20 rounded-full mx-auto animate-ping opacity-30"></div>
                    </div>
                    <h2 className="text-3xl font-bold text-gradient mb-4">Boleto No Encontrado</h2>
                    <p className="text-muted-foreground mb-8 text-lg">{error || "No se pudo encontrar el boleto solicitado"}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate("/mis-boletos")}
                            className="px-8 py-4 bg-muted text-muted-foreground hover:bg-muted/80 rounded-2xl font-bold transition-all duration-300 hover-lift"
                        >
                            <ArrowLeft className="w-5 h-5 inline mr-3" />
                            Volver
                        </button>
                        <button
                            onClick={loadTicketInfo}
                            className="button-premium text-white font-bold py-4 px-8 rounded-2xl hover-scale"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const eventStatus = getEventStatus(ticket.evento?.eventoDate)

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5">
            <div className="glass-morphism border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto p-6 md:p-8">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate("/mis-boletos")}
                            className="inline-flex items-center gap-3 px-6 py-4 text-muted-foreground hover:text-foreground glass-effect hover:bg-muted/20 rounded-2xl font-bold transition-all duration-300 hover-lift group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                            <span className="font-bold text-lg">Mis Boletos</span>
                        </button>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center gap-3 px-6 py-4 glass-effect text-secondary-foreground hover:bg-secondary/20 rounded-2xl font-bold transition-all duration-300 hover-lift"
                            >
                                <Download className="w-5 h-5" />
                                Descargar
                            </button>
                            <button
                                onClick={handlePrint}
                                className="button-premium text-white font-bold py-4 px-6 rounded-2xl flex items-center gap-3 hover-scale shadow-2xl"
                            >
                                <Printer className="w-5 h-5" />
                                Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6 md:p-8 lg:p-12">
                <div className="card-premium overflow-hidden mb-12 shadow-2xl animate-fade-in ticket-card">
                    <div className="relative h-80 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 overflow-hidden group image-container-premium event-image-premium">
                        <img
                            src={
                                ticket?.evento?.bannerImageUrl ||
                                "/placeholder.svg?height=400&width=1000&query=evento+premium+costa+rica+concierto+luces" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                            }
                            alt={ticket?.evento?.name || "Evento Premium"}
                            className="w-full h-full object-cover image-enhanced image-quality-boost image-sharp transition-all duration-1000 ease-out group-hover:scale-105"
                            loading="eager"
                            decoding="sync"
                            fetchPriority="high"
                            onLoad={(e) => {
                                e.target.style.filter =
                                    "brightness(1.08) contrast(1.2) saturate(1.25) hue-rotate(1deg) drop-shadow(0 30px 60px rgba(0,0,0,0.5))"
                                e.target.style.opacity = "1"
                                e.target.style.imageRendering = "crisp-edges"
                                e.target.style.WebkitImageRendering = "-webkit-optimize-contrast"
                            }}
                            onError={(e) => {
                                e.target.src = "/placeholder.svg?height=400&width=1000"
                                e.target.style.filter = "brightness(1.1) contrast(1.15) saturate(1.2)"
                            }}
                        />

                        <div className="absolute inset-0 image-overlay-gradient transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 transition-opacity duration-700 group-hover:from-primary/10 group-hover:to-accent/10" />

                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/2 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute top-0 left-0 w-full h-1/4 bg-gradient-to-b from-white/5 to-transparent opacity-50" />

                        <div className="absolute top-10 left-10 w-2 h-2 bg-white/40 rounded-full animate-float opacity-60"></div>
                        <div
                            className="absolute top-20 right-20 w-1 h-1 bg-accent/60 rounded-full animate-float"
                            style={{ animationDelay: "1s" }}
                        ></div>
                        <div
                            className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-primary/50 rounded-full animate-float"
                            style={{ animationDelay: "2s" }}
                        ></div>
                        <div
                            className="absolute top-1/3 right-1/3 w-1 h-1 bg-white/50 rounded-full animate-float"
                            style={{ animationDelay: "0.5s" }}
                        ></div>

                        <div className="absolute top-6 right-6 flex gap-3">
                            <span className="glass-effect text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 animate-glow">
                                <Shield className="w-4 h-4" />
                                Verificado
                            </span>
                            <span
                                className={`${eventStatus.className} glass-effect backdrop-blur-sm border border-white/30 shadow-xl px-6 py-3 rounded-full text-sm font-bold animate-pulse-soft`}
                            >
                                {eventStatus.label}
                            </span>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl leading-tight">
                                        {ticket?.evento?.name || "Evento Premium"}
                                    </h1>
                                    <div className="flex items-center gap-4 text-white/90">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow animate-glow" />
                                            <span className="text-lg font-bold">Boleto Premium Confirmado</span>
                                        </div>
                                        <div className="h-6 w-px bg-white/30"></div>
                                        <div className="flex items-center gap-2">
                                            <Award className="w-5 h-5 text-accent drop-shadow" />
                                            <span className="text-lg font-bold">Acceso VIP</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-effect text-white px-8 py-4 rounded-2xl text-center animate-float">
                                    <p className="text-sm font-medium opacity-80">ID del Boleto</p>
                                    <p className="text-2xl font-bold font-mono">#{ticket?.id}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 bg-gradient-to-br from-card via-card/95 to-card/90">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 rounded-3xl flex items-center justify-center shadow-inner animate-float">
                                    <Ticket className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gradient mb-2">Boleto Premium Digital</h2>
                                    <p className="text-muted-foreground font-mono text-lg">Código de Acceso: #{ticket?.id}</p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-muted via-muted/80 to-muted/60 rounded-3xl flex items-center justify-center shadow-2xl animate-glow">
                                    <QrCode className="w-16 h-16 text-muted-foreground" />
                                </div>
                                <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl opacity-20 animate-gradient-shift"></div>
                                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 glass-effect text-xs font-bold px-4 py-2 rounded-full text-primary">
                                    Código QR
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            <div className="space-y-6">
                                <div className="gradient-border rounded-3xl p-8 bg-gradient-to-br from-blue-50/50 via-blue-50/30 to-transparent hover-lift">
                                    <div className="flex items-start gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-xl animate-glow">
                                            <Calendar className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-foreground mb-3 text-xl">Fecha y Hora del Evento</h3>
                                            <p className="text-foreground font-bold text-lg mb-2">{formatDate(ticket?.evento?.eventoDate)}</p>
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-muted-foreground" />
                                                <p className="text-muted-foreground font-medium">{formatTime(ticket?.evento?.eventoDate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="gradient-border rounded-3xl p-8 bg-gradient-to-br from-green-50/50 via-green-50/30 to-transparent hover-lift">
                                    <div className="flex items-start gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 via-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-xl animate-glow">
                                            <MapPin className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-foreground mb-3 text-xl">Ubicación del Evento</h3>
                                            <p className="text-foreground font-bold text-lg mb-2">
                                                {ticket?.evento?.location || "Ubicación Premium"}
                                            </p>
                                            <p className="text-muted-foreground">Llega 30 minutos antes para check-in VIP</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="gradient-border rounded-3xl p-8 bg-gradient-to-br from-purple-50/50 via-purple-50/30 to-transparent hover-lift">
                                    <div className="flex items-start gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl animate-glow">
                                            <Ticket className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-foreground mb-3 text-xl">Información del Asiento</h3>
                                            <p className="text-foreground font-bold text-lg mb-2">
                                                Fila {(ticket?.seatRow || 0) + 1}, Asiento {(ticket?.seatColumn || 0) + 1}
                                            </p>
                                            <p className="text-muted-foreground">
                                                Asiento Premium #
                                                {(ticket?.seatRow || 0) * (ticket?.evento?.seatsPerRow || 15) + (ticket?.seatColumn || 0) + 1}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="gradient-border rounded-3xl p-8 bg-gradient-to-br from-yellow-50/50 via-yellow-50/30 to-transparent hover-lift">
                                    <div className="flex items-start gap-6">
                                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 rounded-2xl flex items-center justify-center shadow-xl animate-glow">
                                            <User className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-foreground mb-3 text-xl">Titular del Boleto</h3>
                                            <p className="text-foreground font-bold text-lg mb-2">
                                                {ticket?.userName || user?.userName || "Usuario Premium"}
                                            </p>
                                            <p className="text-muted-foreground">{ticket?.userEmail || user?.email || ""}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-premium rounded-3xl p-8 mb-12 shadow-xl hover-lift">
                            <h3 className="font-bold text-gradient mb-8 text-2xl flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-primary animate-glow" />
                                Detalles de Compra Premium
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <p className="text-muted-foreground font-medium mb-2">Fecha de Compra</p>
                                    <p className="font-bold text-foreground text-lg">{formatDate(ticket?.purchaseDate)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-muted-foreground font-medium mb-2">Precio Premium</p>
                                    <p className="font-bold text-gradient text-2xl">{formatPrice(ticket?.precio)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-muted-foreground font-medium mb-2">Estado del Boleto</p>
                                    <span className="status-badge bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg animate-glow">
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Confirmado Premium
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="gradient-border rounded-3xl p-8 bg-gradient-to-br from-yellow-50/30 via-yellow-50/20 to-transparent">
                            <h3 className="font-bold text-yellow-800 mb-6 flex items-center gap-3 text-xl">
                                <AlertCircle className="w-6 h-6 animate-glow" />
                                Información Importante - Acceso Premium
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ul className="space-y-3 text-yellow-700">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>Presenta este boleto (impreso o digital) en la entrada VIP</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>Acceso prioritario 30 minutos antes del evento</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>Boleto personal e intransferible con verificación digital</span>
                                    </li>
                                </ul>
                                <ul className="space-y-3 text-yellow-700">
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>Servicios premium incluidos durante el evento</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>Soporte técnico 24/7 para consultas</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span>Mantén tu boleto seguro hasta el final del evento</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                    <button
                        onClick={() => navigate(`/evento/${ticket?.eventoId}`)}
                        className="flex-1 px-8 py-5 bg-gradient-to-r from-secondary via-secondary/90 to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary rounded-2xl font-bold transition-all duration-300 text-center shadow-xl hover:shadow-2xl hover-lift text-lg"
                    >
                        Ver Detalles Completos del Evento
                    </button>
                    <button
                        onClick={() => navigate("/mis-boletos")}
                        className="flex-1 button-premium text-white font-bold py-5 px-8 rounded-2xl text-center shadow-xl hover:shadow-2xl hover-scale text-lg"
                    >
                        Ver Todos Mis Boletos Premium
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TicketInfo

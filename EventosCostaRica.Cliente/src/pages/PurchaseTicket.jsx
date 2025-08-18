"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useRoles } from "../hooks/useRoles"
import { eventService, ticketService, getErrorMessage } from "../services/api"
import {
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Loader2,
    Ticket,
    ShoppingCart,
    Calendar,
    MapPin,
    Clock,
    Shield,
    CreditCard,
    Star,
    Zap,
} from "lucide-react"

const PurchaseTicket = () => {
    const { id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { hasPermission, PERMISSIONS } = useRoles()

    const [event, setEvent] = useState(location.state?.event || null)
    const [selectedSeats, setSelectedSeats] = useState(location.state?.selectedSeats || [])
    const [purchasing, setPurchasing] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [purchasedTickets, setPurchasedTickets] = useState([])

    useEffect(() => {
        if (!event && id) {
            loadEventDetails()
        }

        if (!selectedSeats || selectedSeats.length === 0) {
            navigate(`/evento/${id}`)
        }
    }, [id, event, selectedSeats, navigate])

    const loadEventDetails = async () => {
        try {
            setError("")
            const eventData = await eventService.getById(id)
            setEvent(eventData)
        } catch (error) {
            console.error("Error loading event details:", error)
            setError(getErrorMessage(error))
        }
    }

    const handlePurchase = async () => {
        if (!selectedSeats || selectedSeats.length === 0) {
            setError("No hay asientos seleccionados")
            return
        }

        if (!hasPermission(PERMISSIONS.PURCHASE_TICKETS)) {
            setError("No tienes permisos para comprar boletos")
            return
        }

        const eventoId = Number(id) || Number(event?.id) || 1

        try {
            setPurchasing(true)
            setError("")

            console.log("[v0] Iniciando compra con eventoId:", eventoId)
            console.log("[v0] Asientos seleccionados:", selectedSeats)

            const tickets = []
            const failedSeats = []

            for (let i = 0; i < selectedSeats.length; i++) {
                const seat = selectedSeats[i]

                try {
                    const ticketData = {
                        eventoId: eventoId,
                        seatRow: Number(seat.row),
                        seatColumn: Number(seat.column),
                    }

                    console.log("[v0] Comprando asiento:", ticketData)
                    const ticket = await ticketService.create(ticketData)
                    console.log("[v0] Asiento comprado exitosamente:", ticket)

                    tickets.push({
                        ...ticket,
                        displayRow: seat.row + 1,
                        displayColumn: seat.column + 1,
                    })
                } catch (seatError) {
                    console.error(`[v0] Error comprando asiento ${seat.row + 1}-${seat.column + 1}:`, seatError)
                    failedSeats.push({
                        row: seat.row + 1,
                        column: seat.column + 1,
                        error: seatError.message || "Error desconocido",
                    })
                }
            }

            if (tickets.length > 0) {
                setPurchasedTickets(tickets)

                try {
                    await ticketService.refreshSeatStatus(eventoId)
                    console.log("[v0] Estado de asientos actualizado después de la compra")
                } catch (refreshError) {
                    console.warn("[v0] No se pudo actualizar el estado de los asientos:", refreshError)
                }

                if (failedSeats.length > 0) {
                    setError(
                        `Se compraron ${tickets.length} boletos exitosamente. ${failedSeats.length} asientos no pudieron comprarse: ${failedSeats.map((s) => `Fila ${s.row}-${s.column}`).join(", ")}`,
                    )
                }

                setSuccess(true)
                setTimeout(() => {
                    navigate("/mis-boletos")
                }, 3000)
            } else {
                setError(
                    `No se pudo comprar ningún boleto. ${failedSeats.map((s) => `Fila ${s.row}-${s.column}: ${s.error}`).join("; ")}`,
                )
            }
        } catch (error) {
            console.error("[v0] Error general en compra:", error)
            setError(error.message || "Error al procesar la compra")
        } finally {
            setPurchasing(false)
        }
    }

    const formatDate = (dateString) => {
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
        try {
            return new Date(dateString).toLocaleTimeString("es-CR", {
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Hora no disponible"
        }
    }

    const totalPrice = selectedSeats.length * 15000

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/50 p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="card-premium rounded-3xl shadow-2xl border-2 overflow-hidden animate-scale-in hover-lift ticket-card">
                        <div className="bg-gradient-to-r from-primary via-accent to-primary p-8 text-center relative overflow-hidden">
                            <div className="absolute inset-0 shimmer"></div>
                            <div className="absolute inset-0 animate-gradient-shift bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center w-28 h-28 glass-effect rounded-full mb-8 animate-bounce-gentle hover-scale">
                                    <CheckCircle size={64} className="text-white animate-glow" />
                                </div>
                                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 animate-float">¡Compra Exitosa!</h1>
                                <p className="text-white/90 text-2xl mb-6">Tus boletos han sido confirmados</p>
                                <div className="mt-6 inline-block px-8 py-3 glass-effect rounded-full hover-scale">
                                    <span className="text-white font-bold text-lg flex items-center gap-3">
                                        <Shield className="w-6 h-6" />
                                        Transacción Segura Completada
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 space-y-10">
                            <div className="gradient-border rounded-3xl p-8 animate-fade-in hover-lift">
                                <h2 className="text-3xl font-bold text-gradient mb-8 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center animate-float">
                                        <Calendar className="w-7 h-7 text-primary" />
                                    </div>
                                    Detalles del Evento
                                </h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="card-elevated rounded-2xl p-6 hover-lift animate-fade-in">
                                        <div className="flex items-center gap-6">
                                            <div className="w-4 h-4 bg-primary rounded-full animate-pulse-soft"></div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Evento</p>
                                                <p className="font-bold text-foreground text-2xl mt-1">{event?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="card-elevated rounded-2xl p-6 hover-lift animate-fade-in"
                                        style={{ animationDelay: "0.1s" }}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-4 h-4 bg-accent rounded-full animate-pulse-soft"></div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Fecha</p>
                                                <p className="font-bold text-foreground text-2xl mt-1">{formatDate(event?.eventoDate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="card-elevated rounded-2xl p-6 hover-lift animate-fade-in"
                                        style={{ animationDelay: "0.2s" }}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-4 h-4 bg-primary rounded-full animate-pulse-soft"></div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Comprador</p>
                                                <p className="font-bold text-foreground text-2xl mt-1">{user?.userName || user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className="card-elevated rounded-2xl p-6 hover-lift animate-fade-in"
                                        style={{ animationDelay: "0.3s" }}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-4 h-4 bg-accent rounded-full animate-pulse-soft"></div>
                                            <div>
                                                <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Hora</p>
                                                <p className="font-bold text-foreground text-2xl mt-1">{formatTime(event?.eventoDate)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="animate-slide-up">
                                <h2 className="text-2xl font-bold text-gradient mb-6 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                                        <Ticket className="w-5 h-5 text-accent" />
                                    </div>
                                    Boletos Comprados ({purchasedTickets.length})
                                </h2>
                                <div className="grid gap-6">
                                    {purchasedTickets.map((ticket, index) => (
                                        <div
                                            key={ticket.id || index}
                                            className="card-premium rounded-2xl p-6 hover-lift animate-fade-in"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                                                        <Ticket className="w-8 h-8 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground text-xl">
                                                            Fila {ticket.displayRow}, Asiento {ticket.displayColumn}
                                                        </p>
                                                        <p className="text-muted-foreground font-medium">ID: #{ticket.id}</p>
                                                        <div className="mt-2 inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                                            Confirmado
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gradient">₡15,000</p>
                                                    <p className="text-muted-foreground">Precio unitario</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="gradient-border rounded-3xl p-10 text-center animate-glow ticket-card">
                                <div className="mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-float hover-scale">
                                        <CreditCard className="w-10 h-10 text-white" />
                                    </div>
                                    <p className="text-muted-foreground font-bold uppercase tracking-wider mb-3">Total Pagado</p>
                                    <p className="text-5xl font-bold text-gradient mb-4">
                                        ₡{Math.round(totalPrice * 1.13).toLocaleString()}
                                    </p>
                                    <p className="text-muted-foreground text-lg">Incluye impuestos (13%)</p>
                                    <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 glass-effect rounded-full">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        <span className="text-foreground font-bold">Pago Verificado</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 pt-4">
                                <button
                                    onClick={() => navigate("/mis-boletos")}
                                    className="flex-1 button-premium text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 text-lg"
                                >
                                    <Ticket className="w-6 h-6" />
                                    Ver Mis Boletos
                                </button>
                                <button
                                    onClick={() => navigate("/")}
                                    className="flex-1 card-premium hover:bg-secondary/80 text-secondary-foreground font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 border-2 border-border hover-lift text-lg"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                    Volver al Inicio
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error && !event) {
        return (
            <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8 flex items-center justify-center">
                <div className="max-w-md mx-auto">
                    <div className="bg-card rounded-2xl shadow-xl border border-border p-8 text-center animate-fade-in">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle size={32} className="text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-4">Error al Cargar</h2>
                        <p className="text-muted-foreground mb-6">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 w-full"
                        >
                            <ArrowLeft size={16} />
                            Volver
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary/30 via-background to-secondary/50">
            <div className="glass-effect border-b border-border/50 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-all duration-300 group hover-lift p-3 rounded-2xl glass-morphism"
                        >
                            <ArrowLeft size={28} className="group-hover:-translate-x-3 transition-transform duration-300" />
                            <span className="font-bold text-xl">Volver</span>
                        </button>
                        <div className="h-10 w-px bg-gradient-to-b from-transparent via-border to-transparent"></div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gradient">Comprar Boletos</h1>
                            <p className="text-muted-foreground text-xl mt-2">Finaliza tu compra de manera segura</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">
                        {event && (
                            <div className="card-premium rounded-3xl shadow-xl overflow-hidden animate-fade-in hover-lift ticket-card">
                                <div className="bg-gradient-to-r from-primary via-accent to-primary p-10 text-white relative overflow-hidden">
                                    <div className="absolute inset-0 shimmer"></div>
                                    <div className="absolute inset-0 animate-gradient-shift bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20"></div>
                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-bold mb-6">{event.name}</h2>
                                        <div className="flex flex-wrap gap-8 text-white/90">
                                            <div className="flex items-center gap-4 glass-effect px-6 py-3 rounded-full hover-scale">
                                                <Calendar className="w-6 h-6" />
                                                <span className="font-bold">{formatDate(event.eventoDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-4 glass-effect px-6 py-3 rounded-full hover-scale">
                                                <Clock className="w-6 h-6" />
                                                <span className="font-bold">{formatTime(event.eventoDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-4 glass-effect px-6 py-3 rounded-full hover-scale">
                                                <MapPin className="w-6 h-6" />
                                                <span className="font-bold">{event.location || "Ubicación por confirmar"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="card-premium rounded-3xl shadow-xl overflow-hidden animate-slide-up hover-lift">
                            <div className="p-8 border-b border-border/50">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border-2 border-primary/20">
                                        <span className="font-bold text-primary text-xl">#{selectedSeats.length}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gradient">Asientos Seleccionados</h2>
                                        <p className="text-muted-foreground text-lg">Revisa los detalles antes de confirmar</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid gap-6">
                                    {selectedSeats.map((seat, index) => (
                                        <div
                                            key={index}
                                            className="gradient-border rounded-2xl p-6 hover-lift animate-fade-in"
                                            style={{ animationDelay: `${index * 0.1}s` }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center border-2 border-primary/20">
                                                        <span className="font-bold text-primary text-xl">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground text-xl">
                                                            Fila {seat.row + 1}, Asiento {seat.column + 1}
                                                        </p>
                                                        <p className="text-muted-foreground font-medium">Entrada General</p>
                                                        <div className="mt-2 inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium status-indicator">
                                                            Disponible
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gradient">₡15,000</p>
                                                    <p className="text-muted-foreground">Precio unitario</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-10">
                        <div className="card-premium rounded-3xl shadow-xl overflow-hidden sticky top-8 hover-lift ticket-card">
                            <div className="p-10 border-b border-border/50">
                                <h3 className="text-3xl font-bold text-gradient flex items-center gap-4">
                                    <Zap className="w-8 h-8 text-primary animate-glow" />
                                    Resumen de Pago
                                </h3>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="flex justify-between text-xl">
                                    <span className="text-muted-foreground font-bold">Precio por asiento:</span>
                                    <span className="font-bold text-foreground">₡15,000</span>
                                </div>
                                <div className="flex justify-between text-xl">
                                    <span className="text-muted-foreground font-bold">Cantidad de asientos:</span>
                                    <span className="font-bold text-foreground">{selectedSeats.length}</span>
                                </div>
                                <div className="flex justify-between text-xl border-t border-border/50 pt-8">
                                    <span className="text-muted-foreground font-bold">Subtotal:</span>
                                    <span className="font-bold text-foreground">₡{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xl">
                                    <span className="text-muted-foreground font-bold">Impuestos (13%):</span>
                                    <span className="font-bold text-foreground">₡{Math.round(totalPrice * 0.13).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-3xl font-bold border-t border-border/50 pt-8">
                                    <span className="text-foreground">Total:</span>
                                    <span className="text-gradient">₡{Math.round(totalPrice * 1.13).toLocaleString()}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mx-8 mb-8 gradient-border rounded-2xl p-6 flex items-start gap-4 bg-destructive/5 animate-scale-in">
                                    <AlertCircle size={24} className="text-destructive flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-destructive font-semibold text-lg">{error}</p>
                                    </div>
                                    <button
                                        onClick={() => setError("")}
                                        className="text-destructive hover:text-destructive/80 transition-colors text-2xl font-bold"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            <div className="p-10 border-t border-border/50">
                                <button
                                    onClick={handlePurchase}
                                    disabled={purchasing || selectedSeats.length === 0}
                                    className="w-full button-premium disabled:from-muted disabled:to-muted text-white font-bold py-6 px-10 rounded-2xl flex items-center justify-center gap-4 disabled:cursor-not-allowed text-2xl hover-scale"
                                >
                                    {purchasing ? (
                                        <>
                                            <Loader2 size={28} className="animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={28} />
                                            Comprar Boletos
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {purchasing && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xl flex items-center justify-center z-50">
                    <div className="card-premium rounded-3xl shadow-2xl max-w-lg mx-4 text-center animate-scale-in hover-lift ticket-card">
                        <div className="p-12">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-10 animate-bounce-gentle hover-scale">
                                <Loader2 size={48} className="text-white animate-spin" />
                            </div>
                            <h3 className="text-3xl font-bold text-gradient mb-6">Procesando tu Compra</h3>
                            <p className="text-muted-foreground mb-8 text-xl">
                                Por favor espera mientras procesamos tus {selectedSeats.length} boleto
                                {selectedSeats.length > 1 ? "s" : ""}...
                            </p>
                            <div className="gradient-border rounded-3xl p-8 space-y-6">
                                <div className="flex justify-between text-xl">
                                    <span className="text-muted-foreground font-bold">Evento:</span>
                                    <span className="font-bold text-foreground">{event?.name}</span>
                                </div>
                                <div className="flex justify-between text-2xl">
                                    <span className="text-muted-foreground font-bold">Total:</span>
                                    <span className="font-bold text-gradient">₡{Math.round(totalPrice * 1.13).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PurchaseTicket

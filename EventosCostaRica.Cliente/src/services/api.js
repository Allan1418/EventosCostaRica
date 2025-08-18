import axios from "axios"

// Configuración base de la API
const API_BASE_URL = "http://localhost:5264"

// Variable global para el contexto de errores (se establecerá desde el componente)
let errorContext = null

export const setErrorContext = (context) => {
    errorContext = context
}

// Crear instancia de axios con configuración base
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Agregado timeout de 30 segundos
    headers: {
        "Content-Type": "application/json",
    },
})

// Interceptor para agregar el token de autenticación
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        console.error("API Error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
        })

        // Mostrar error en popup si el contexto está disponible
        if (errorContext) {
            const errorMessage = getErrorMessage(error)
            errorContext.showError(errorMessage)
        }

        // Si el token ha expirado, limpiar localStorage y redirigir al login
        if (error.response?.status === 401) {
            localStorage.removeItem("authToken")
            localStorage.removeItem("userData")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    },
)

export const getErrorMessage = (error) => {
    if (error.response) {
        // Error de respuesta del servidor
        const { status, data } = error.response

        if (data) {
            // Priorizar mensajes exactos del backend
            if (typeof data === "string" && data.trim()) {
                return data
            }

            // Si el backend envía un objeto con mensaje
            if (data.message && typeof data.message === "string") {
                return data.message
            }

            // Para errores de validación del modelo (BadRequest con ModelState)
            if (data.errors) {
                // Si es un objeto de errores de validación
                if (typeof data.errors === "object") {
                    const errorMessages = []
                    for (const field in data.errors) {
                        if (Array.isArray(data.errors[field])) {
                            errorMessages.push(...data.errors[field])
                        } else {
                            errorMessages.push(data.errors[field])
                        }
                    }
                    if (errorMessages.length > 0) {
                        return errorMessages.join(". ")
                    }
                }
                // Si es un string
                if (typeof data.errors === "string") {
                    return data.errors
                }
            }

            // Otros campos comunes del backend
            if (data.detail && typeof data.detail === "string") return data.detail
            if (data.title && typeof data.title === "string") return data.title

            // Si hay un array de errores
            if (Array.isArray(data) && data.length > 0) {
                return data.join(". ")
            }
        }

        // Fallbacks por código de estado (solo si no hay mensaje específico del backend)
        if (status === 400) {
            return "Datos inválidos o asiento ya ocupado"
        }
        if (status === 401) {
            return "Usuario o contraseña invalida"
        }
        if (status === 403) {
            return "No tienes permisos para realizar esta acción"
        }
        if (status === 404) {
            return "Recurso no encontrado"
        }
        if (status === 409) {
            return "El asiento ya está ocupado o bloqueado"
        }
        if (status >= 500) {
            return "Ocurrio un error interno del servidor"
        }

        return `Error ${status}`
    } else if (error.request) {
        // Error de red
        return "Error de conexión. Verifica tu conexión a internet"
    } else {
        // Error de configuración
        return error.message || "Error inesperado"
    }
}

// Servicios de autenticación
export const authService = {
    async login(email, password) {
        try {
            const response = await api.post("/api/User/login", {
                email,
                password,
            })
            return response.data
        } catch (error) {
            console.error("Login API error:", error)
            throw error
        }
    },

    async register(userData) {
        try {
            const response = await api.post("/api/User/register", {
                userName: userData.userName, // Cambiado de UserName a userName
                email: userData.email,
                password: userData.password,
                confirmPassword: userData.confirmPassword || userData.password,
            })
            return response.data
        } catch (error) {
            console.error("Register API error:", error)
            throw error
        }
    },

    async logout() {
        try {
            await api.post("/api/User/logout")
        } catch (error) {
            console.warn("Logout API error:", error)
            // No lanzar error para logout, ya que limpiamos localStorage de todas formas
        }
    },

    async getProfile() {
        try {
            const response = await api.get("/api/User/profile")
            return response.data
        } catch (error) {
            console.error("Get profile API error:", error)
            throw error
        }
    },

    async getUserList() {
        try {
            const response = await api.get("/api/User/list")
            return response.data
        } catch (error) {
            console.error("Get users API error:", error)
            throw error
        }
    },

    async getUserById(id) {
        try {
            const response = await api.get(`/api/User/${id}`)
            return response.data
        } catch (error) {
            console.error("Get user by ID API error:", error)
            throw error
        }
    },

    async editUser(id, userData) {
        try {
            console.log("[v0] === INICIANDO EDICIÓN DE USUARIO ===")
            console.log("[v0] ID del usuario:", id)
            console.log("[v0] Datos recibidos:", userData)

            if (!id) {
                throw new Error("ID del usuario es requerido")
            }

            if (!userData.userName || !userData.userName.trim()) {
                throw new Error("Nombre de usuario es requerido")
            }

            if (!userData.email || !userData.email.trim()) {
                throw new Error("Email es requerido")
            }

            if (!userData.roles || !Array.isArray(userData.roles) || userData.roles.length === 0) {
                throw new Error("El usuario debe tener al menos un rol")
            }

            const requestData = {
                Id: id, // Backend espera 'Id' con mayúscula
                Email: userData.email.trim(), // Campo directo en nivel raíz
                UserName: userData.userName.trim(), // Campo directo en nivel raíz
                Roles: userData.roles, // Campo directo en nivel raíz
            }

            console.log("[v0] Datos procesados para envío (estructura plana):", requestData)
            console.log("[v0] Cuerpo JSON que se enviará:", JSON.stringify(requestData, null, 2))
            console.log("[v0] Verificación de campos:")
            console.log("[v0] - Id:", requestData.Id, "tipo:", typeof requestData.Id)
            console.log("[v0] - Email:", requestData.Email, "tipo:", typeof requestData.Email)
            console.log("[v0] - UserName:", requestData.UserName, "tipo:", typeof requestData.UserName)
            console.log(
                "[v0] - Roles:",
                requestData.Roles,
                "tipo:",
                typeof requestData.Roles,
                "es array:",
                Array.isArray(requestData.Roles),
            )
            console.log("[v0] URL completa:", `${API_BASE_URL}/api/User/edit/${id}`)

            const token = localStorage.getItem("authToken")
            console.log("[v0] Token presente:", token ? "Sí" : "No")

            console.log("[v0] Enviando petición PUT...")
            const startTime = Date.now()

            const response = await api.put(`/api/User/edit/${id}`, requestData)

            const endTime = Date.now()
            console.log(`[v0] Petición completada en ${endTime - startTime}ms`)
            console.log("[v0] === RESPUESTA EXITOSA ===")
            console.log("[v0] Status:", response.status)
            console.log("[v0] Headers:", response.headers)
            console.log("[v0] Data:", response.data)

            return response.data
        } catch (error) {
            console.error("[v0] === ERROR EN EDICIÓN DE USUARIO ===")
            console.error("[v0] Mensaje:", error.message)
            console.error("[v0] Response status:", error.response?.status)
            console.error("[v0] Response headers:", error.response?.headers)
            console.error("[v0] Response data:", error.response?.data)
            if (error.response?.data?.errors) {
                console.error("[v0] Errores de validación específicos:")
                Object.keys(error.response.data.errors).forEach((field) => {
                    console.error(`[v0] - Campo '${field}':`, error.response.data.errors[field])
                })
            }
            console.error("[v0] Request config:", error.config)
            console.error("[v0] Stack trace:", error.stack)

            if (error.response?.status === 400) {
                const errorData = error.response.data
                if (typeof errorData === "string") {
                    throw new Error(`Error de validación: ${errorData}`)
                } else if (errorData?.errors) {
                    const errorMessages = []
                    for (const field in errorData.errors) {
                        if (Array.isArray(errorData.errors[field])) {
                            errorMessages.push(...errorData.errors[field])
                        } else {
                            errorMessages.push(errorData.errors[field])
                        }
                    }
                    throw new Error(`Errores de validación: ${errorMessages.join(", ")}`)
                }
            }

            if (error.response?.status === 404) {
                throw new Error("Usuario no encontrado")
            }

            if (error.response?.status === 403) {
                throw new Error("No tienes permisos para editar este usuario")
            }

            throw error
        }
    },

    async deleteUser(id) {
        try {
            const response = await api.delete(`/api/User/${id}`)
            return response.data
        } catch (error) {
            console.error("Delete user API error:", error)
            throw error
        }
    },
}

// Servicios de eventos
export const eventService = {
    async getAll() {
        try {
            const response = await api.get("/api/Evento")
            console.log("Events API response:", response.data)
            return response.data
        } catch (error) {
            console.error("Get events API error:", error)
            throw error
        }
    },

    async getById(id) {
        try {
            const response = await api.get(`/api/Evento/${id}`)
            console.log("Event by ID API response:", response.data)
            return response.data
        } catch (error) {
            console.error("Get event by ID API error:", error)
            throw error
        }
    },

    async create(eventData) {
        try {
            // Asegurar que los datos coincidan con el schema de la API
            const requestData = {
                name: eventData.name,
                descrp: eventData.descrp,
                eventoDate: eventData.eventoDate,
                location: eventData.location,
                bannerImageUrl: eventData.bannerImageUrl || "",
                rows: Math.min(Math.max(eventData.rows, 1), 100), // Entre 1 y 100
                seatsPerRow: Math.min(Math.max(eventData.seatsPerRow, 1), 100), // Entre 1 y 100
            }

            console.log("Creating event with data:", requestData)
            console.log("URL completa:", `${API_BASE_URL}/api/Evento`)

            const token = localStorage.getItem("authToken")
            console.log("Token presente:", token ? "Sí" : "No")

            console.log("Enviando petición POST...")
            const startTime = Date.now()

            const response = await api.post("/api/Evento", requestData)

            const endTime = Date.now()
            console.log(`Petición completada en ${endTime - startTime}ms`)
            console.log("=== RESPUESTA EXITOSA ===")
            console.log("Status:", response.status)
            console.log("Headers:", response.headers)
            console.log("Data:", response.data)

            return response.data
        } catch (error) {
            console.error("=== ERROR EN CREACIÓN DE EVENTO ===")
            console.error("Mensaje:", error.message)
            console.error("Response status:", error.response?.status)
            console.error("Response headers:", error.response?.headers)
            console.error("Response data:", error.response?.data)
            console.error("Request data:", eventData)

            throw error
        }
    },

    async update(id, eventData) {
        try {
            const requestData = {
                name: eventData.name,
                descrp: eventData.descrp,
                eventoDate: eventData.eventoDate,
                location: eventData.location,
                bannerImageUrl: eventData.bannerImageUrl || "",
                rows: eventData.rows,
                seatsPerRow: eventData.seatsPerRow,
            }

            console.log("Updating event with data:", requestData)
            console.log("URL completa:", `${API_BASE_URL}/api/Evento/${id}`)

            const token = localStorage.getItem("authToken")
            console.log("Token presente:", token ? "Sí" : "No")

            console.log("Enviando petición PUT...")
            const startTime = Date.now()

            const response = await api.put(`/api/Evento/${id}`, requestData)

            const endTime = Date.now()
            console.log(`Petición completada en ${endTime - startTime}ms`)
            console.log("=== RESPUESTA EXITOSA ===")
            console.log("Status:", response.status)
            console.log("Headers:", response.headers)
            console.log("Data:", response.data)

            return response.data
        } catch (error) {
            console.error("=== ERROR EN ACTUALIZACIÓN DE EVENTO ===")
            console.error("Mensaje:", error.message)
            console.error("Response status:", error.response?.status)
            console.error("Response headers:", error.response?.headers)
            console.error("Response data:", error.response?.data)
            console.error("Request config:", error.config)
            console.error("Stack trace:", error.stack)

            throw error
        }
    },

    async delete(id) {
        try {
            // Nota: No hay endpoint DELETE en la API proporcionada
            // Mantenemos el método por compatibilidad pero podría no funcionar
            const response = await api.delete(`/api/Evento/${id}`)
            return response.data
        } catch (error) {
            console.error("Delete event API error:", error)
            throw error
        }
    },

    async getSeatGrid(eventId) {
        try {
            const response = await api.get(`/api/Evento/${eventId}/grid`)
            console.log("Seat grid API response:", response.data)
            return response.data
        } catch (error) {
            console.error("Get seat grid API error:", error)
            throw error
        }
    },
}

// Servicios de asientos bloqueados
export const seatService = {
    async blockSeat(seatData) {
        try {
            console.log("Raw seat data received:", seatData)

            if (seatData.eventoId === undefined || seatData.eventoId === null) {
                throw new Error("eventoId es requerido")
            }
            if (seatData.seatRow === undefined || seatData.seatRow === null) {
                throw new Error("seatRow es requerido")
            }
            if (seatData.seatColumn === undefined || seatData.seatColumn === null) {
                throw new Error("seatColumn es requerido")
            }

            // Convertir directamente a string sin usar propiedades alternativas que pueden ser undefined
            const eventoIdStr = String(seatData.eventoId)
            const seatRowStr = String(seatData.seatRow)
            const seatColumnStr = String(seatData.seatColumn)

            console.log("String conversion:", { eventoIdStr, seatRowStr, seatColumnStr })

            // Usar parseInt con validación más robusta
            const eventoId = Number.parseInt(eventoIdStr, 10)
            const seatRow = Number.parseInt(seatRowStr, 10)
            const seatColumn = Number.parseInt(seatColumnStr, 10)

            console.log("Parsed values:", { eventoId, seatRow, seatColumn })

            // Validar que la conversión fue exitosa - permitir explícitamente 0 para fila y columna
            if (isNaN(eventoId)) {
                throw new Error(`eventoId inválido: ${seatData.eventoId} -> ${eventoIdStr} -> ${eventoId}`)
            }
            if (isNaN(seatRow)) {
                throw new Error(`seatRow inválido: ${seatData.seatRow} -> ${seatRowStr} -> ${seatRow}`)
            }
            if (isNaN(seatColumn)) {
                throw new Error(`seatColumn inválido: ${seatData.seatColumn} -> ${seatColumnStr} -> ${seatColumn}`)
            }

            // Validar rangos - permitir 0,0 explícitamente
            if (eventoId <= 0) {
                throw new Error("eventoId debe ser mayor a 0")
            }
            if (seatRow < 0) {
                throw new Error("seatRow debe ser 0 o mayor (0 es válido)")
            }
            if (seatColumn < 0) {
                throw new Error("seatColumn debe ser 0 o mayor (0 es válido)")
            }

            // Crear objeto con enteros válidos
            const requestData = {
                eventoId: eventoId,
                seatRow: seatRow,
                seatColumn: seatColumn,
            }

            console.log("Blocking seat with validated data (0,0 explicitly allowed):", requestData)
            console.log("URL completa:", `${API_BASE_URL}/api/BlockedSeat`)

            const token = localStorage.getItem("authToken")
            console.log("Token presente:", token ? "Sí" : "No")

            console.log("Enviando petición POST...")
            const startTime = Date.now()

            const response = await api.post("/api/BlockedSeat", requestData)

            const endTime = Date.now()
            console.log(`Petición completada en ${endTime - startTime}ms`)
            console.log("=== RESPUESTA EXITOSA ===")
            console.log("Status:", response.status)
            console.log("Headers:", response.headers)
            console.log("Data:", response.data)

            return response.data
        } catch (error) {
            console.error("Block seat API error:", error)
            throw error
        }
    },

    async unblockSeat(seatData) {
        try {
            console.log("Raw seat data received:", seatData)

            if (seatData.eventoId === undefined || seatData.eventoId === null) {
                throw new Error("eventoId es requerido")
            }
            if (seatData.seatRow === undefined || seatData.seatRow === null) {
                throw new Error("seatRow es requerido")
            }
            if (seatData.seatColumn === undefined || seatData.seatColumn === null) {
                throw new Error("seatColumn es requerido")
            }

            // Convertir directamente a string sin usar propiedades alternativas que pueden ser undefined
            const eventoIdStr = String(seatData.eventoId)
            const seatRowStr = String(seatData.seatRow)
            const seatColumnStr = String(seatData.seatColumn)

            console.log("String conversion:", { eventoIdStr, seatRowStr, seatColumnStr })

            // Usar parseInt con validación más robusta
            const eventoId = Number.parseInt(eventoIdStr, 10)
            const seatRow = Number.parseInt(seatRowStr, 10)
            const seatColumn = Number.parseInt(seatColumnStr, 10)

            console.log("Parsed values:", { eventoId, seatRow, seatColumn })

            // Validar que la conversión fue exitosa - permitir explícitamente 0 para fila y columna
            if (isNaN(eventoId)) {
                throw new Error(`eventoId inválido: ${seatData.eventoId} -> ${eventoIdStr} -> ${eventoId}`)
            }
            if (isNaN(seatRow)) {
                throw new Error(`seatRow inválido: ${seatData.seatRow} -> ${seatRowStr} -> ${seatRow}`)
            }
            if (isNaN(seatColumn)) {
                throw new Error(`seatColumn inválido: ${seatData.seatColumn} -> ${seatColumnStr} -> ${seatColumn}`)
            }

            // Validar rangos - permitir 0,0 explícitamente
            if (eventoId <= 0) {
                throw new Error("eventoId debe ser mayor a 0")
            }
            if (seatRow < 0) {
                throw new Error("seatRow debe ser 0 o mayor (0 es válido)")
            }
            if (seatColumn < 0) {
                throw new Error("seatColumn debe ser 0 o mayor (0 es válido)")
            }

            // Crear objeto con enteros válidos
            const requestData = {
                eventoId: eventoId,
                seatRow: seatRow,
                seatColumn: seatColumn,
            }

            console.log("Unblocking seat with validated data (0,0 explicitly allowed):", requestData)
            console.log("URL completa:", `${API_BASE_URL}/api/BlockedSeat`)

            const token = localStorage.getItem("authToken")
            console.log("Token presente:", token ? "Sí" : "No")

            console.log("Enviando petición DELETE...")
            const startTime = Date.now()

            const response = await api.delete("/api/BlockedSeat", { data: requestData })

            const endTime = Date.now()
            console.log(`Petición completada en ${endTime - startTime}ms`)
            console.log("=== RESPUESTA EXITOSA ===")
            console.log("Status:", response.status)
            console.log("Headers:", response.headers)
            console.log("Data:", response.data)

            return response.data
        } catch (error) {
            console.error("Unblock seat API error:", error)
            throw error
        }
    },

    async getBlockedSeats(eventId) {
        try {
            // Obtener asientos bloqueados a través del grid del evento
            const gridResponse = await eventService.getSeatGrid(eventId)
            const blockedSeats = []

            if (gridResponse && gridResponse.rows) {
                gridResponse.rows.forEach((row) => {
                    row.seats.forEach((seat) => {
                        if (seat.type === "Bloqueado" || seat.type === "Blocked") {
                            blockedSeats.push({
                                row: seat.row,
                                column: seat.column,
                                isBlocked: true,
                            })
                        }
                    })
                })
            }

            return blockedSeats
        } catch (error) {
            console.error("Get blocked seats API error:", error)
            return []
        }
    },
}

// Servicios de boletos
export const ticketService = {
    async create(ticketData) {
        try {
            console.log("=== INICIANDO COMPRA DE BOLETO ===")
            console.log("Datos recibidos:", ticketData)
            console.log("API Base URL:", API_BASE_URL)

            if (!ticketData.eventoId) {
                throw new Error("ID del evento es requerido")
            }
            if (ticketData.seatRow === undefined || ticketData.seatRow === null) {
                throw new Error("Fila del asiento es requerida")
            }
            if (ticketData.seatColumn === undefined || ticketData.seatColumn === null) {
                throw new Error("Columna del asiento es requerida")
            }

            const eventoId = Number.parseInt(ticketData.eventoId, 10)
            const seatRow = Number.parseInt(ticketData.seatRow, 10)
            const seatColumn = Number.parseInt(ticketData.seatColumn, 10)

            console.log("[v0] Validación de datos:")
            console.log("[v0] - eventoId original:", ticketData.eventoId, "-> parseado:", eventoId)
            console.log("[v0] - seatRow original:", ticketData.seatRow, "-> parseado:", seatRow)
            console.log("[v0] - seatColumn original:", ticketData.seatColumn, "-> parseado:", seatColumn)

            if (isNaN(eventoId) || eventoId <= 0) {
                throw new Error("ID del evento debe ser un número válido")
            }
            if (isNaN(seatRow) || seatRow < 0) {
                throw new Error("Fila del asiento debe ser un número válido (0 o mayor)")
            }
            if (isNaN(seatColumn) || seatColumn < 0) {
                throw new Error("Columna del asiento debe ser un número válido (0 o mayor)")
            }

            const requestData = {
                eventoId: eventoId,
                seatRow: seatRow,
                seatColumn: seatColumn,
            }

            console.log("[v0] Datos procesados para enviar:", requestData)
            console.log("[v0] JSON que se enviará:", JSON.stringify(requestData, null, 2))
            console.log("[v0] URL completa:", `${API_BASE_URL}/api/Boleto`)

            const token = localStorage.getItem("authToken")
            if (!token) {
                throw new Error("No hay token de autenticación. Por favor, inicia sesión nuevamente.")
            }
            console.log("[v0] Token presente:", token ? "Sí" : "No")
            console.log("[v0] Primeros 20 caracteres del token:", token ? token.substring(0, 20) + "..." : "N/A")

            console.log("[v0] Verificando conectividad con el servidor...")
            try {
                const healthCheck = await fetch(`${API_BASE_URL}/api/Evento`, {
                    method: "HEAD",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                console.log("[v0] Health check status:", healthCheck.status)
                if (healthCheck.status === 401) {
                    throw new Error("Token de autenticación inválido o expirado")
                }
            } catch (healthError) {
                console.error("[v0] Error de conectividad:", healthError)
                if (healthError.message.includes("Token de autenticación")) {
                    throw healthError
                }
                throw new Error(
                    "No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:5264",
                )
            }

            console.log("[v0] Enviando petición HTTP POST...")
            const startTime = Date.now()

            const response = await Promise.race([
                api.post("/api/Boleto", requestData, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    timeout: 25000,
                }),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Timeout: La petición tardó más de 25 segundos")), 25000),
                ),
            ])

            const endTime = Date.now()
            console.log(`[v0] Petición completada en ${endTime - startTime}ms`)

            console.log("[v0] === RESPUESTA EXITOSA ===")
            console.log("[v0] Status:", response.status)
            console.log("[v0] Headers de respuesta:", response.headers)
            console.log("[v0] Data:", response.data)

            if (!response.data) {
                console.warn("[v0] Advertencia: La respuesta no contiene datos")
                throw new Error("La respuesta del servidor está vacía")
            }

            if (!response.data.id) {
                console.warn("[v0] Advertencia: La respuesta no contiene ID del boleto")
            }

            console.log("[v0] Boleto creado con ID:", response.data.id || "ID no disponible")

            if (errorContext) {
                errorContext.showSuccess("¡Boleto comprado exitosamente!")
            }

            return response.data
        } catch (error) {
            console.error("[v0] === ERROR EN COMPRA DE BOLETO ===")
            console.error("[v0] Tipo de error:", error.constructor.name)
            console.error("[v0] Mensaje:", error.message)
            console.error("[v0] Response status:", error.response?.status)
            console.error("[v0] Response headers:", error.response?.headers)
            console.error("[v0] Response data:", error.response?.data)
            console.error("[v0] Request data enviado:", ticketData)
            console.error("[v0] Stack trace:", error.stack)

            if (error.message.includes("Timeout")) {
                throw new Error(
                    "La compra está tardando demasiado. Verifica tu conexión a internet y que el servidor esté funcionando.",
                )
            }

            if (error.code === "ECONNREFUSED" || error.message.includes("Network Error")) {
                throw new Error(
                    "No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:5264",
                )
            }

            if (error.response?.status === 400) {
                const errorData = error.response.data
                console.log("[v0] Datos de error 400:", errorData)

                if (typeof errorData === "string" && errorData.trim()) {
                    throw new Error(errorData)
                } else if (errorData?.message) {
                    throw new Error(errorData.message)
                } else if (errorData?.title) {
                    throw new Error(errorData.title)
                } else if (errorData?.detail) {
                    throw new Error(errorData.detail)
                } else if (errorData?.errors) {
                    const errorMessages = []
                    for (const field in errorData.errors) {
                        if (Array.isArray(errorData.errors[field])) {
                            errorMessages.push(...errorData.errors[field])
                        } else {
                            errorMessages.push(errorData.errors[field])
                        }
                    }
                    if (errorMessages.length > 0) {
                        throw new Error(errorMessages.join(", "))
                    }
                }
                throw new Error("Error de validación en los datos del boleto")
            }

            if (error.response?.status === 409) {
                throw new Error("El asiento ya está ocupado o no está disponible")
            }

            if (error.response?.status === 401) {
                localStorage.removeItem("authToken")
                localStorage.removeItem("userData")
                throw new Error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente")
            }

            if (error.response?.status === 403) {
                throw new Error("No tienes permisos para comprar boletos")
            }

            if (error.response?.status === 404) {
                throw new Error("El evento no existe o no está disponible")
            }

            if (error.response?.status >= 500) {
                throw new Error("Error interno del servidor. Intenta nuevamente en unos momentos")
            }

            throw error
        }
    },

    async getMyTickets() {
        try {
            console.log("=== OBTENIENDO MIS BOLETOS ===")
            const token = localStorage.getItem("authToken")
            if (!token) {
                throw new Error("No hay token de autenticación. Por favor, inicia sesión nuevamente.")
            }

            const response = await api.get("/api/Boleto/mis-boletos")
            console.log("My tickets response:", response.data)
            return Array.isArray(response.data) ? response.data : []
        } catch (error) {
            console.error("Get my tickets API error:", error)
            if (error.response?.status === 404) {
                // No tickets found is not really an error
                return []
            }
            throw error
        }
    },

    async getById(id) {
        try {
            console.log("=== OBTENIENDO BOLETO POR ID ===", id)
            const response = await api.get(`/api/Boleto/${id}`)
            console.log("Ticket by ID response:", response.data)
            return response.data
        } catch (error) {
            console.error("Get ticket by ID API error:", error)
            throw error
        }
    },

    async delete(id) {
        try {
            // Nota: No hay endpoint DELETE para boletos en la API proporcionada
            // Mantenemos el método por compatibilidad pero podría no funcionar
            const response = await api.delete(`/api/Boleto/${id}`)
            return response.data
        } catch (error) {
            console.error("Delete ticket API error:", error)
            throw error
        }
    },

    async refreshSeatStatus(eventId) {
        try {
            // Obtener el grid actualizado del evento para refrescar el estado
            return await eventService.getSeatGrid(eventId)
        } catch (error) {
            console.error("Error refreshing seat status:", error)
            return null
        }
    },
}

export default api

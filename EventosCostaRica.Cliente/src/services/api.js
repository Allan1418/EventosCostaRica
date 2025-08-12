import axios from "axios"

const API_BASE_URL =
    process.env.NODE_ENV === "production"
        ? "https://eventoscostarica-api.azurewebsites.net/api"
        : "https://localhost:7011/api"

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 15000, // Aumentado timeout a 15 segundos
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
})

api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`)
        return response
    },
    (error) => {
        console.error("API Error Details:", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
        })

        if (error.response?.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            window.location.href = "/login"
        }
        return Promise.reject(error)
    },
)

// Auth API
export const authAPI = {
    login: (credentials) => api.post("/User/login", credentials),
    register: (userData) => api.post("/User/register", userData),
    getProfile: () => api.get("/User/profile"),
    logout: () => api.post("/User/logout"),
}

// Events API
export const eventosAPI = {
    getAll: () => api.get("/Evento"),
    getById: (id) => api.get(`/Evento/${id}`),
    create: (evento) => api.post("/Evento", evento),
    update: (id, evento) => api.put(`/Evento/${id}`, evento),
    getEventoGrid: (id) => api.get(`/Evento/${id}/grid`),
}

// Boletos API
export const boletosAPI = {
    create: (boleto) => api.post("/Boleto", boleto),
    getMisBoletos: () => api.get("/Boleto/mis-boletos"),
    getById: (id) => api.get(`/Boleto/${id}`),
}

// Blocked Seats API
export const blockedSeatsAPI = {
    blockSeat: (data) => api.post("/BlockedSeat", data),
    unblockSeat: (data) => api.delete("/BlockedSeat", { data }),
}

export default api

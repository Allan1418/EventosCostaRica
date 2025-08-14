import { getErrorMessage } from "../services/api"

/**
 * Maneja errores de forma consistente en toda la aplicación
 * @param {Error} error - El error capturado
 * @param {Function} setError - Función para establecer el mensaje de error en el estado
 * @param {string} fallbackMessage - Mensaje de fallback si no se puede obtener uno del backend
 */
export const handleApiError = (error, setError, fallbackMessage = "Ocurrio un error inesperado") => {
    console.error("API Error:", error)
    const errorMessage = getErrorMessage(error)
    setError(errorMessage || fallbackMessage)
}

/**
 * Maneja respuestas exitosas con posibles mensajes
 * @param {Object} response - Respuesta de la API
 * @param {Function} onSuccess - Callback para manejar el éxito
 * @param {Function} setError - Función para establecer errores
 */
export const handleApiResponse = (response, onSuccess, setError) => {
    if (response && response.success !== false) {
        if (onSuccess) onSuccess(response)
    } else {
        const errorMessage = response?.message || "Ocurrio un error en la operación"
        setError(errorMessage)
    }
}

/**
 * Wrapper para llamadas a la API que maneja errores automáticamente
 * @param {Function} apiCall - Función que hace la llamada a la API
 * @param {Function} setError - Función para establecer errores
 * @param {Function} setLoading - Función para manejar el estado de carga
 * @param {Function} onSuccess - Callback para el éxito
 * @param {Function} onError - Callback adicional para errores
 */
export const executeApiCall = async (apiCall, setError, setLoading, onSuccess, onError) => {
    try {
        setLoading(true)
        setError("")

        const result = await apiCall()

        if (result && result.success !== false) {
            if (onSuccess) onSuccess(result)
        } else {
            const errorMessage = result?.message || "Ocurrio un error en la operación"
            setError(errorMessage)
            if (onError) onError(result)
        }
    } catch (error) {
        const errorMessage = getErrorMessage(error)
        setError(errorMessage)
        if (onError) onError(error)
    } finally {
        setLoading(false)
    }
}

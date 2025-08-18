"use client"

import { useState } from "react"
import { ticketService } from "../services/api"

const TestBoleto = () => {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [logs, setLogs] = useState([])

    const [formData, setFormData] = useState({
        eventoId: 1,
        seatRow: 0,
        seatColumn: 0,
    })

    const addLog = (message, type = "info") => {
        const timestamp = new Date().toLocaleTimeString()
        setLogs((prev) => [...prev, { message, type, timestamp }])
        console.log(`[v0] ${message}`)
    }

    const testCreateBoleto = async () => {
        setLoading(true)
        setResult(null)
        setError(null)
        setLogs([])

        try {
            addLog("🚀 Iniciando test de createBoleto API")

            // Verificar token
            const token = localStorage.getItem("token")
            addLog(`🔑 Token encontrado: ${token ? "SÍ" : "NO"}`, token ? "success" : "error")

            if (token) {
                addLog(`📝 Token (primeros 20 chars): ${token.substring(0, 20)}...`)
            }

            // Verificar datos del formulario
            addLog(`📋 Datos a enviar: ${JSON.stringify(formData, null, 2)}`)

            // Verificar conectividad con el backend
            addLog("🌐 Verificando conectividad con el backend...")

            try {
                const response = await fetch("http://localhost:5264/api/health", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                addLog(`🏥 Health check: ${response.status} ${response.statusText}`, response.ok ? "success" : "warning")
            } catch (healthError) {
                addLog(`❌ Error en health check: ${healthError.message}`, "error")
            }

            // Llamar a la API
            addLog("📞 Llamando a ticketService.create()...")

            const apiResult = await ticketService.create(formData)

            addLog("✅ API llamada exitosa!", "success")
            addLog(`📦 Respuesta recibida: ${JSON.stringify(apiResult, null, 2)}`, "success")

            setResult(apiResult)
        } catch (apiError) {
            addLog(`❌ Error en la API: ${apiError.message}`, "error")

            if (apiError.response) {
                addLog(`📊 Status: ${apiError.response.status}`, "error")
                addLog(`📋 Headers: ${JSON.stringify(apiError.response.headers, null, 2)}`, "error")
                addLog(`💬 Data: ${JSON.stringify(apiError.response.data, null, 2)}`, "error")
            }

            if (apiError.request) {
                addLog(`📡 Request: ${JSON.stringify(apiError.request, null, 2)}`, "error")
            }

            setError(apiError)
        } finally {
            setLoading(false)
            addLog("🏁 Test completado")
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: Number.parseInt(value) || 0,
        }))
    }

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1>🧪 Test API CreateBoleto</h1>

            <div style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "5px" }}>
                <h3>📝 Datos del Boleto</h3>
                <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <div>
                        <label>Evento ID:</label>
                        <input
                            type="number"
                            name="eventoId"
                            value={formData.eventoId}
                            onChange={handleInputChange}
                            style={{ width: "100%", padding: "5px" }}
                        />
                    </div>
                    <div>
                        <label>Fila del Asiento:</label>
                        <input
                            type="number"
                            name="seatRow"
                            value={formData.seatRow}
                            onChange={handleInputChange}
                            style={{ width: "100%", padding: "5px" }}
                            min="0"
                        />
                    </div>
                    <div>
                        <label>Columna del Asiento:</label>
                        <input
                            type="number"
                            name="seatColumn"
                            value={formData.seatColumn}
                            onChange={handleInputChange}
                            style={{ width: "100%", padding: "5px" }}
                            min="0"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={testCreateBoleto}
                disabled={loading}
                style={{
                    padding: "10px 20px",
                    backgroundColor: loading ? "#ccc" : "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "16px",
                }}
            >
                {loading ? "⏳ Probando..." : "🚀 Probar CreateBoleto API"}
            </button>

            {/* Logs */}
            <div style={{ marginTop: "20px" }}>
                <h3>📋 Logs de Debugging</h3>
                <div
                    style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        borderRadius: "5px",
                        padding: "10px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        fontFamily: "monospace",
                        fontSize: "12px",
                    }}
                >
                    {logs.map((log, index) => (
                        <div
                            key={index}
                            style={{
                                color:
                                    log.type === "error"
                                        ? "red"
                                        : log.type === "success"
                                            ? "green"
                                            : log.type === "warning"
                                                ? "orange"
                                                : "black",
                                marginBottom: "5px",
                            }}
                        >
                            <span style={{ color: "#666" }}>[{log.timestamp}]</span> {log.message}
                        </div>
                    ))}
                </div>
            </div>

            {/* Resultado */}
            {result && (
                <div style={{ marginTop: "20px" }}>
                    <h3>✅ Resultado Exitoso</h3>
                    <pre
                        style={{
                            backgroundColor: "#d4edda",
                            border: "1px solid #c3e6cb",
                            borderRadius: "5px",
                            padding: "10px",
                            overflow: "auto",
                        }}
                    >
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            {/* Error */}
            {error && (
                <div style={{ marginTop: "20px" }}>
                    <h3>❌ Error Detectado</h3>
                    <pre
                        style={{
                            backgroundColor: "#f8d7da",
                            border: "1px solid #f5c6cb",
                            borderRadius: "5px",
                            padding: "10px",
                            overflow: "auto",
                        }}
                    >
                        {JSON.stringify(error.message, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}

export default TestBoleto

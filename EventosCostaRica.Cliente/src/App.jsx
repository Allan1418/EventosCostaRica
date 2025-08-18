"use client"

import React from "react"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ErrorProvider } from "./components/ErrorHandler"
import { setErrorContext } from "./services/api"
import { useError } from "./components/ErrorHandler"
import Layout from "./components/Layout/Layout"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import CreateEvent from "./pages/CreateEvent"
import EditEvent from "./pages/EditEvent"
import EventDetail from "./pages/EventDetail"
import PurchaseTicket from "./pages/PurchaseTicket"
import UserList from "./pages/UserList"
import EditUser from "./pages/EditUser"
import Profile from "./pages/Profile"
import MyTickets from "./pages/MyTickets"
import TicketInfo from "./pages/TicketInfo"
import TestBoleto from "./test-boleto/TestBoleto"
import "./App.css"

function AppContent() {
    const errorContext = useError()

    // Establecer el contexto de errores para el interceptor de axios
    React.useEffect(() => {
        setErrorContext(errorContext)
    }, [errorContext])

    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/evento/:id" element={<EventDetail />} />

                        <Route
                            path="/crear-evento"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <CreateEvent />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/editar-evento/:id"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <EditEvent />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/usuarios"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <UserList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/editar-usuario/:id"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <EditUser />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/perfil"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/comprar-boleto/:eventId"
                            element={
                                <ProtectedRoute>
                                    <PurchaseTicket />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/mis-boletos"
                            element={
                                <ProtectedRoute>
                                    <MyTickets />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/boleto/:id"
                            element={
                                <ProtectedRoute>
                                    <TicketInfo />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/test-boleto"
                            element={
                                <ProtectedRoute adminOnly={true}>
                                    <TestBoleto />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    )
}

function App() {
    return (
        <ErrorProvider>
            <AppContent />
        </ErrorProvider>
    )
}

export { App as EventosCostaRicaApp }
export default App

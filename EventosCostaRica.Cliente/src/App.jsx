import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { CartProvider } from "./context/CartContext"
import Layout from "./components/Layout/Layout"
import Home from "./pages/Home"
import EventDetail from "./pages/EventDetail"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Cart from "./pages/Cart"
import MyTickets from "./pages/MyTickets"
import CreateEvent from "./pages/CreateEvent"
import PurchaseTicket from "./pages/PurchaseTicket"
import ProtectedRoute from "./components/ProtectedRoute"

// Importar todos los archivos CSS
import "./index.css"
import "./components/Layout/Header.css"
import "./components/Layout/Footer.css"
import "./components/Layout/Layout.css"
import "./components/Events/EventCard.css"
import "./components/Events/SeatSelector.css"
import "./pages/Home.css"
import "./pages/EventDetail.css"
import "./pages/Auth.css" // Para Login y Register
import "./pages/Cart.css"
import "./pages/MyTickets.css"
import "./pages/CreateEvent.css"
import "./pages/PurchaseTicket.css"

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/evento/:id" element={<EventDetail />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/carrito" element={<Cart />} />
                            <Route
                                path="/mis-boletos"
                                element={
                                    <ProtectedRoute>
                                        <MyTickets />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/crear-evento"
                                element={
                                    <ProtectedRoute>
                                        <CreateEvent />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/comprar-ticket/:eventId"
                                element={
                                    <ProtectedRoute>
                                        <PurchaseTicket />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </Layout>
                </Router>
            </CartProvider>
        </AuthProvider>
    )
}

export default App

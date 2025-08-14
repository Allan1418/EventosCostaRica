"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext()

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([])

    useEffect(() => {
        loadCartFromStorage()
    }, [])

    useEffect(() => {
        saveCartToStorage()
    }, [cartItems])

    const loadCartFromStorage = () => {
        try {
            const savedCart = localStorage.getItem("cartItems")
            if (savedCart) {
                setCartItems(JSON.parse(savedCart))
            }
        } catch (error) {
            console.error("Error loading cart from storage:", error)
        }
    }

    const saveCartToStorage = () => {
        try {
            localStorage.setItem("cartItems", JSON.stringify(cartItems))
        } catch (error) {
            console.error("Error saving cart to storage:", error)
        }
    }

    const addToCart = (evento, seats) => {
        try {
            const newItems = seats.map((seat) => ({
                id: `${evento.id}-${seat.fila}-${seat.columna}`,
                eventoId: evento.id,
                eventoName: evento.name,
                eventoDate: evento.eventoDate,
                eventoLocation: evento.location,
                fila: seat.fila,
                columna: seat.columna,
                precio: evento.precio || 15000,
                addedAt: new Date().toISOString(),
            }))

            // Verificar si algún asiento ya está en el carrito
            const duplicates = newItems.filter((newItem) => cartItems.some((existingItem) => existingItem.id === newItem.id))

            if (duplicates.length > 0) {
                return {
                    success: false,
                    message: "Algunos asientos ya están en tu carrito",
                }
            }

            setCartItems((prev) => [...prev, ...newItems])
            return {
                success: true,
                message: `${newItems.length} asiento(s) agregado(s) al carrito`,
            }
        } catch (error) {
            console.error("Error adding to cart:", error)
            return {
                success: false,
                message: "Error al agregar al carrito",
            }
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => prev.filter((item) => item.id !== itemId))
    }

    const clearCart = () => {
        setCartItems([])
    }

    const getTotalItems = () => {
        return cartItems.length
    }

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => total + item.precio, 0)
    }

    const getItemsByEvent = () => {
        const grouped = {}
        cartItems.forEach((item) => {
            if (!grouped[item.eventoId]) {
                grouped[item.eventoId] = {
                    evento: {
                        id: item.eventoId,
                        name: item.eventoName,
                        eventoDate: item.eventoDate,
                        location: item.eventoLocation,
                    },
                    items: [],
                }
            }
            grouped[item.eventoId].items.push(item)
        })
        return Object.values(grouped)
    }

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getItemsByEvent,
    }

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

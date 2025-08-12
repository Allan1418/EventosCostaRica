"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCartItems = localStorage.getItem("cartItems")
      return storedCartItems ? JSON.parse(storedCartItems) : []
    } catch (error) {
      console.error("Failed to parse cart items from localStorage:", error)
      return []
    }
  })
  const [selectedSeats, setSelectedSeats] = useState([]) // Asientos seleccionados para el evento actual

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems))
  }, [cartItems])

  // Función para agregar un evento y sus asientos al carrito
  const addToCart = (evento, seats) => {
    // Generar un ID único para el grupo de boletos (evento + asientos específicos)
    // Esto permite tener el mismo evento con diferentes selecciones de asientos como ítems separados
    const itemId = `${evento.id}-${JSON.stringify(seats.sort((a, b) => a.fila - b.fila || a.columna - b.columna))}`

    const existingItemIndex = cartItems.findIndex((item) => item.id === itemId)

    if (existingItemIndex > -1) {
      // Si ya existe un ítem con la misma selección de asientos, no se agrega de nuevo
      // Podrías manejar esto de otra forma si quieres permitir múltiples compras de los mismos asientos
      console.warn("Estos asientos ya están en el carrito para este evento.")
      return
    } else {
      const newItem = {
        id: itemId,
        evento: evento,
        seats: seats,
        quantity: seats.length,
        totalPrice: evento.precio * seats.length,
      }
      setCartItems((prevItems) => [...prevItems, newItem])
    }
    setSelectedSeats([]) // Limpiar asientos seleccionados después de agregar al carrito
  }

  // Función para remover un ítem del carrito por su ID
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  // Función para vaciar todo el carrito
  const clearCart = () => {
    setCartItems([])
    setSelectedSeats([]) // También limpiar asientos seleccionados
  }

  // Función para obtener el número total de ítems (grupos de boletos) en el carrito
  const getTotalItems = () => {
    return cartItems.length
  }

  // Función para obtener el precio total de todos los boletos en el carrito
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
        selectedSeats,
        setSelectedSeats,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  return useContext(CartContext)
}

import { createContext, useContext, useState } from "react";

// Create the context
const CartContext = createContext();

// Custom hook for easy usage
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});

  // Add product to cart
  const addToCart = (product, options = {}) => {
    const key = product.id;

    setCart((prev) => {
      // If product already exists, merge and update quantity
      if (prev[key]) {
        const existing = prev[key];
        return {
          ...prev,
          [key]: {
            ...existing,
            ...options,
            quantity: (existing.quantity || 1) + (options.quantity || 1),
          },
        };
      } else {
        // New product
        return {
          ...prev,
          [key]: {
            ...product,
            ...options,
            quantity: options.quantity || 1,
          },
        };
      }
    });
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  // Clear entire cart
  const clearCart = () => setCart({});

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState({});

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Firestore sync whenever cart changes
  useEffect(() => {
    const syncCartToFirestore = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        for (const productId in cart) {
          const item = cart[productId];
          if (!item) continue;

          const cartRef = doc(db, "users", user.uid, "cart", productId);
          await setDoc(cartRef, {
            productId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            description: item.description || "",
            colors: item.colors || [],
            sizes: item.sizes || [],
            selectedOptions: item.selectedOptions || {},
            quantity: item.quantity || 1,
            deliveryType: item.deliveryType || "",
            addedAt: new Date(),
          });
        }
      } catch (err) {
        console.error("Failed to sync cart:", err);
        toast.error("Failed to sync cart with server.");
      }
    };

    if (Object.keys(cart).length > 0) syncCartToFirestore();
  }, [cart]);

  // Add a product to the cart
  const addToCart = (product, options = {}) => {
    setCart((prev) => {
      const existing = prev[product.id] || {};
      const quantity = options.quantity || existing.quantity || 1;

      return {
        ...prev,
        [product.id]: {
          ...product,
          selectedOptions: options,
          quantity,
          deliveryType: existing.deliveryType || "", // preserve deliveryType
        },
      };
    });

    if (product?.name) toast.success(`${product.name} added to cart!`);
  };

  // Remove a product from the cart
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  // Update quantity, options, or deliveryType of an existing item
  const updateCartItem = (productId, updates) => {
    setCart((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        ...updates,
      },
    }));
  };

  // Clear the entire cart
  const clearCart = () => setCart({});

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateCartItem, clearCart, setCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook for easier access
export const useCart = () => useContext(CartContext);

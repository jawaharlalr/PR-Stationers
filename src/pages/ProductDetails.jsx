// src/pages/ProductDetails.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const product = location.state?.product;

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const colorClasses = {
    Red: "bg-red-500",
    Blue: "bg-blue-600",
    Green: "bg-green-500",
    Yellow: "bg-yellow-400",
    Black: "bg-black",
    White: "bg-white border-gray-300",
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-600">
        Product not found.
      </div>
    );
  }

  const added = !!cart[product.id];

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize || quantity < 1) {
      toast.error("Please select color, size, and a valid quantity.");
      return;
    }
    if (added) {
      toast.error(`${product.name} is already in the cart.`);
      return;
    }

    // Add to local cart context
    addToCart(product, { color: selectedColor, size: selectedSize, quantity });

    // Persist in Firebase under current user's cart
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please login to save cart.");
        return;
      }
      const cartRef = doc(db, "users", user.uid, "cart", product.id);
      await setDoc(cartRef, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        selectedOptions: { color: selectedColor, size: selectedSize },
        quantity,
        createdAt: new Date(),
      });
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 relative">
      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Product Image */}
        <div className="flex-1 flex justify-center items-center bg-gray-50 p-6 rounded-xl shadow-md">
          <img
            src={product.image}
            alt={product.name}
            className="w-auto max-w-full h-64 md:h-96 object-contain"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {product.name}
          </h1>
          <p className="text-gray-500 capitalize">Category: {product.category}</p>
          <p className="text-2xl font-semibold text-green-600">₹{product.price}</p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-700">Color:</span>
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? "border-black" : "border-gray-300"
                  } ${colorClasses[color] || "bg-gray-200"}`}
                  title={color}
                ></button>
              ))}
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-700">Size:</span>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 rounded-full border transition ${
                    selectedSize === size
                      ? "bg-[#2563eb] text-white border-[#2563eb]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Qty:</span>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-20 px-2 py-1 border rounded text-gray-700"
            />
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={added}
            className={`px-4 py-2 rounded-full text-white text-sm md:text-base font-medium transition w-max mt-2 ${
              added ? "bg-gray-400 cursor-not-allowed" : "bg-[#2563eb] hover:bg-[#1e40af]"
            }`}
          >
            {added ? "Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

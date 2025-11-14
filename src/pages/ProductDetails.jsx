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

  // FINAL merged values from Products.jsx
  const colors = product?.colors || [];
  const sizes = product?.sizes || [];

  useEffect(() => {
    if (!product) return;

    // Auto-select when empty
    if (colors.length === 0) {
      setSelectedColor("Default");
    }
    if (sizes.length === 0) {
      setSelectedSize("Default");
    }
  }, [product]);

  const colorClasses = {
    Red: "bg-red-500",
    Blue: "bg-blue-600",
    Green: "bg-green-500",
    Yellow: "bg-yellow-400",
    Black: "bg-black",
    White: "bg-white border-gray-300",
    Default: "bg-gray-300",
  };

  if (!product) {
    return (
      <div className="px-4 py-10 mx-auto text-center text-gray-600 max-w-7xl min-h-[80vh]">
        Product not found.
      </div>
    );
  }

  const added = !!cart[product.id];

  const handleAddToCart = async () => {
    // Validation
    if (colors.length > 0 && !selectedColor) {
      toast.error("Please select a color.");
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (quantity < 1) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error("Please login to save cart.");
      return;
    }

    if (added) {
      toast.error(`${product.name} is already in the cart.`);
      return;
    }

    try {
      const cartRef = doc(db, "users", user.uid, "cart", product.id.toString());
      await setDoc(cartRef, {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl || product.image,
        category: product.category,
        description: product.description || "",
        colors,
        sizes,
        selectedOptions: { color: selectedColor, size: selectedSize },
        quantity,
        addedAt: new Date(),
      });

      addToCart(product, {
        color: selectedColor,
        size: selectedSize,
        quantity,
      });

      toast.success(`${product.name} added to cart successfully!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add cart. Please try again.");
    }
  };

  const pageWrapperClasses =
    "relative max-w-5xl px-4 py-10 pb-32 mx-auto min-h-[calc(100vh-80px)]";

  return (
    <div className={pageWrapperClasses}>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute text-gray-500 transition top-4 right-4 hover:text-gray-700"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div className="flex flex-col gap-10 md:flex-row">
        {/* Product Image */}
        <div className="flex items-center justify-center flex-1 p-6 shadow-md bg-gray-50 rounded-xl">
          <img
            src={product.imageUrl || product.image}
            alt={product.name}
            className="object-contain w-auto h-64 max-w-full md:h-96"
          />
        </div>

        {/* Details */}
        <div className="flex flex-col flex-1 gap-4">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            {product.name}
          </h1>

          <p className="text-gray-500 capitalize">Category: {product.category}</p>

          {product.description && (
            <p className="text-gray-600">{product.description}</p>
          )}

          <p className="text-2xl font-semibold text-green-600">
            ₹{product.price}
          </p>

          {/* Colors */}
          {colors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-gray-700">Color:</span>

              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? "border-black" : "border-gray-300"
                  } ${colorClasses[color] || "bg-gray-200"}`}
                  title={color}
                />
              ))}
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-gray-700">Size:</span>

              {sizes.map((size) => (
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
              className="w-20 px-2 py-1 text-gray-700 border rounded"
            />
          </div>

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

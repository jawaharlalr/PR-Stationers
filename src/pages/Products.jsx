import { useLocation, useNavigate } from "react-router-dom";
import products from "../data/products";
import { Home } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();

  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  const normalize = (str) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredProducts = searchQuery.trim()
    ? products.filter((product) =>
        normalize(product.name).includes(normalize(searchQuery))
      )
    : products;

  const handleCardClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } }); // pass product via state
  };

  const colorClasses = {
    Red: "bg-red-500",
    Blue: "bg-blue-600",
    Green: "bg-green-500",
    Yellow: "bg-yellow-400",
    Black: "bg-black",
    White: "bg-white border-gray-300",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 relative">
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        aria-label="Home"
      >
        <Home size={24} />
      </button>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-10">
          No products found for "<span className="font-semibold">{searchQuery}</span>"
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Image */}
              <div
                className="w-full flex justify-center items-center bg-gray-50 p-4"
                onClick={() => handleCardClick(product)}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-auto max-w-full h-32 md:h-40 object-contain"
                />
              </div>

              {/* Product Details */}
              <div className="p-4 flex flex-col gap-2">
                <h3
                  className="text-sm md:text-base font-medium text-gray-800"
                  onClick={() => handleCardClick(product)}
                >
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 capitalize">
                  Category: {product.category}
                </p>
                <p className="text-sm font-semibold text-green-600">
                  ₹{product.price}
                </p>

                {/* Available Colors */}
                {product.colors?.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    <span className="text-xs text-gray-500">Available Color:</span>
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className={`w-5 h-5 rounded-full border-2 ${colorClasses[color] || "bg-gray-200"}`}
                        title={color}
                      ></span>
                    ))}
                  </div>
                )}

                {/* Available Sizes */}
                {product.sizes?.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    <span className="text-xs text-gray-500">Available Size:</span>
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="px-2 py-0.5 text-xs border rounded-full text-gray-700 bg-gray-100"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                )}

                {/* Button */}
                <button
                  onClick={() => handleCardClick(product)}
                  className={`px-3 py-1 rounded-full text-white text-sm font-medium transition mt-2 ${
                    cart[product.id]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#2563eb] hover:bg-[#1e40af]"
                  }`}
                  disabled={!!cart[product.id]}
                >
                  {cart[product.id] ? "Added" : "View Details"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

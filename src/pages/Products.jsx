import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home } from "lucide-react";
import { useCart } from "../context/CartContext";

import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

// Local products
import localProducts from "../data/products";

export default function Products() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();

  const [products, setProducts] = useState([]);

  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";

  // Load & merge products from firestore + local
  useEffect(() => {
    const loadProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      const firestoreProducts = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // 🔥 MERGE LOGIC — unify sizes + colors correctly
      const productMap = new Map();

      // Add local products
      localProducts.forEach((p) => {
        productMap.set(p.id, {
          ...p,
          sizes: p.sizes || p.size || [],
          colors: p.colors || p.colours || [],
        });
      });

      // Merge Firestore products
      firestoreProducts.forEach((p) => {
        const normalized = {
          ...p,
          sizes: p.sizes || p.size || [],
          colors: p.colors || p.colours || [],
        };

        if (productMap.has(p.id)) {
          const local = productMap.get(p.id);

          productMap.set(p.id, {
            ...local,
            ...normalized,

            // Merge sizes
            sizes: Array.from(
              new Set([...(local.sizes || []), ...(normalized.sizes || [])])
            ),

            // Merge colors
            colors: Array.from(
              new Set([...(local.colors || []), ...(normalized.colors || [])])
            ),
          });
        } else {
          productMap.set(p.id, normalized);
        }
      });

      setProducts(Array.from(productMap.values()));
    };

    loadProducts();
  }, []);

  const normalize = (str) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredProducts = searchQuery.trim()
    ? products.filter((product) =>
        normalize(product.name).includes(normalize(searchQuery))
      )
    : products;

  const handleCardClick = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
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
    <div className="relative px-4 py-10 mx-auto max-w-7xl">
      
      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute text-gray-500 transition top-4 right-4 hover:text-gray-700"
        aria-label="Home"
      >
        <Home size={24} />
      </button>

      {filteredProducts.length === 0 ? (
        <p className="mt-10 text-lg text-center text-gray-600">
          No products found for "<span className="font-semibold">{searchQuery}</span>"
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-6 mt-4 sm:grid-cols-3 md:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden transition bg-white shadow-md cursor-pointer rounded-xl hover:shadow-lg"
            >
              {/* Image */}
              <div
                className="flex items-center justify-center w-full p-4 bg-gray-50"
                onClick={() => handleCardClick(product)}
              >
                <img
                  src={product.imageUrl || product.image}
                  alt={product.name}
                  className="object-contain w-auto h-32 max-w-full md:h-40"
                />
              </div>

              {/* Product Details */}
              <div className="flex flex-col gap-2 p-4">
                <h3
                  className="text-sm font-medium text-gray-800 md:text-base"
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

                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="text-xs text-gray-500">Available Colors:</span>
                    {product.colors.map((color) => (
                      <span
                        key={color}
                        className={`w-5 h-5 rounded-full border-2 ${
                          colorClasses[color] || "bg-gray-200"
                        }`}
                        title={color}
                      ></span>
                    ))}
                  </div>
                )}

                {/* Sizes */}
                {product.sizes?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="text-xs text-gray-500">Available Sizes:</span>

                    {product.sizes.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 text-xs border rounded-full text-gray-700 bg-gray-100"
                      >
                        {s}
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

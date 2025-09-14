import { useNavigate } from "react-router-dom";

export default function OurProducts() {
  const navigate = useNavigate();

  // Define our products
  const ourProducts = [
    { id: 1, name: "Pens", category: "pen", image: "/images/pens.webp" },
    { id: 2, name: "Pencils", category: "pencils", image: "/images/pencils.webp" },
    { id: 3, name: "Rulers", category: "ruler", image: "/images/rulers.webp" },
    { id: 4, name: "Glue Stick", category: "glue", image: "/images/gluestick.webp" },
    { id: 5, name: "Erasers", category: "eraser", image: "/images/erasers.webp" },
    { id: 6, name: "Sharpeners", category: "sharpener", image: "/images/sharpeners.webp" },
  ];

  const handleProductClick = (product) => {
    // Navigate to /products page with search query as the product name
    navigate(`/products?search=${encodeURIComponent(product.name)}`);
  };

  return (
    <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Our Products
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {ourProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col cursor-pointer"
            onClick={() => handleProductClick(product)}
          >
            {/* Image container */}
            <div className="w-full flex justify-center items-center bg-gray-50 p-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-auto max-w-full h-auto object-contain"
              />
            </div>

            {/* Name */}
            <div className="p-4 text-center">
              <h3 className="text-sm md:text-base font-medium text-gray-700">
                {product.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

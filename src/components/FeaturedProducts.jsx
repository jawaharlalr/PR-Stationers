export default function FeaturedProducts() {
  // Example school stationery products
  const products = [
    {
      id: 1,
      name: "Notebook",
      image: "/images/notebooks.webp",
    },
    {
      id: 2,
      name: "Pens",
      image: "/images/pens.webp",
    },
    {
      id: 3,
      name: "Geometry Set",
      image: "/images/geometryset.webp",
    },
    {
      id: 4,
      name: "Water Bottle",
      image: "/images/waterbottle.webp",
    },
  ];

  return (
    <section className="py-10 px-4 md:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Featured Products
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
          >
            <div className="w-full flex justify-center items-center bg-gray-50 p-4">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-40 md:max-h-48 w-auto object-contain"
              />
            </div>
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

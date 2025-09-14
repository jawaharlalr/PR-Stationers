import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import FeaturedProducts from "../components/FeaturedProducts";
import OurProducts from "../components/OurProducts"; // ✅ import

const banners = ["/images/banner.webp", "/images/banner1.webp"];

export default function Home() {
  const [index, setIndex] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prevBanner = () => {
    setIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextBanner = () => {
    setIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <div className="w-full">
      {/* 🔹 Banner Section */}
      <div className="relative w-full h-[300px] md:h-[500px] bg-gray-100 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={banners[index]}
            src={banners[index]}
            alt="Banner"
            className="absolute w-full h-full object-contain md:object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>

        {/* Left Arrow */}
        <button
          onClick={prevBanner}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
        >
          <FiChevronLeft size={24} />
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextBanner}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
        >
          <FiChevronRight size={24} />
        </button>
      </div>

      {/* 🔹 Featured Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <FeaturedProducts />
      </div>

      {/* 🔹 Our Products Section */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <OurProducts />
      </div>
    </div>
  );
}

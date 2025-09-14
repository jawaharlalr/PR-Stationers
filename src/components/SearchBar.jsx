import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import products from "../data/products";

export default function SearchBar({ closeMobileMenu }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalize = (str) =>
    str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filteredSuggestions = debouncedSearchTerm.trim()
    ? products
        .filter((product) =>
          normalize(product.name).includes(normalize(debouncedSearchTerm))
        )
        .sort((a, b) => {
          const aStarts = normalize(a.name).startsWith(normalize(debouncedSearchTerm));
          const bStarts = normalize(b.name).startsWith(normalize(debouncedSearchTerm));
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return normalize(a.name).localeCompare(normalize(b.name));
        })
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setShowSuggestions(false);
      closeMobileMenu?.();
    }
  };

  const handleSuggestionClick = (productName) => {
    navigate(`/products?search=${encodeURIComponent(productName)}`);
    setSearchTerm("");
    setShowSuggestions(false);
    closeMobileMenu?.();
  };

  const highlightMatch = (text, term) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div className="relative w-full md:w-80" ref={dropdownRef}>
      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative flex items-center w-full">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
          }}
          className="w-full pl-4 pr-10 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-black shadow-sm
                     focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/40 outline-none transition duration-300 text-sm"
        />
        <button
          type="submit"
          className="absolute right-3 text-black hover:text-[#2563eb] transition-transform duration-200 hover:scale-110"
        >
          <FiSearch size={20} />
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 bg-white border rounded shadow-md w-full max-h-64 overflow-y-auto mt-2">
          {filteredSuggestions.map((product) => (
            <div
              key={product.id}
              onClick={() => handleSuggestionClick(product.name)}
              className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-100"
            >
              <div className="flex items-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-10 h-10 object-cover rounded mr-3"
                />
                <div className="flex flex-col">
                  <span className="text-sm">
                    {highlightMatch(product.name, searchTerm)}
                  </span>
                  <span className="text-xs text-gray-500">{product.category}</span>
                </div>
              </div>
              <div className="text-sm text-gray-700 font-semibold pr-2">
                ₹{product.price}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiShoppingCart, FiLogOut } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";
import { auth } from "../firebase"; // ✅ Firebase auth instance
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartCount = Object.keys(cart).length;

  // ✅ Track Firebase user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Search handler
  const handleSearch = (query) => {
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="w-full bg-white shadow-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src="/images/header.webp"
                alt="Logo"
                className="h-10 w-auto cursor-pointer"
              />
            </Link>
          </div>

          {/* Center - Nav links + Search */}
          <div className="flex-grow flex justify-center items-center">
            {/* Mobile Search */}
            <div className="flex md:hidden w-40 justify-end pr-2">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Desktop Nav + Search */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/products" className="hover:text-[#2563eb] transition">
                Products
              </Link>
              <Link to="/about" className="hover:text-[#2563eb] transition">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-[#2563eb] transition">
                Contact Us
              </Link>
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 relative">
            {/* My Orders (Desktop only if logged in) */}
            {user && (
              <Link
                to="/orders"
                className="hidden md:inline-block px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:text-[#2563eb] transition"
              >
                My Orders
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative text-gray-700 hover:text-[#2563eb] transition"
            >
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Login / Profile */}
            {!user ? (
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 text-sm rounded-md bg-[#2563eb] text-white hover:bg-[#1e40af] transition"
              >
                Login
              </button>
            ) : (
              <div ref={dropdownRef} className="relative flex items-center space-x-3">
                {/* My Orders (Mobile) */}
                <Link
                  to="/orders"
                  className="md:hidden px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:text-[#2563eb] transition"
                >
                  My Orders
                </Link>

                {/* Profile Button */}
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="User"
                      className="w-8 h-8 rounded-full border cursor-pointer"
                    />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 font-bold">
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 right-0 w-64 bg-white shadow-lg rounded-md border p-3"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="User"
                            className="w-10 h-10 rounded-full border"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 font-bold">
                            {user.displayName
                              ? user.displayName.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-800">
                            {user.displayName || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate w-52">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-100 rounded"
                        onClick={() => setProfileOpen(false)}
                      >
                        Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-left hover:bg-gray-100 rounded"
                      >
                        <FiLogOut /> <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <div className="md:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-[#2563eb] transition"
              >
                {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            ref={mobileMenuRef}
            className="md:hidden bg-white shadow-md"
          >
            <div className="px-4 py-3 space-y-2 text-gray-700 font-medium">
              <Link
                to="/products"
                className="block hover:text-[#2563eb] transition"
                onClick={() => setIsOpen(false)}
              >
                Products
              </Link>
              <Link
                to="/about"
                className="block hover:text-[#2563eb] transition"
                onClick={() => setIsOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="block hover:text-[#2563eb] transition"
                onClick={() => setIsOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

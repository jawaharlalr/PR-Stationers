import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiShoppingCart,
  FiLogOut,
  FiHome,
  FiBox,
  FiUser,
  FiList,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setProfileOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      {/* ✅ TOP NAVBAR */}
      <nav className="fixed top-0 z-50 w-full bg-white shadow-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo */}
            <div className="flex-shrink-0">
              <Link to="/">
                <img
                  src="/images/header.webp"
                  alt="Logo"
                  className="w-auto h-10 cursor-pointer"
                />
              </Link>
            </div>

            {/* Desktop Nav + Search */}
            <div className="items-center hidden space-x-6 md:flex">
              <Link to="/products" className="hover:text-[#2563eb] transition">
                Products
              </Link>
              <Link to="/about" className="hover:text-[#2563eb] transition">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-[#2563eb] transition">
                Contact Us
              </Link>
            </div>

            {/* Right Section */}
            <div className="relative flex items-center space-x-4">
              {/* My Orders (Desktop only if logged in) */}
              {user && (
                <Link
                  to="/orders"
                  className="hidden md:inline-block px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:text-[#2563eb] transition"
                >
                  My Orders
                </Link>
              )}

              {/* Cart (desktop only) */}
              <button
                onClick={() => navigate("/cart")}
                className="hidden md:inline-block relative text-gray-700 hover:text-[#2563eb] transition"
              >
                <FiShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Login/Profile (desktop only) */}
              {!user ? (
                <button
                  onClick={() => navigate("/login")}
                  className="hidden md:inline-block px-3 py-1 text-sm rounded-md bg-[#2563eb] text-white hover:bg-[#1e40af] transition"
                >
                  Login
                </button>
              ) : (
                <div
                  ref={dropdownRef}
                  className="relative items-center hidden space-x-3 md:flex"
                >
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User"
                        className="w-8 h-8 border rounded-full cursor-pointer"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 font-bold text-gray-600 bg-gray-200 rounded-full">
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
                        className="absolute right-0 w-64 p-3 mt-2 bg-white border rounded-md shadow-lg top-full"
                      >
                        <div className="flex items-center mb-3 space-x-3">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt="User"
                              className="w-10 h-10 border rounded-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 font-bold text-gray-600 bg-gray-200 rounded-full">
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
                          className="block px-4 py-2 text-sm rounded hover:bg-gray-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          Profile
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 space-x-2 text-sm text-left rounded hover:bg-gray-100"
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
              className="bg-white shadow-md md:hidden"
            >
              <div className="px-4 py-3 space-y-2 font-medium text-gray-700">
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
                {user && (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-red-600"
                  >
                    Logout
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ✅ BOTTOM NAVBAR (Mobile only) */}
      <div className="fixed bottom-0 left-0 z-50 w-full bg-white border-t shadow-t md:hidden">
        <div className="flex items-center justify-around py-2">
          <Link to="/" className="flex flex-col items-center text-gray-700 hover:text-[#2563eb]">
            <FiHome size={22} />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/products" className="flex flex-col items-center text-gray-700 hover:text-[#2563eb]">
            <FiBox size={22} />
            <span className="text-xs">Products</span>
          </Link>
          {user && (
            <Link to="/orders" className="flex flex-col items-center text-gray-700 hover:text-[#2563eb]">
              <FiList size={22} />
              <span className="text-xs">Orders</span>
            </Link>
          )}
          <button
            onClick={() => navigate("/cart")}
            className="relative flex flex-col items-center text-gray-700 hover:text-[#2563eb]"
          >
            <FiShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-2 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
                {cartCount}
              </span>
            )}
            <span className="text-xs">Cart</span>
          </button>
          {!user ? (
            <Link
              to="/login"
              className="flex flex-col items-center text-gray-700 hover:text-[#2563eb]"
            >
              <FiUser size={22} />
              <span className="text-xs">Login</span>
            </Link>
          ) : (
            <Link
              to="/profile"
              className="flex flex-col items-center text-gray-700 hover:text-[#2563eb]"
            >
              <FiUser size={22} />
              <span className="text-xs">Profile</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

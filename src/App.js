import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact"; // ✅ New Contact Page
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";
import { auth, db } from "./firebase";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// ✅ Unified Route Wrapper
function ProtectedRoute({ children, adminOnly = false }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const docRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            setRole(snap.data().role || "user");
          } else {
            setRole("user"); // default role if not found
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setRole("user");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // Not logged in
  if (!user) return <Navigate to="/login" />;

  // Admin-only page but user is not admin
  if (adminOnly && role !== "admin") return <Navigate to="/" />;

  return children;
}

// ✅ Wrapper to conditionally hide Navbar on admin pages
function Layout({ children }) {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavbar && <Navbar />}
      <Toaster position="top-right" reverseOrder={false} />
      <div className={!hideNavbar ? "pt-24" : ""}>{children}</div>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />

            {/* Static Pages */}
            <Route
              path="/about"
              element={<h1 className="text-2xl font-bold">About Us Page</h1>}
            />
            <Route path="/contact" element={<Contact />} /> {/* ✅ Updated */}

            {/* Protected Routes (normal users) */}
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <h1 className="text-2xl font-bold">My Orders</h1>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route
              path="*"
              element={
                <h1 className="text-2xl font-bold text-center">
                  404 - Page Not Found
                </h1>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;

import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Admin() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdmin = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) return navigate("/login");

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        toast.error("Admins only!");
        return navigate("/");
      }

      const usersSnap = await getDocs(collection(db, "users"));
      const productsSnap = await getDocs(collection(db, "products"));
      const ordersSnap = await getDocs(collection(db, "orders"));

      setStats({
        users: usersSnap.size,
        products: productsSnap.size,
        orders: ordersSnap.size,
      });
    };

    loadAdmin();
  }, [navigate]);

  const logout = async () => {
    await signOut(auth);
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 p-6 space-y-4 bg-white shadow-xl">
        <h1 className="mb-4 text-2xl font-bold">Admin Panel</h1>

        <nav className="space-y-3">
          <button onClick={() => navigate("/admin/users")} className="w-full px-4 py-2 text-left text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600">
            Manage Users
          </button>
          <button onClick={() => navigate("/admin/products")} className="w-full px-4 py-2 text-left text-white bg-green-500 rounded-lg shadow hover:bg-green-600">
            Manage Products
          </button>
          <button onClick={() => navigate("/admin/orders")} className="w-full px-4 py-2 text-left text-white bg-purple-500 rounded-lg shadow hover:bg-purple-600">
            Manage Orders
          </button>
          <button onClick={logout} className="w-full px-4 py-2 text-left text-white bg-red-500 rounded-lg shadow hover:bg-red-600">
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">
        <h1 className="mb-6 text-3xl font-bold">Dashboard Overview</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="font-semibold text-gray-600">Total Users</h2>
            <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
          </div>
          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="font-semibold text-gray-600">Total Products</h2>
            <p className="text-3xl font-bold text-green-600">{stats.products}</p>
          </div>
          <div className="p-6 bg-white shadow rounded-xl">
            <h2 className="font-semibold text-gray-600">Total Orders</h2>
            <p className="text-3xl font-bold text-purple-600">{stats.orders}</p>
          </div>
        </div>
      </main>
    </div>
  );
}

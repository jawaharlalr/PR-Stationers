// src/pages/Admin.jsx
import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";

export default function Admin() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const productsSnap = await getDocs(collection(db, "products"));
        const ordersSnap = await getDocs(collection(db, "orders"));

        setStats({
          users: usersSnap.size,
          products: productsSnap.size,
          orders: ordersSnap.size,
        });
        setLoading(false);
      } catch (error) {
        console.error("Firestore fetch error:", error);
        toast.error("Failed to fetch admin data. Check permissions.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading)
    return <p className="mt-20 text-center text-gray-700">Loading dashboard...</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-2xl font-bold text-blue-600">{stats.users}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Products</h2>
          <p className="text-2xl font-bold text-green-600">{stats.products}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-2xl font-bold text-purple-600">{stats.orders}</p>
        </div>
      </div>

      {/* Management Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600">
          Manage Users
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600">
          Manage Products
        </button>
        <button className="bg-purple-500 text-white px-4 py-2 rounded shadow hover:bg-purple-600">
          Manage Orders
        </button>
      </div>
    </div>
  );
}

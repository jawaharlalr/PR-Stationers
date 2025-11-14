import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Admin() {
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // FETCH ALL DASHBOARD DATA
  const fetchData = async () => {
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const productsSnap = await getDocs(collection(db, "products"));
      const ordersSnap = await getDocs(collection(db, "orders"));

      const usersList = usersSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(usersList);

      setStats({
        users: usersSnap.size,
        products: productsSnap.size,
        orders: ordersSnap.size,
      });

    } catch (err) {
      console.error("Firestore fetch error:", err);
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  // ONLY ADMIN ACCESS
  useEffect(() => {
    const checkAdmin = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        navigate("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));

      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        toast.error("Access denied! Admins only.");
        navigate("/");
        return;
      }

      fetchData();
    };

    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out!");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  // Sidebar actions
  const showUsers = () => toast.success("Showing Users");
  const showProducts = () => toast.success("Showing Products");
  const showOrders = () => toast.success("Showing Orders");

  if (loading)
    return (
      <p className="mt-20 text-center text-gray-700">Loading dashboard...</p>
    );

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 p-6 space-y-6 bg-white shadow-xl">
        <h1 className="mb-4 text-2xl font-bold">Admin Panel</h1>

        <nav className="space-y-3">
          <button
            onClick={showUsers}
            className="w-full px-4 py-2 text-left text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600"
          >
            Manage Users
          </button>

          <button
            onClick={showProducts}
            className="w-full px-4 py-2 text-left text-white bg-green-500 rounded-lg shadow hover:bg-green-600"
          >
            Manage Products
          </button>

          <button
            onClick={showOrders}
            className="w-full px-4 py-2 text-left text-white bg-purple-500 rounded-lg shadow hover:bg-purple-600"
          >
            Manage Orders
          </button>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-white bg-red-500 rounded-lg shadow hover:bg-red-600"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        <h1 className="mb-8 text-3xl font-bold">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-10 md:grid-cols-3">

          <div className="p-6 transition bg-white shadow rounded-xl hover:shadow-lg">
            <h2 className="text-lg font-semibold text-gray-600">Total Users</h2>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {stats.users}
            </p>
          </div>

          <div className="p-6 transition bg-white shadow rounded-xl hover:shadow-lg">
            <h2 className="text-lg font-semibold text-gray-600">
              Total Products
            </h2>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.products}
            </p>
          </div>

          <div className="p-6 transition bg-white shadow rounded-xl hover:shadow-lg">
            <h2 className="text-lg font-semibold text-gray-600">Total Orders</h2>
            <p className="mt-2 text-3xl font-bold text-purple-600">
              {stats.orders}
            </p>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="p-6 bg-white shadow rounded-xl">
          <h2 className="mb-4 text-xl font-semibold">Manage Users</h2>

          {users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full overflow-hidden border border-gray-200 rounded-xl">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Role</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="transition border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">
                        {u.displayName || "N/A"}
                      </td>
                      <td className="px-4 py-3">{u.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.role === "admin"
                              ? "bg-red-100 text-red-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

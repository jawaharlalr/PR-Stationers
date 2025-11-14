import { useEffect, useState, useCallback } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Icons (Lucide Icons)
import { User, Shield, Trash2, ArrowLeft } from "lucide-react";

export default function ManageUsers() {
  const [admins, setAdmins] = useState([]);
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  // Load users + their subcollection addresses
  const loadUsers = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, "users"));

      const users = await Promise.all(
        snap.docs.map(async (d) => {
          const userData = d.data();
          const role = userData.role ? userData.role : "customer";

          // Load addresses subcollection
          const addrSnap = await getDocs(
            collection(db, "users", d.id, "addresses")
          );

          const addresses = addrSnap.docs.map((a) => ({
            id: a.id,
            ...a.data(),
          }));

          return {
            id: d.id,
            ...userData,
            role,
            addresses,
          };
        })
      );

      setAdmins(users.filter((u) => u.role === "admin"));
      setCustomers(users.filter((u) => u.role === "customer"));
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }, []);

  // RUN ONCE (safe because loadUsers is memoized)
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      toast.success("User deleted");
      loadUsers(); // reload after delete
    } catch (err) {
      toast.error("Failed to delete user");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <User size={26} /> Manage Users
        </h1>

        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 px-4 py-2 text-white bg-gray-800 rounded-lg shadow hover:bg-gray-900"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      {/* ADMIN TABLE */}
      <div className="p-6 mb-8 bg-white shadow-xl rounded-xl">
        <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold">
          <Shield size={22} className="text-red-600" /> Admin Users
        </h2>

        <table className="w-full text-left border-collapse">
          <thead className="text-gray-700 bg-gray-200">
            <tr>
              <th className="p-3 border">S.No</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {admins.map((u, index) => (
              <tr key={u.id} className="transition border hover:bg-gray-50">
                <td className="p-3 border">{index + 1}</td>

                <td className="p-3 font-medium border">PR Stationers</td>

                <td className="p-3 border">{u.email}</td>

                <td className="p-3 border">
                  <span className="px-3 py-1 text-sm font-semibold text-red-600 bg-red-100 rounded-full">
                    admin
                  </span>
                </td>

                <td className="p-3 border">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="flex items-center gap-1 px-3 py-1 text-white bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {admins.length === 0 && (
          <p className="mt-4 text-center text-gray-500">No admin users found.</p>
        )}
      </div>

      {/* CUSTOMER TABLE */}
      <div className="p-6 bg-white shadow-xl rounded-xl">
        <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold">
          <User size={22} className="text-blue-600" /> Customer Users
        </h2>

        <table className="w-full text-left border-collapse">
          <thead className="text-gray-700 bg-gray-200">
            <tr>
              <th className="p-3 border">S.No</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Phone</th>
              <th className="p-3 border">All Addresses (From Subcollection)</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((u, index) => (
              <tr key={u.id} className="transition border hover:bg-gray-50">
                <td className="p-3 border">{index + 1}</td>

                <td className="p-3 font-medium border">
                  {u.displayName || "N/A"}
                </td>

                <td className="p-3 border">{u.phone || "N/A"}</td>

                {/* SUBCOLLECTION ADDRESSES */}
                <td className="p-3 border">
                  {u.addresses.length === 0 ? (
                    <span className="text-gray-500">No addresses</span>
                  ) : (
                    <div className="space-y-2">
                      {u.addresses.map((a, i) => (
                        <div
                          key={a.id}
                          className="p-2 text-sm bg-gray-100 rounded-md"
                        >
                          <span className="font-semibold">#{i + 1}:</span>{" "}
                          {`${a.line1 || ""}, ${a.city || ""}, ${a.state || ""}, ${
                            a.pincode || ""
                          }`
                            .replace(/, ,/g, ",")
                            .replace(/, , ,/g, ",")
                            .trim()}
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                <td className="p-3 border">
                  <span className="px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                    customer
                  </span>
                </td>

                <td className="p-3 border">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="flex items-center gap-1 px-3 py-1 text-white bg-red-500 rounded-lg hover:bg-red-600"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customers.length === 0 && (
          <p className="mt-4 text-center text-gray-500">
            No customer users found.
          </p>
        )}
      </div>
    </div>
  );
}

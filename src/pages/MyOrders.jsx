import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiUser, FiPhone } from "react-icons/fi";
import toast from "react-hot-toast";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null); // Track expanded order
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const q = query(
          collection(db, "users", user.uid, "orders"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setOrders(list);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (loading)
    return <p className="mt-20 text-center text-gray-600">Loading orders...</p>;

  if (!orders.length)
    return (
      <div className="px-4 py-10 mx-auto text-center text-gray-600 max-w-7xl">
        You haven’t placed any orders yet.
      </div>
    );

  const toggleExpand = (id) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-5xl px-4 py-10 mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">My Orders</h1>

      <div className="flex flex-col gap-6">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;

          return (
            <div
              key={order.id}
              className="p-4 transition-all duration-300 bg-white shadow-md rounded-xl"
            >
              {/* Order Header */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800">
                    {order.orderId}
                  </span>
                  <span className="text-sm text-gray-500">
                    {order.createdAt?.toDate
                      ? new Date(order.createdAt.toDate()).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <button className="text-gray-600 hover:text-gray-800">
                  {isExpanded ? (
                    <FiChevronUp className="text-xl" />
                  ) : (
                    <FiChevronDown className="text-xl" />
                  )}
                </button>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="pt-3 mt-4 transition-all duration-500 border-t border-gray-200">
                  {/* Customer Info */}
                  <div className="flex flex-col gap-1 mb-3 text-sm text-gray-700 md:flex-row md:gap-6">
                    <p className="flex items-center gap-2">
                      <FiUser className="text-gray-500" />{" "}
                      <strong>{order.userName || "Unknown User"}</strong>
                    </p>
                    <p className="flex items-center gap-2">
                      <FiPhone className="text-gray-500" />{" "}
                      <span>{order.userPhone || "N/A"}</span>
                    </p>
                  </div>

                  {/* Product Table */}
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-2 text-left">S.No</th>
                          <th className="p-2 text-left">Image</th>
                          <th className="p-2 text-left">Product</th>
                          <th className="p-2 text-left">Qty</th>
                          <th className="p-2 text-left">Price</th>
                          <th className="p-2 text-left">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i} className="border-t hover:bg-gray-50">
                            <td className="p-2">{i + 1}</td>
                            <td className="p-2">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="object-contain w-16 h-16 rounded"
                              />
                            </td>
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">{item.quantity || 1}</td>
                            <td className="p-2">₹{item.price}</td>
                            <td className="p-2">
                              ₹{item.price * (item.quantity || 1)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Order Info */}
                  <div className="flex flex-col justify-between gap-2 mt-4 text-sm text-gray-700 md:flex-row md:items-center">
                    <p>
                      <strong>Delivery Type:</strong>{" "}
                      <span className="text-gray-800">
                        {order.deliveryType || "—"}
                      </span>
                    </p>
                    <p>
                      <strong>Total Price:</strong>{" "}
                      <span className="font-semibold text-green-600">
                        ₹{order.totalPrice}
                      </span>
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`${
                          order.status === "Pending"
                            ? "text-yellow-600"
                            : order.status === "Delivered"
                            ? "text-green-600"
                            : "text-gray-600"
                        } font-medium`}
                      >
                        {order.status}
                      </span>
                    </p>
                  </div>

                  {/* View Details Button */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => navigate(`/order/${order.id}`)}
                      className="px-4 py-1 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

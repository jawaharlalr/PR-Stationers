import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import {
  FiTrash2,
  FiX,
  FiUser,
  FiPhone,
} from "react-icons/fi";
import toast from "react-hot-toast";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // LIVE REAL-TIME FIRESTORE LISTENER
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);
    });

    return () => unsubscribe();
  }, []);

  const handleView = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // UPDATE STATUS
  const handleStatusChange = async (orderId, userId, newStatus) => {
    try {
      // Update global orders
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
      });

      // Update user's order
      await updateDoc(doc(db, "users", userId, "orders", orderId), {
        status: newStatus,
      });

      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // DELETE ORDER
  const handleDelete = async (orderId, userId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await deleteDoc(doc(db, "orders", orderId));
      await deleteDoc(doc(db, "users", userId, "orders", orderId));

      toast.success("Order deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete order");
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Manage Orders</h1>

      <div className="p-6 overflow-x-auto bg-white shadow rounded-xl">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">S.No</th>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, i) => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>
                <td className="p-3 font-mono text-blue-600">{order.orderId}</td>
                <td className="p-3">{order.userName}</td>
                <td className="p-3">{order.userPhone}</td>
                <td className="p-3 font-semibold text-green-600">
                  ₹{order.totalPrice}
                </td>

                {/* STATUS DROPDOWN */}
                <td className="p-3">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order.id,
                        order.userId,
                        e.target.value
                      )
                    }
                    className="px-2 py-1 border rounded"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>

                <td className="flex items-center gap-3 p-3">
                  {/* VIEW BUTTON */}
                  <button
                    onClick={() => handleView(order)}
                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700"
                  >
                    View
                  </button>

                  {/* DELETE */}
                  <FiTrash2
                    size={20}
                    className="text-red-500 cursor-pointer hover:text-red-700"
                    onClick={() => handleDelete(order.id, order.userId)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!orders.length && (
          <p className="p-4 mt-4 text-center text-gray-600">No orders found.</p>
        )}
      </div>

      {/* ------------------------- MODAL ------------------------- */}

      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[90%] max-w-2xl p-6 bg-white shadow-xl rounded-xl relative animate-fadeIn">

            <button
              onClick={() => setShowModal(false)}
              className="absolute text-gray-500 top-3 right-3 hover:text-gray-700"
            >
              <FiX size={24} />
            </button>

            <h2 className="mb-4 text-xl font-bold text-gray-800">
              Order Details:{" "}
              <span className="font-mono text-blue-600">
                {selectedOrder.orderId}
              </span>
            </h2>

            <div className="p-4 mb-4 rounded-lg bg-gray-50">
              <p className="flex items-center gap-2 text-gray-700">
                <FiUser /> <strong>{selectedOrder.userName}</strong>
              </p>
              <p className="flex items-center gap-2 mt-1 text-gray-700">
                <FiPhone /> {selectedOrder.userPhone}
              </p>
            </div>

            {/* Summary */}
            <table className="w-full mb-4 text-sm">
              <tbody>
                <tr>
                  <td className="p-1 font-medium">Status:</td>
                  <td className="p-1">{selectedOrder.status}</td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">Total Items:</td>
                  <td className="p-1">{selectedOrder.totalItems}</td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">Total Qty:</td>
                  <td className="p-1">{selectedOrder.totalQty}</td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">Delivery:</td>
                  <td className="p-1">{selectedOrder.deliveryType}</td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">Total Price:</td>
                  <td className="p-1 font-bold text-green-600">
                    ₹{selectedOrder.totalPrice}
                  </td>
                </tr>
                <tr>
                  <td className="p-1 font-medium">Address:</td>
                  <td className="p-1">{selectedOrder.address}</td>
                </tr>
              </tbody>
            </table>

            {/* Item List */}
            <h3 className="mb-2 text-lg font-semibold text-gray-800">
              Items
            </h3>
            <table className="w-full text-sm border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">S.No</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">₹{item.price}</td>
                    <td className="p-2">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-full hover:bg-blue-700"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

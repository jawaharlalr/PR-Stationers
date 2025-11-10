import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { useCart } from "../context/CartContext";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import toast from "react-hot-toast";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loading, setLoading] = useState(true);

  // User info
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Cart calculations
  const cartItems = Object.values(cart).filter(Boolean);
  const totalQty = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const deliveryType = cartItems[0]?.deliveryType || "";

  // Fetch user profile (name + phone) and addresses
  useEffect(() => {
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserName(data.displayName || user.displayName || "");
          setUserPhone(data.phone || "");
        }

        const addrSnap = await getDocs(collection(db, "users", user.uid, "addresses"));
        const list = addrSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAddresses(list);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user info or addresses.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // Add new address
  const handleAddAddress = async () => {
    if (!newAddress.trim()) return toast.error("Enter an address.");
    const user = auth.currentUser;
    if (!user) return toast.error("Please login first.");

    try {
      const docRef = await addDoc(collection(db, "users", user.uid, "addresses"), {
        address: newAddress,
      });
      const newAddrObj = { id: docRef.id, address: newAddress };
      setAddresses((prev) => [...prev, newAddrObj]);
      setSelectedAddress(newAddress);
      setNewAddress("");
      setShowAddAddress(false);
      toast.success("Address added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add address.");
    }
  };

  // Generate custom order ID
  const generateOrderId = async (uid, phone) => {
    const phoneClean = phone || "0000000000";
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const month = (now.getMonth() + 1).toString().padStart(2, "0");

    const ordersRef = collection(db, "users", uid, "orders");
    const q = query(ordersRef, orderBy("createdAt"));
    const snap = await getDocs(q);
    const orderCount = snap.size + 1;
    const countFormatted = orderCount.toString().padStart(4, "0");

    return `PR-${phoneClean}-${day}${month}-${countFormatted}`;
  };

  // Confirm order
  const handleConfirmOrder = async () => {
    const user = auth.currentUser;
    if (!user) return toast.error("Please log in to continue.");
    if (!selectedAddress) return toast.error("Please select an address.");

    try {
      const customId = await generateOrderId(user.uid, userPhone);

      const orderData = {
        orderId: customId,
        items: cartItems,
        totalItems: cartItems.length,
        totalQty,
        totalPrice,
        deliveryType,
        address: selectedAddress,
        userId: user.uid,
        userName,
        userPhone,
        createdAt: serverTimestamp(),
        status: "Pending",
      };

      const userOrderRef = doc(db, "users", user.uid, "orders", customId);
      await setDoc(userOrderRef, orderData);
      await setDoc(doc(db, "orders", customId), orderData);

      clearCart();
      localStorage.removeItem("cart");

      setOrderId(customId);
      setTimeout(() => setShowModal(true), 150); // allow re-render before showing modal
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order.");
    }
  };

  // Modal close handler
  const handleModalClose = () => {
    setShowModal(false);
    navigate("/orders"); // ✅ Correct path
  };

  if (loading) return <p className="mt-20 text-center">Loading checkout...</p>;
  if (!cartItems.length)
    return (
      <div className="px-4 py-10 mx-auto text-center text-gray-600 max-w-7xl">
        Your cart is empty.
      </div>
    );

  return (
    <div className="max-w-5xl px-4 py-10 pb-24 mx-auto">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">Checkout</h1>

      {/* User Info */}
      <div className="p-4 mb-6 bg-white shadow-md rounded-xl">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Your Info</h2>
        <p className="text-gray-800">
          <strong>Name:</strong> {userName || "Not set"}
        </p>
        <p className="text-gray-800">
          <strong>Phone:</strong> {userPhone || "Not set"}
        </p>
      </div>

      {/* Address Section */}
      <div className="p-4 mb-6 bg-white shadow-md rounded-xl">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Select Delivery Address</h2>
        {addresses.length ? (
          <div className="flex flex-col gap-2">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`flex items-center gap-2 p-2 border rounded cursor-pointer ${
                  selectedAddress === a.address
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={a.address}
                  checked={selectedAddress === a.address}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                />
                <span>{a.address}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No saved addresses yet.</p>
        )}

        {!showAddAddress ? (
          <button
            onClick={() => setShowAddAddress(true)}
            className="px-3 py-2 mt-4 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            + Add New Address
          </button>
        ) : (
          <div className="flex flex-col gap-2 mt-4">
            <textarea
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Enter your new address"
              className="w-full p-2 border rounded-md"
              rows="3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddAddress}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
              >
                Save Address
              </button>
              <button
                onClick={() => {
                  setShowAddAddress(false);
                  setNewAddress("");
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="p-4 mb-6 bg-white shadow-md rounded-xl">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Order Summary</h2>
        <div className="overflow-x-auto">
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
              {cartItems.map((item, i) => (
                <tr key={item.id} className="border-t">
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
                  <td className="p-2">₹{item.price * (item.quantity || 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 mt-4 text-sm md:flex-row md:justify-between md:items-center">
          <p className="text-gray-700">
            <strong>Total Items:</strong> {cartItems.length}
          </p>
          <p className="text-gray-700">
            <strong>Total Quantity:</strong> {totalQty}
          </p>
          <p className="text-gray-700">
            <strong>Delivery Type:</strong> {deliveryType || "-"}
          </p>
          <p className="font-semibold text-green-600">
            <strong>Total Amount:</strong> ₹{totalPrice}
          </p>
        </div>
      </div>

      {/* Confirm Order */}
      <div className="flex justify-end">
        <button
          onClick={handleConfirmOrder}
          className="px-6 py-3 text-white bg-green-600 rounded-full hover:bg-green-700"
        >
          Confirm Order
        </button>
      </div>

      {/* ✅ Success Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="p-6 text-center bg-white shadow-2xl rounded-xl w-80 animate-fadeIn">
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              🎉 Order Placed Successfully!
            </h2>
            <p className="text-sm text-gray-600">
              Your Order ID:
              <br />
              <span className="font-mono font-semibold text-blue-600">
                {orderId}
              </span>
            </p>
            <button
              onClick={handleModalClose}
              className="px-4 py-2 mt-4 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

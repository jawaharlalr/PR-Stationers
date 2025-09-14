import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; // Make sure your firebase.js exports 'db'
import { useEffect } from "react";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart } = useCart();

  const cartItems = Object.values(cart);

  const totalItems = cartItems.length;
  const totalQty = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  // Sync cart to Firebase whenever it changes
  useEffect(() => {
    const saveCartToFirebase = async () => {
      try {
        // Replace 'userId' with actual logged-in user ID if you have auth
        await setDoc(doc(db, "carts", "userId"), { cart });
      } catch (err) {
        console.error("Failed to save cart to Firebase:", err);
      }
    };

    saveCartToFirebase();
  }, [cart]);

  const getColorClass = (color) => {
    switch (color?.toLowerCase()) {
      case "red":
        return "bg-red-500";
      case "blue":
        return "bg-blue-600";
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-400";
      case "black":
        return "bg-black";
      case "white":
        return "bg-white border-gray-300";
      default:
        return "bg-gray-200";
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-600">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Cart</h1>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">S.No</th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Color</th>
              <th className="px-4 py-2 text-left">Size</th>
              <th className="px-4 py-2 text-left">Quantity</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{index + 1}</td>
                <td
                  className="px-4 py-2 cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  {item.name}
                </td>
                <td className="px-4 py-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded"
                  />
                </td>
                <td className="px-4 py-2 capitalize">{item.category}</td>
                <td className="px-4 py-2">
                  {item.selectedOptions?.color ? (
                    <span className="flex items-center gap-1">
                      <span
                        className={`inline-block w-4 h-4 rounded-full border ${getColorClass(
                          item.selectedOptions.color
                        )}`}
                      ></span>
                      {item.selectedOptions.color}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2">{item.selectedOptions?.size || "-"}</td>
                <td className="px-4 py-2">{item.quantity || 1}</td>
                <td className="px-4 py-2">₹{item.price}</td>
                <td className="px-4 py-2">₹{item.price * (item.quantity || 1)}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {cartItems.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <h2
                className="text-lg font-medium text-gray-800 cursor-pointer hover:underline"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                {index + 1}. {item.name}
              </h2>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
            <div className="flex gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-contain rounded"
              />
              <div className="flex-1 flex flex-col gap-1 text-gray-700 text-sm">
                <p>Category: {item.category}</p>
                <p>
                  Color:{" "}
                  {item.selectedOptions?.color ? (
                    <span className="flex items-center gap-1">
                      <span
                        className={`inline-block w-4 h-4 rounded-full border ${getColorClass(
                          item.selectedOptions.color
                        )}`}
                      ></span>
                      {item.selectedOptions.color}
                    </span>
                  ) : (
                    "-"
                  )}
                </p>
                <p>Size: {item.selectedOptions?.size || "-"}</p>
                <p>Quantity: {item.quantity || 1}</p>
                <p>Price: ₹{item.price}</p>
                <p>Total: ₹{item.price * (item.quantity || 1)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-md">
        <div className="text-gray-700 font-medium">
          Total Items: {totalItems} | Total Quantity: {totalQty}
        </div>
        <div className="text-xl font-bold text-green-600">
          Total Price: ₹{totalPrice}
        </div>
      </div>

      {/* Clear Cart Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={clearCart}
          className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}

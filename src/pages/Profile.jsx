import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [addresses, setAddresses] = useState([""]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Track user & fetch profile from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");

        try {
          const docRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setPhone(data.phone || "");
            setAddresses(data.addresses || [""]);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          toast.error("Failed to load profile details");
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // ✅ Save profile to Firebase Auth & Firestore
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await updateProfile(auth.currentUser, { displayName });
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        {
          name: displayName,
          phone,
          addresses,
        },
        { merge: true }
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile.");
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Failed to logout.");
    }
  };

  // ✅ Address handling
  const handleAddressChange = (index, value) => {
    const updated = [...addresses];
    updated[index] = value;
    setAddresses(updated);
  };

  const addAddressField = () => setAddresses([...addresses, ""]);
  const removeAddressField = (index) =>
    setAddresses(addresses.filter((_, i) => i !== index));

  if (loading) return <p className="mt-20 text-center">Loading...</p>;

  return (
    <div className="relative max-w-3xl mx-auto mt-24 p-6 bg-white shadow-lg rounded-lg">
      {/* ✅ Logout Button (Top-Right) */}
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        Logout
      </button>

      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h1>

      {user && (
        <>
          {/* Profile Info */}
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={user.photoURL || "/images/default-avatar.png"}
              alt="Profile"
              className="w-16 h-16 rounded-full border object-cover"
            />
            <div>
              <p className="text-lg font-medium text-gray-700">{user.email}</p>
              <p className="text-sm text-gray-500">Email</p>
            </div>
          </div>

          {/* Update Form */}
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Addresses */}
            <div>
              <label className="block text-gray-600 text-sm mb-2">
                Addresses
              </label>
              {addresses.map((address, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => handleAddressChange(index, e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Address ${index + 1}`}
                  />
                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAddressField(index)}
                      className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addAddressField}
                className="mt-2 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
              >
                + Add Address
              </button>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </form>

          {/* ✅ Show saved addresses */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Saved Addresses
            </h2>
            <ul className="list-disc pl-5 text-gray-600">
              {addresses.map((addr, idx) => (
                <li key={idx}>{addr}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

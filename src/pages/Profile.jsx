import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { FiLogOut, FiMapPin, FiShoppingBag, FiEdit, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

export default function MobileProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [addressView, setAddressView] = useState(null); // null | "add" | "list"
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState("");
  const [editAddressId, setEditAddressId] = useState(null);
  const [editAddressText, setEditAddressText] = useState("");
  const navigate = useNavigate();

  const fetchAddresses = async (uid) => {
    try {
      const addrSnap = await getDocs(collection(db, "users", uid, "addresses"));
      setAddresses(addrSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch addresses");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const snap = await getDoc(doc(db, "users", currentUser.uid));
          const data = snap.exists() ? snap.data() : {};
          setUser({ ...currentUser, ...data });
          setName(data.displayName || currentUser.displayName || "");
          setPhone(data.phone || "");
          fetchAddresses(currentUser.uid);
        } catch (err) {
          console.error(err);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Failed to logout");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      await setDoc(
        doc(db, "users", auth.currentUser.uid),
        { displayName: name, phone },
        { merge: true }
      );
      setUser((prev) => ({ ...prev, displayName: name, phone }));
      toast.success("Profile updated!");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) return toast.error("Enter an address");
    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "addresses"), {
        address: newAddress,
      });
      toast.success("Address added!");
      setNewAddress("");
      fetchAddresses(auth.currentUser.uid);
      setAddressView("list");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add address. Check Firestore rules or path.");
    }
  };

  const handleEditAddress = async (id) => {
    if (!editAddressText.trim()) return toast.error("Enter an address");
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid, "addresses", id), {
        address: editAddressText,
      });
      toast.success("Address updated!");
      setEditAddressId(null);
      setEditAddressText("");
      fetchAddresses(auth.currentUser.uid);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update address");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "addresses", id));
      toast.success("Address deleted!");
      fetchAddresses(auth.currentUser.uid);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address");
    }
  };

  if (loading) return <p className="mt-20 text-center">Loading...</p>;

  return (
    <div className="min-h-screen p-4 bg-gray-50">
      {/* Top Section */}
      <div className="relative p-4 text-center bg-white shadow-md rounded-2xl">
        {/* Desktop Home Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute hidden px-3 py-1 text-sm text-white bg-blue-500 rounded top-4 right-4 hover:bg-blue-600 md:block"
        >
          Home
        </button>

        <div className="relative w-24 h-24 mx-auto">
          <img
            src={user.photoURL || "/images/default-avatar.png"}
            alt="Profile"
            className="object-cover w-24 h-24 border-2 border-gray-200 rounded-full"
          />
        </div>

        {editMode ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-48 mx-auto mt-3 text-lg font-semibold text-center border-b border-gray-300"
          />
        ) : (
          <h2 className="mt-3 text-lg font-semibold">{user.displayName || "User Name"}</h2>
        )}

        <p className="text-sm text-gray-500">{user.email}</p>

        {editMode ? (
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-48 mx-auto mt-1 text-sm text-center text-gray-700 border-b border-gray-300"
          />
        ) : (
          <p className="text-sm text-gray-500">{phone}</p>
        )}

        {editMode ? (
          <div className="flex justify-center gap-2 mt-2">
            <button
              onClick={handleSaveProfile}
              className="px-4 py-1 text-sm text-white bg-green-500 rounded-md hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-1 mt-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Menu */}
      <div className="mt-6 bg-white divide-y divide-gray-200 shadow-md rounded-2xl">
        <ProfileItem
          icon={<FiShoppingBag />}
          label="My Orders"
          onClick={() => navigate("/orders")}
        />

        {/* Saved Address Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowAddressDropdown((prev) => !prev)}
            className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">{<FiMapPin />} Saved Address</div>
            <span className="text-gray-400">{">"}</span>
          </button>

          {showAddressDropdown && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              {/* Address Tabs */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setAddressView("add")}
                  className={`px-3 py-1 rounded ${
                    addressView === "add" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  Add Address
                </button>
                <button
                  onClick={() => setAddressView("list")}
                  className={`px-3 py-1 rounded ${
                    addressView === "list" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  My Addresses
                </button>
              </div>

              {/* Address Views */}
              {addressView === "add" && (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter new address"
                    className="p-2 border rounded"
                  />
                  <button
                    onClick={handleAddAddress}
                    className="px-4 py-1 text-sm text-white bg-green-500 rounded-md hover:bg-green-600"
                  >
                    Save Address
                  </button>
                </div>
              )}

              {addressView === "list" && (
                <div className="flex flex-col gap-2">
                  {addresses.length ? (
                    addresses.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 text-gray-700 border rounded">
                        {editAddressId === a.id ? (
                          <div className="flex flex-1 gap-2">
                            <input
                              type="text"
                              value={editAddressText}
                              onChange={(e) => setEditAddressText(e.target.value)}
                              className="flex-1 p-1 border rounded"
                            />
                            <button
                              onClick={() => handleEditAddress(a.id)}
                              className="px-2 text-white bg-green-500 rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditAddressId(null)}
                              className="px-2 text-white bg-gray-500 rounded hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <span>{a.address}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditAddressId(a.id);
                                  setEditAddressText(a.address);
                                }}
                                className="p-1 text-blue-500"
                              >
                                <FiEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(a.id)}
                                className="p-1 text-red-500"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No addresses added yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <ProfileItem icon={<FiLogOut />} label="Log Out" onClick={handleLogout} />
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full px-4 py-3 transition hover:bg-gray-50"
    >
      <div className="flex items-center gap-3 text-sm text-gray-700">
        {icon} {label}
      </div>
      <span className="text-gray-400">{">"}</span>
    </button>
  );
}

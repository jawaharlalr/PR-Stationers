import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign in
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // Check role in Firestore
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists() && snap.data().role === "admin") {
        toast.success("Welcome Admin!");
        navigate("/admin");
      } else {
        toast.error("Access Denied! Not an admin.");
        await signOut(auth);
      }
    } catch (error) {
      toast.error("Invalid credentials or access denied.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Admin Login</h2>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              placeholder="Enter admin email"
              required
            />
          </div>

          {/* Password with Eye Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring focus:ring-blue-300"
                placeholder="Enter password"
                required
              />

              {/* Eye Icon */}
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute text-gray-600 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-800"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

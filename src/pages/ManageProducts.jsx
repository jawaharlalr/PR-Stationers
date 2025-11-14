import { useState, useEffect } from "react";
import { db, storage } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Plus, ArrowLeft, Trash2, Pencil } from "lucide-react";

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    sizes: "",
    colors: "",
    image: null,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    // Convert comma separated → array
    const sizesArr = form.sizes
      ? form.sizes.split(",").map((s) => s.trim())
      : [];

    const colorsArr = form.colors
      ? form.colors.split(",").map((c) => c.trim())
      : [];

    let imageUrl = "";
    if (form.image) {
      const imgRef = ref(storage, `productImages/${form.image.name}`);
      await uploadBytes(imgRef, form.image);
      imageUrl = await getDownloadURL(imgRef);
    }

    await addDoc(collection(db, "products"), {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      sizes: sizesArr, // <-- SAVING AS sizes
      colors: colorsArr, // <-- SAVING AS colors
      imageUrl,
    });

    setShowAdd(false);
    setForm({
      name: "",
      category: "",
      price: "",
      sizes: "",
      colors: "",
      image: null,
    });

    loadProducts();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  return (
    <div className="p-6">
      {!showAdd ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Manage Products</h1>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center p-2 text-white bg-blue-500 shadow rounded-xl"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="p-6 overflow-x-auto bg-white shadow rounded-xl">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">S.No</th>
                  <th className="p-3 text-left">Product Name</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Stock</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{p.name}</td>
                    <td className="p-3">₹{p.price}</td>
                    <td className="p-3">{p.stock || "N/A"}</td>
                    <td className="flex gap-3 p-3">
                      <button className="text-blue-500">
                        <Pencil size={18} />
                      </button>
                      <button
                        className="text-red-500"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="max-w-lg p-6 mx-auto bg-white shadow rounded-xl">
          <button
            onClick={() => setShowAdd(false)}
            className="flex items-center gap-2 mb-4 text-gray-600"
          >
            <ArrowLeft size={20} /> Back
          </button>

          <h2 className="mb-4 text-xl font-bold">Add Product</h2>

          <form className="space-y-4" onSubmit={handleAdd}>
            <input
              className="w-full p-2 border rounded"
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <input
              className="w-full p-2 border rounded"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />

            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />

            <input
              className="w-full p-2 border rounded"
              placeholder="Available Sizes (comma separated)"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            />

            <input
              className="w-full p-2 border rounded"
              placeholder="Available Colors (comma separated)"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, image: e.target.files[0] })
              }
            />

            <button className="w-full p-2 text-white bg-blue-600 rounded-xl">
              Add Product
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

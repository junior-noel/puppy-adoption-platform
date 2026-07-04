import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ShelterSetup = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    orgName: "",
    description: "",
    address: "",
    phone: "",
    website: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/shelters", form);
      // Patch the in-memory user so ProtectedRoute / Navbar react immediately
      setUser((u) => ({ ...u, shelter: data._id }));
      navigate("/dashboard/shelter");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-3xl mb-2">
        Set up your shelter profile
      </h1>
      <p className="text-ink/60 mb-8">
        Complete your profile before listing puppies. Your shelter will be
        verified automatically so you can start straight away.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Organisation name *
          </label>
          <input
            required
            placeholder="e.g. Happy Paws Rescue"
            className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={form.orgName}
            onChange={set("orgName")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            rows={3}
            placeholder="Tell adopters about your shelter..."
            className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={form.description}
            onChange={set("description")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            placeholder="Street, City, Country"
            className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={form.address}
            onChange={set("address")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              placeholder="+237 6xx xxx xxx"
              className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={form.phone}
              onChange={set("phone")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input
              placeholder="https://..."
              className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              value={form.website}
              onChange={set("website")}
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? "Creating profile…" : "Create shelter profile"}
        </button>
      </form>
    </div>
  );
};

export default ShelterSetup;

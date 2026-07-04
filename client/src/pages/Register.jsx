import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "adopter",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await register(form);
      navigate(data.role === "shelter" ? "/shelter/setup" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
          <div className="text-center mb-7">
            <span className="text-4xl animate-paw inline-block mb-2">🐾</span>
            <h1 className="font-display text-3xl">Create account</h1>
            <p className="text-sm text-ink/50 mt-1">
              Join PawHome — it's completely free
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full name
              </label>
              <input
                required
                placeholder="Your name"
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                I want to…
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "adopter", icon: "🏠", label: "Adopt a puppy" },
                  { value: "shelter", icon: "🏥", label: "List puppies" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: opt.value })}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.role === opt.value
                        ? "border-amber-600 bg-amber-50 text-amber-700"
                        : "border-amber-100 text-ink/60 hover:border-amber-300"
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors shadow-md"
            >
              {loading ? "Creating account…" : "Create account"}
            </motion.button>
          </form>

          <p className="text-sm text-ink/60 mt-6 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-700 font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext.jsx';

// const Register = () => {
//   const { register } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ name: '', email: '', password: '', role: 'adopter' });
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       const data = await register(form);
//       navigate(data.role === 'shelter' ? '/dashboard/shelter' : '/');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed');
//     }
//   };

//   return (
//     <div className="max-w-sm mx-auto">
//       <h1 className="font-display text-3xl mb-6">Create an account</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           placeholder="Full name"
//           required
//           className="w-full border border-amber-100 rounded-md px-3 py-2"
//           value={form.name}
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           required
//           className="w-full border border-amber-100 rounded-md px-3 py-2"
//           value={form.email}
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           required
//           minLength={6}
//           className="w-full border border-amber-100 rounded-md px-3 py-2"
//           value={form.password}
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />
//         <div className="flex gap-4 text-sm">
//           <label className="flex items-center gap-2">
//             <input
//               type="radio"
//               checked={form.role === 'adopter'}
//               onChange={() => setForm({ ...form, role: 'adopter' })}
//             />
//             I want to adopt
//           </label>
//           <label className="flex items-center gap-2">
//             <input
//               type="radio"
//               checked={form.role === 'shelter'}
//               onChange={() => setForm({ ...form, role: 'shelter' })}
//             />
//             I run a shelter
//           </label>
//         </div>
//         {error && <p className="text-red-600 text-sm">{error}</p>}
//         <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-md">
//           Sign up
//         </button>
//       </form>
//       <p className="text-sm text-ink/60 mt-4">
//         Already have an account? <Link to="/login" className="text-amber-700">Log in</Link>
//       </p>
//     </div>
//   );
// };

// export default Register;

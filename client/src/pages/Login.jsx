import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8">
          <div className="text-center mb-7">
            <span className="text-4xl animate-paw inline-block mb-2">🐾</span>
            <h1 className="font-display text-3xl">Welcome back</h1>
            <p className="text-sm text-ink/50 mt-1">
              Log in to your PawHome account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
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
              {loading ? "Logging in…" : "Log in"}
            </motion.button>
          </form>

          <p className="text-sm text-ink/60 mt-6 text-center">
            No account?{" "}
            <Link
              to="/register"
              className="text-amber-700 font-medium hover:underline"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext.jsx';

// const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     try {
//       await login(form.email, form.password);
//       navigate('/');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
//     }
//   };

//   return (
//     <div className="max-w-sm mx-auto">
//       <h1 className="font-display text-3xl mb-6">Log in</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
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
//           className="w-full border border-amber-100 rounded-md px-3 py-2"
//           value={form.password}
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />
//         {error && <p className="text-red-600 text-sm">{error}</p>}
//         <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-md">
//           Log in
//         </button>
//       </form>
//       <p className="text-sm text-ink/60 mt-4">
//         No account? <Link to="/register" className="text-amber-700">Sign up</Link>
//       </p>
//     </div>
//   );
// };

// export default Login;

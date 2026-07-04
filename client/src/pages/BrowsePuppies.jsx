import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios.js";
import PuppyCard from "../components/puppy/PuppyCard.jsx";
import SkeletonCard from "../components/common/SkeletonCard.jsx";

const SIZES = ["small", "medium", "large"];
const GENDERS = ["male", "female"];

const chip = (label, active, onClick) => (
  <button
    key={label}
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
      active
        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
        : "bg-white text-ink/70 border-amber-200 hover:border-amber-400"
    }`}
  >
    {label}
  </button>
);

const BrowsePuppies = () => {
  const [searchParams] = useSearchParams();

  const [puppies, setPuppies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    breed: searchParams.get("search") || "",
    size: "",
    gender: "",
  });

  const toggle = (field, val) =>
    setFilters((f) => ({ ...f, [field]: f[field] === val ? "" : val }));

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v),
    );
    api
      .get("/puppies", { params })
      .then((r) => {
        setPuppies(r.data.puppies);
        setTotal(r.data.total);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const hasFilters = filters.breed || filters.size || filters.gender;

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-3xl md:text-4xl mb-1">
          Browse puppies
        </h1>
        <p className="text-ink/50 text-sm">
          {loading
            ? "Finding puppies…"
            : `${total} puppy${total !== 1 ? "ies" : ""} available`}
        </p>
      </motion.div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-amber-100 p-4 mb-6 shadow-sm">
        {/* Text search */}
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">
            🔍
          </span>
          <input
            placeholder="Search by breed or name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/50"
            value={filters.breed}
            onChange={(e) =>
              setFilters((f) => ({ ...f, breed: e.target.value }))
            }
          />
        </div>

        {/* Size chips */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-2">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) =>
              chip(
                s.charAt(0).toUpperCase() + s.slice(1),
                filters.size === s,
                () => toggle("size", s),
              ),
            )}
          </div>
        </div>

        {/* Gender chips */}
        <div className="mb-3">
          <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-2">
            Gender
          </p>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) =>
              chip(
                g.charAt(0).toUpperCase() + g.slice(1),
                filters.gender === g,
                () => toggle("gender", g),
              ),
            )}
          </div>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => setFilters({ breed: "", size: "", gender: "" })}
            className="text-xs text-amber-700 font-medium hover:underline mt-1"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Grid — 2 cols on mobile, 3 on md+ */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : puppies.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 border-2 border-dashed border-amber-200 rounded-2xl"
        >
          <p className="text-5xl mb-3">🐶</p>
          <p className="text-ink/60 font-medium">
            No puppies match those filters.
          </p>
          <button
            onClick={() => setFilters({ breed: "", size: "", gender: "" })}
            className="mt-4 text-sm text-amber-700 font-medium hover:underline"
          >
            Clear filters
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {puppies.map((p, i) => (
            <PuppyCard key={p._id} puppy={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowsePuppies;

// import { useEffect, useState } from "react";
// import api from "../api/axios.js";
// import PuppyCard from "../components/puppy/PuppyCard.jsx";

// const BrowsePuppies = () => {
//   const [puppies, setPuppies] = useState([]);
//   const [filters, setFilters] = useState({ breed: "", size: "", gender: "" });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setLoading(true);
//     const params = Object.fromEntries(
//       Object.entries(filters).filter(([, v]) => v),
//     );
//     api
//       .get("/puppies", { params })
//       .then((res) => setPuppies(res.data.puppies))
//       .finally(() => setLoading(false));
//   }, [filters]);

//   return (
//     <div className="space-y-6">
//       <div className="rounded-[1.5rem] border border-amber-200/70 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
//               Meet your match
//             </p>
//             <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
//               Browse puppies
//             </h1>
//           </div>
//           <p className="max-w-xl text-sm text-ink/65 sm:text-base">
//             Filter by personality and size to discover the puppy that fits your
//             lifestyle.
//           </p>
//         </div>

//         <div className="mt-6 grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
//           <input
//             placeholder="Breed"
//             className="w-full rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm outline-none ring-0 transition focus:border-amber-300 focus:bg-white"
//             value={filters.breed}
//             onChange={(e) => setFilters({ ...filters, breed: e.target.value })}
//           />
//           <select
//             className="w-full rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm outline-none transition focus:border-amber-300 focus:bg-white"
//             value={filters.size}
//             onChange={(e) => setFilters({ ...filters, size: e.target.value })}
//           >
//             <option value="">Any size</option>
//             <option value="small">Small</option>
//             <option value="medium">Medium</option>
//             <option value="large">Large</option>
//           </select>
//           <select
//             className="w-full rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 text-sm outline-none transition focus:border-amber-300 focus:bg-white"
//             value={filters.gender}
//             onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
//           >
//             <option value="">Any gender</option>
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//           </select>
//         </div>
//       </div>

//       {loading ? (
//         <div className="rounded-[1.25rem] border border-dashed border-amber-200 bg-white/70 p-10 text-center text-ink/70">
//           Loading adorable companions...
//         </div>
//       ) : puppies.length === 0 ? (
//         <div className="rounded-[1.25rem] border border-dashed border-amber-200 bg-white/70 p-10 text-center text-ink/70">
//           No puppies match those filters yet.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
//           {puppies.map((p) => (
//             <PuppyCard key={p._id} puppy={p} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BrowsePuppies;

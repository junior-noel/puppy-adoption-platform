import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import Carousel from '../components/common/Carousel.jsx';
import PuppyCard from '../components/puppy/PuppyCard.jsx';

const Badge = ({ children, color = 'amber' }) => {
  const colors = {
    amber: 'bg-amber-100 text-amber-700',
    green: 'bg-green-100 text-green-700',
    blue:  'bg-blue-100  text-blue-700',
    gray:  'bg-gray-100  text-gray-600',
  };
  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${colors[color]}`}>
      {children}
    </span>
  );
};

const PuppyDetail = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [puppy,    setPuppy]    = useState(null);
  const [related,  setRelated]  = useState([]);
  const [applying, setApplying] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [formData, setFormData] = useState({
    housingType: '', hasYard: false, otherPets: '',
    experience: '', reasonForAdopting: '',
  });

  // Fetch puppy
  useEffect(() => {
    setPuppy(null);
    setRelated([]);
    setApplying(false);
    window.scrollTo(0, 0);

    api.get(`/puppies/${id}`).then((r) => {
      setPuppy(r.data);

      // Fetch 2 related puppies (same breed, exclude current)
      api.get('/puppies', {
        params: { breed: r.data.breed, limit: 4 },
      }).then((res) => {
        const others = (res.data.puppies || []).filter((p) => p._id !== id).slice(0, 2);
        setRelated(others);
      });
    });
  }, [id]);

  const set = (field) => (e) =>
    setFormData((f) => ({ ...f, [field]: e.target.value }));

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/applications', { puppyId: id, formData });
      navigate(`/chat/${data.conversationId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  // Loading skeleton
  if (!puppy) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div className="aspect-square md:aspect-[16/9] bg-amber-100 rounded-2xl skeleton" />
        <div className="h-8  bg-amber-100 rounded-xl skeleton w-1/2" />
        <div className="h-4  bg-amber-100 rounded-xl skeleton w-1/3" />
        <div className="h-24 bg-amber-100 rounded-xl skeleton" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      {/* ── Main grid ───────────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6 md:gap-10 mb-12">

        {/* Left — photo carousel */}
        <div>
          <Carousel
            images={puppy.photos?.length ? puppy.photos : []}
            autoPlay
            className="aspect-square rounded-2xl overflow-hidden shadow-lg"
          />

          {/* Temperament tags below carousel */}
          {puppy.temperamentTags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {puppy.temperamentTags.map((tag) => (
                <Badge key={tag} color="amber">{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Right — info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Name + status */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h1 className="font-display text-4xl leading-tight">{puppy.name}</h1>
            <span className={`mt-2 flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${
              puppy.status === 'available'
                ? 'bg-green-100 text-green-700'
                : puppy.status === 'adopted'
                ? 'bg-gray-100 text-gray-500'
                : 'bg-amber-100 text-amber-700'
            }`}>
              {puppy.status}
            </span>
          </div>

          <p className="text-ink/60 mb-4">
            {puppy.breed} · {puppy.age} months · {puppy.gender} · {puppy.size}
          </p>

          {/* Health badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            {puppy.vaccinated        && <Badge color="green">✓ Vaccinated</Badge>}
            {puppy.neutered          && <Badge color="green">✓ Neutered/Spayed</Badge>}
            {puppy.goodWithKids      && <Badge color="blue">👶 Good with kids</Badge>}
            {puppy.goodWithOtherPets && <Badge color="blue">🐾 Good with other pets</Badge>}
          </div>

          {/* Description */}
          {puppy.description && (
            <p className="text-ink/70 leading-relaxed mb-5">{puppy.description}</p>
          )}

          {/* Medical history */}
          {puppy.medicalHistory && (
            <div className="bg-amber-50 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1">
                Medical history
              </p>
              <p className="text-sm text-ink/70">{puppy.medicalHistory}</p>
            </div>
          )}

          {/* Shelter info */}
          <div className="border border-amber-100 rounded-xl p-4 mb-6 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
              🏠
            </div>
            <div>
              <p className="font-medium text-sm">{puppy.shelter?.orgName}</p>
              {puppy.shelter?.address && (
                <p className="text-xs text-ink/50">{puppy.shelter.address}</p>
              )}
              {puppy.shelter?.verified && (
                <p className="text-xs text-green-600 font-medium">✓ Verified shelter</p>
              )}
            </div>
          </div>

          {/* Adopt CTA */}
          {user?.role === 'adopter' && puppy.status === 'available' && !applying && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setApplying(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-md"
            >
              Apply to adopt {puppy.name} 🐾
            </motion.button>
          )}

          {/* Not logged in */}
          {!user && puppy.status === 'available' && (
            <div className="text-center">
              <p className="text-sm text-ink/60 mb-3">
                Create a free account to apply for adoption.
              </p>
              <Link
                to="/register"
                className="block w-full bg-amber-600 text-white py-3.5 rounded-xl font-bold text-center hover:bg-amber-700 transition-colors"
              >
                Sign up to adopt
              </Link>
            </div>
          )}

          {/* Shelter / admin viewing */}
          {user?.role === 'shelter' && (
            <div className="bg-amber-50 rounded-xl p-4 text-sm text-ink/60 text-center">
              Log in as an adopter to apply for this puppy.
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Application form ────────────────────────────────────────────── */}
      <AnimatePresence>
        {applying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden mb-12"
          >
            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
              <h2 className="font-display text-2xl mb-5">
                Your application for {puppy.name}
              </h2>

              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium mb-1">Housing type *</label>
                    <select
                      required
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                      onChange={set('housingType')}
                    >
                      <option value="">Select…</option>
                      <option>House with yard</option>
                      <option>House without yard</option>
                      <option>Apartment</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium mb-1">
                      Other pets at home?
                    </label>
                    <input
                      placeholder="e.g. one cat, two dogs"
                      className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                      onChange={set('otherPets')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Your experience with dogs *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell the shelter about your experience with dogs and pets…"
                    className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    onChange={set('experience')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Why do you want to adopt {puppy.name}? *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Share what drew you to this puppy and your plans for their care…"
                    className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    onChange={set('reasonForAdopting')}
                  />
                </div>

                {error && (
                  <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    {loading ? 'Submitting…' : 'Submit application'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setApplying(false)}
                    className="px-5 border border-amber-200 rounded-xl text-sm text-ink/60 hover:bg-amber-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Related puppies ─────────────────────────────────────────────── */}
      {related.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-2xl">You might also like</h2>
              <p className="text-sm text-ink/50 mt-0.5">
                More {puppy.breed} puppies available
              </p>
            </div>
            <Link
              to={`/browse?search=${encodeURIComponent(puppy.breed)}`}
              className="text-sm text-amber-700 font-medium hover:underline"
            >
              See more →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {related.map((p, i) => (
              <PuppyCard key={p._id} puppy={p} index={i} />
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Back link ───────────────────────────────────────────────────── */}
      <div className="pb-6">
        <Link
          to="/browse"
          className="text-sm text-ink/50 hover:text-amber-700 transition-colors flex items-center gap-1"
        >
          ← Back to all puppies
        </Link>
      </div>
    </motion.div>
  );
};

export default PuppyDetail;




// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import api from "../api/axios.js";
// import { useAuth } from "../context/AuthContext.jsx";
// import Carousel from "../components/common/Carousel.jsx";

// const Badge = ({ children, color = "amber" }) => {
//   const colors = {
//     amber: "bg-amber-100 text-amber-700",
//     green: "bg-green-100 text-green-700",
//     blue: "bg-blue-100  text-blue-700",
//     gray: "bg-gray-100  text-gray-600",
//   };
//   return (
//     <span
//       className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${colors[color]}`}
//     >
//       {children}
//     </span>
//   );
// };

// const PuppyDetail = () => {
//   const { id } = useParams();
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   const [puppy, setPuppy] = useState(null);
//   const [applying, setApplying] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [formData, setFormData] = useState({
//     housingType: "",
//     hasYard: false,
//     otherPets: "",
//     experience: "",
//     reasonForAdopting: "",
//   });

//   useEffect(() => {
//     api.get(`/puppies/${id}`).then((r) => setPuppy(r.data));
//   }, [id]);

//   const set = (field) => (e) =>
//     setFormData((f) => ({ ...f, [field]: e.target.value }));

//   const handleApply = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       const { data } = await api.post("/applications", {
//         puppyId: id,
//         formData,
//       });
//       navigate(`/chat/${data.conversationId}`);
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong");
//       setLoading(false);
//     }
//   };

//   if (!puppy) {
//     return (
//       <div className="space-y-4 animate-pulse">
//         <div className="aspect-square bg-amber-100 rounded-2xl skeleton" />
//         <div className="h-8 bg-amber-100 rounded-xl skeleton w-1/2" />
//         <div className="h-4 bg-amber-100 rounded-xl skeleton w-1/3" />
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="max-w-4xl mx-auto"
//     >
//       <div className="grid md:grid-cols-2 gap-6 md:gap-10">
//         {/* ── Photo carousel ──────────────────────────────────────────────── */}
//         <div>
//           <Carousel
//             images={puppy.photos?.length ? puppy.photos : []}
//             autoPlay
//             className="aspect-square rounded-2xl overflow-hidden shadow-md"
//           />

//           {/* Temperament tags */}
//           {puppy.temperamentTags?.length > 0 && (
//             <div className="mt-4 flex flex-wrap gap-2">
//               {puppy.temperamentTags.map((tag) => (
//                 <Badge key={tag} color="amber">
//                   {tag}
//                 </Badge>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* ── Info ────────────────────────────────────────────────────────── */}
//         <div>
//           <motion.div
//             initial={{ opacity: 0, y: 16 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//           >
//             <div className="flex items-start justify-between gap-2 mb-1">
//               <h1 className="font-display text-4xl">{puppy.name}</h1>
//               <span
//                 className={`mt-1 text-xs font-semibold px-3 py-1 rounded-full ${
//                   puppy.status === "available"
//                     ? "bg-green-100 text-green-700"
//                     : puppy.status === "adopted"
//                       ? "bg-gray-100 text-gray-500"
//                       : "bg-amber-100 text-amber-700"
//                 }`}
//               >
//                 {puppy.status}
//               </span>
//             </div>

//             <p className="text-ink/60 mb-4">
//               {puppy.breed} · {puppy.age} months · {puppy.gender} · {puppy.size}
//             </p>

//             {/* Quick info badges */}
//             <div className="flex flex-wrap gap-2 mb-5">
//               {puppy.vaccinated && <Badge color="green">✓ Vaccinated</Badge>}
//               {puppy.neutered && <Badge color="green">✓ Neutered/Spayed</Badge>}
//               {puppy.goodWithKids && <Badge color="blue">Good with kids</Badge>}
//               {puppy.goodWithOtherPets && (
//                 <Badge color="blue">Good with other pets</Badge>
//               )}
//             </div>

//             {puppy.description && (
//               <p className="text-ink/70 leading-relaxed mb-5">
//                 {puppy.description}
//               </p>
//             )}

//             {puppy.medicalHistory && (
//               <div className="bg-amber-50 rounded-xl p-4 mb-5">
//                 <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-1">
//                   Medical history
//                 </p>
//                 <p className="text-sm text-ink/70">{puppy.medicalHistory}</p>
//               </div>
//             )}

//             {/* Shelter info */}
//             <div className="border border-amber-100 rounded-xl p-4 mb-6 flex items-center gap-3">
//               <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">
//                 🏠
//               </div>
//               <div>
//                 <p className="font-medium text-sm">{puppy.shelter?.orgName}</p>
//                 <p className="text-xs text-ink/50">{puppy.shelter?.address}</p>
//                 {puppy.shelter?.verified && (
//                   <span className="text-xs text-green-600 font-medium">
//                     ✓ Verified shelter
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* CTA */}
//             {user?.role === "adopter" &&
//               puppy.status === "available" &&
//               !applying && (
//                 <motion.button
//                   whileTap={{ scale: 0.97 }}
//                   onClick={() => setApplying(true)}
//                   className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-semibold text-base transition-colors shadow-md"
//                 >
//                   Apply to adopt {puppy.name}
//                 </motion.button>
//               )}

//             {!user && puppy.status === "available" && (
//               <div className="text-center">
//                 <p className="text-sm text-ink/60 mb-3">
//                   Create a free account to apply for adoption.
//                 </p>
//                 <a
//                   href="/register"
//                   className="block w-full bg-amber-600 text-white py-3.5 rounded-xl font-semibold text-center hover:bg-amber-700 transition-colors"
//                 >
//                   Sign up to adopt
//                 </a>
//               </div>
//             )}
//           </motion.div>
//         </div>
//       </div>

//       {/* ── Application form ──────────────────────────────────────────────── */}
//       <AnimatePresence>
//         {applying && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             transition={{ duration: 0.4 }}
//             className="overflow-hidden mt-8"
//           >
//             <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
//               <h2 className="font-display text-2xl mb-5">
//                 Your application for {puppy.name}
//               </h2>

//               <form onSubmit={handleApply} className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="col-span-2 sm:col-span-1">
//                     <label className="block text-sm font-medium mb-1">
//                       Housing type *
//                     </label>
//                     <select
//                       required
//                       className="w-full border border-amber-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
//                       onChange={set("housingType")}
//                     >
//                       <option value="">Select…</option>
//                       <option>House with yard</option>
//                       <option>House without yard</option>
//                       <option>Apartment</option>
//                       <option>Other</option>
//                     </select>
//                   </div>
//                   <div className="col-span-2 sm:col-span-1">
//                     <label className="block text-sm font-medium mb-1">
//                       Other pets at home?
//                     </label>
//                     <input
//                       placeholder="e.g. one cat, two dogs"
//                       className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
//                       onChange={set("otherPets")}
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Your experience with dogs *
//                   </label>
//                   <textarea
//                     required
//                     rows={3}
//                     placeholder="Tell the shelter about your experience with dogs and pets…"
//                     className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
//                     onChange={set("experience")}
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium mb-1">
//                     Why do you want to adopt {puppy.name}? *
//                   </label>
//                   <textarea
//                     required
//                     rows={3}
//                     placeholder="Share what drew you to this puppy and your plans for their care…"
//                     className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
//                     onChange={set("reasonForAdopting")}
//                   />
//                 </div>

//                 {error && (
//                   <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2">
//                     {error}
//                   </p>
//                 )}

//                 <div className="flex gap-3">
//                   <motion.button
//                     type="submit"
//                     disabled={loading}
//                     whileTap={{ scale: 0.97 }}
//                     className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
//                   >
//                     {loading ? "Submitting…" : "Submit application"}
//                   </motion.button>
//                   <button
//                     type="button"
//                     onClick={() => setApplying(false)}
//                     className="px-5 border border-amber-200 rounded-xl text-sm text-ink/60 hover:bg-amber-50 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// export default PuppyDetail;


// // import { useParams, useNavigate } from 'react-router-dom';
// // import api from '../api/axios.js';
// // import { useAuth } from '../context/AuthContext.jsx';

// // const PuppyDetail = () => {
// //   const { id } = useParams();
// //   const { user } = useAuth();
// //   const navigate = useNavigate();
// //   const [puppy, setPuppy] = useState(null);
// //   const [applying, setApplying] = useState(false);
// //   const [formData, setFormData] = useState({
// //     housingType: '', hasYard: false, otherPets: '', experience: '', reasonForAdopting: '',
// //   });

// //   useEffect(() => {
// //     api.get(`/puppies/${id}`).then((res) => setPuppy(res.data));
// //   }, [id]);

// //   const handleApply = async (e) => {
// //     e.preventDefault();
// //     const { data } = await api.post('/applications', { puppyId: id, formData });
// //     navigate(`/chat/${data.conversationId}`);
// //   };

// //   if (!puppy) return <p className="text-ink/60">Loading...</p>;

// //   return (
// //     <div className="grid md:grid-cols-2 gap-10">
// //       <div className="aspect-square bg-amber-100 rounded-xl overflow-hidden">
// //         {puppy.photos?.[0] && (
// //           <img src={puppy.photos[0]} alt={puppy.name} className="w-full h-full object-cover" />
// //         )}
// //       </div>

// //       <div>
// //         <h1 className="font-display text-4xl mb-2">{puppy.name}</h1>
// //         <p className="text-ink/60 mb-4">
// //           {puppy.breed} · {puppy.age} months · {puppy.gender} · {puppy.size}
// //         </p>
// //         <p className="mb-4">{puppy.description}</p>
// //         <ul className="text-sm text-ink/70 space-y-1 mb-6">
// //           <li>Vaccinated: {puppy.vaccinated ? 'Yes' : 'No'}</li>
// //           <li>Neutered/spayed: {puppy.neutered ? 'Yes' : 'No'}</li>
// //           <li>Good with kids: {puppy.goodWithKids ? 'Yes' : 'No'}</li>
// //           <li>Good with other pets: {puppy.goodWithOtherPets ? 'Yes' : 'No'}</li>
// //         </ul>
// //         <p className="text-sm text-ink/50 mb-6">Listed by {puppy.shelter?.orgName}</p>

// //         {user?.role === 'adopter' && puppy.status === 'available' && !applying && (
// //           <button
// //             onClick={() => setApplying(true)}
// //             className="bg-amber-600 text-white px-6 py-3 rounded-md font-medium"
// //           >
// //             Apply to adopt
// //           </button>
// //         )}

// //         {applying && (
// //           <form onSubmit={handleApply} className="space-y-3 mt-4">
// //             <input
// //               placeholder="Housing type (house, apartment...)"
// //               required
// //               className="w-full border border-amber-100 rounded-md px-3 py-2 text-sm"
// //               onChange={(e) => setFormData({ ...formData, housingType: e.target.value })}
// //             />
// //             <textarea
// //               placeholder="Tell the shelter about your experience with dogs"
// //               required
// //               className="w-full border border-amber-100 rounded-md px-3 py-2 text-sm"
// //               onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
// //             />
// //             <textarea
// //               placeholder="Why do you want to adopt this puppy?"
// //               required
// //               className="w-full border border-amber-100 rounded-md px-3 py-2 text-sm"
// //               onChange={(e) => setFormData({ ...formData, reasonForAdopting: e.target.value })}
// //             />
// //             <button type="submit" className="bg-amber-600 text-white px-6 py-2 rounded-md text-sm">
// //               Submit application
// //             </button>
// //           </form>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default PuppyDetail;

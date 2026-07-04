import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios.js';
import PuppyCard from '../components/puppy/PuppyCard.jsx';
import SkeletonCard from '../components/common/SkeletonCard.jsx';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&q=85',
    tag:   'Golden Retriever',
  },
  {
    image: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=1600&q=85',
    tag:   'Adorable Puppy',
  },
  {
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1600&q=85',
    tag:   'Best Friends',
  },
  {
    image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1600&q=85',
    tag:   'Ready to Adopt',
  },
  {
    image: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=1600&q=85',
    tag:   'Find Your Match',
  },
];

const HEADLINES = [
  'Find your perfect puppy.',
  'Give a pup a loving home.',
  'Your new best friend awaits.',
];

const STEPS = [
  { icon: '🔍', title: 'Browse',  desc: 'Search puppies by breed, size, age, and more.' },
  { icon: '📝', title: 'Apply',   desc: 'Submit a short application to the shelter.' },
  { icon: '💬', title: 'Chat',    desc: 'Message the shelter in real time.' },
  { icon: '🏠', title: 'Adopt',   desc: 'Bring your new best friend home.' },
];

// ── Hero carousel ─────────────────────────────────────────────────────────
const HeroCarousel = ({ current, setCurrent }) => (
  <div className="absolute inset-0">
    <AnimatePresence mode="sync">
      <motion.div
        key={current}
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.4, ease: 'easeInOut' }}
        className="absolute inset-0"
      >
        <img
          src={HERO_SLIDES[current].image}
          alt="hero"
          className="w-full h-full object-cover"
        />
      </motion.div>
    </AnimatePresence>

    {/* Layered gradient — bottom heavy so stats + search stay legible */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/75" />

    {/* Left / Right arrows */}
    <button
      onClick={() => setCurrent((c) => (c - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white text-xl flex items-center justify-center transition-colors"
    >
      ‹
    </button>
    <button
      onClick={() => setCurrent((c) => (c + 1) % HERO_SLIDES.length)}
      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full text-white text-xl flex items-center justify-center transition-colors"
    >
      ›
    </button>

    {/* Dot indicators */}
    <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20">
      {HERO_SLIDES.map((_, i) => (
        <button
          key={i}
          onClick={() => setCurrent(i)}
          className={`rounded-full transition-all duration-300 ${
            i === current ? 'bg-white w-6 h-1.5' : 'bg-white/40 w-1.5 h-1.5'
          }`}
        />
      ))}
    </div>

    {/* Current slide tag */}
    <AnimatePresence mode="wait">
      <motion.span
        key={current}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-10 left-5 z-20 text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full"
      >
        🐾 {HERO_SLIDES[current].tag}
      </motion.span>
    </AnimatePresence>
  </div>
);

// ── Horizontal scroll puppy strip ─────────────────────────────────────────
const HorizontalPuppyStrip = ({ puppies, loading }) => {
  const ref = useRef(null);

  const scroll = (dir) =>
    ref.current?.scrollBy({ left: dir * 230, behavior: 'smooth' });

  return (
    <div className="relative">
      {/* Arrow — left */}
      <button
        onClick={() => scroll(-1)}
        className="absolute -left-4 top-1/2 -translate-y-8 z-10 w-9 h-9 bg-white shadow-lg rounded-full hidden sm:flex items-center justify-center text-ink/60 hover:text-amber-700 transition-colors border border-amber-100"
      >
        ‹
      </button>

      {/* Scrollable strip */}
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: 'none' }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-44 sm:w-52">
                <SkeletonCard />
              </div>
            ))
          : puppies.map((p, i) => (
              <div key={p._id} className="flex-shrink-0 w-44 sm:w-52">
                <PuppyCard puppy={p} index={i} />
              </div>
            ))}
      </div>

      {/* Arrow — right */}
      <button
        onClick={() => scroll(1)}
        className="absolute -right-4 top-1/2 -translate-y-8 z-10 w-9 h-9 bg-white shadow-lg rounded-full hidden sm:flex items-center justify-center text-ink/60 hover:text-amber-700 transition-colors border border-amber-100"
      >
        ›
      </button>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
const Home = () => {
  const navigate = useNavigate();

  const [puppies,  setPuppies]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [headline, setHeadline] = useState(0);
  const [heroCurrent, setHeroCurrent] = useState(0);
  const [search,   setSearch]   = useState('');

  // Fetch latest puppies
  useEffect(() => {
    api.get('/puppies', { params: { limit: 12 } })
      .then((r) => { setPuppies(r.data.puppies || []); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance hero every 6 s
  useEffect(() => {
    const id = setInterval(() => setHeroCurrent((c) => (c + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);

  // Rotate headline every 3.5 s
  useEffect(() => {
    const id = setInterval(() => setHeadline((h) => (h + 1) % HEADLINES.length), 3500);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/browse${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  };

  return (
    <div>

      {/* ══ HERO — full-viewport with image carousel ════════════════════ */}
      <section className="relative min-h-[100svh] md:min-h-[92vh] flex flex-col items-center justify-center text-white overflow-hidden">

        <HeroCarousel current={heroCurrent} setCurrent={setHeroCurrent} />

        {/* Hero text content */}
        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center pt-20 pb-28">

          {/* Trust badge */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="inline-block bg-amber-500/70 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase"
          >
            🐾 Trusted Puppy Adoption
          </motion.p>

          {/* Animated headline */}
          <div className="min-h-[3.8rem] md:min-h-[6.5rem] flex items-center justify-center overflow-hidden mb-4">
            <AnimatePresence mode="wait">
              <motion.h1
                key={headline}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight drop-shadow-xl"
              >
                {HEADLINES[headline]}
              </motion.h1>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-white/80 text-base md:text-xl max-w-xl mx-auto mb-8 leading-relaxed"
          >
            Browse adoptable puppies from verified shelters, apply in minutes,
            and chat directly with rescues near you.
          </motion.p>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            onSubmit={handleSearch}
            className="flex gap-2 max-w-lg mx-auto mb-8"
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search breed, e.g. Labrador…"
              className="flex-1 rounded-2xl px-5 py-4 text-ink text-sm md:text-base focus:outline-none shadow-xl bg-white/95"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-6 py-4 rounded-2xl transition-colors shadow-xl whitespace-nowrap text-sm md:text-base"
            >
              Search
            </button>
          </motion.form>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
          >
            <Link
              to="/browse"
              className="bg-white text-amber-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-amber-50 transition-colors shadow-lg"
            >
              Browse all puppies →
            </Link>
            <Link
              to="/register"
              className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/20 transition-colors"
            >
              List puppies — free
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="flex justify-center gap-8 md:gap-16"
          >
            {[['500+','Puppies adopted'],['50+','Verified shelters'],['24h','Avg. response']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="font-display text-2xl md:text-4xl font-bold drop-shadow">{n}</p>
                <p className="text-white/70 text-xs md:text-sm mt-0.5">{l}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="absolute bottom-6 left-0 right-0 flex justify-center z-20"
        >
          <span className="text-white/50 text-2xl select-none">↓</span>
        </motion.div>
      </section>

      {/* ══ SECTION CONTENT ═════════════════════════════════════════════ */}
      <div className="bg-amber-50">
        <div className="max-w-6xl mx-auto px-4">

          {/* ── How it works ─────────────────────────────────────────── */}
          <section className="py-14">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="font-display text-3xl md:text-4xl mb-2">How PawHome works</h2>
              <p className="text-ink/50 text-sm md:text-base">Adopting a puppy has never been easier</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 text-center border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className="text-3xl mb-3 inline-block animate-float"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  >
                    {step.icon}
                  </div>
                  <h3 className="font-display text-base md:text-lg mb-1">{step.title}</h3>
                  <p className="text-xs md:text-sm text-ink/60 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── Puppies section ──────────────────────────────────────── */}
          <section className="pb-14">
            <div className="flex items-end justify-between mb-6 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl md:text-4xl mb-1">
                  Puppies looking for a home
                </h2>
                <p className="text-ink/50 text-sm">
                  {loading
                    ? 'Finding puppies…'
                    : `${total} adorable pup${total !== 1 ? 'pies' : 'py'} available`}
                </p>
              </motion.div>

              <Link
                to="/browse"
                className="flex-shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
              >
                View all →
              </Link>
            </div>

            {/* Horizontal scroll strip */}
            <HorizontalPuppyStrip puppies={puppies} loading={loading} />

            {/* Second view-all below the strip */}
            {!loading && total > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mt-8"
              >
                <Link
                  to="/browse"
                  className="inline-flex items-center gap-2 bg-white border-2 border-amber-600 text-amber-700 font-bold px-10 py-3.5 rounded-2xl hover:bg-amber-50 transition-colors shadow-sm text-sm md:text-base"
                >
                  View all {total} puppies →
                </Link>
              </motion.div>
            )}
          </section>

          {/* ── Shelter CTA ──────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 relative overflow-hidden rounded-3xl min-h-[280px] flex items-center"
          >
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80"
                alt="shelter cta"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-950/90 via-amber-800/85 to-amber-700/70" />
            </div>

            <div className="relative z-10 w-full p-8 md:p-14 text-white text-center">
              <span className="text-4xl animate-paw inline-block mb-4">🐾</span>
              <h2 className="font-display text-3xl md:text-5xl mb-3">
                Run a shelter or rescue?
              </h2>
              <p className="text-white/80 mb-8 max-w-md mx-auto text-sm md:text-lg">
                List your puppies for free and connect with thousands of
                loving adopters — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/register"
                  className="bg-white text-amber-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-amber-50 transition-colors shadow-lg"
                >
                  Get started — it's free
                </Link>
                <Link
                  to="/success-stories"
                  className="border border-white/40 text-white font-semibold px-8 py-3.5 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  See happy tails ✓
                </Link>
              </div>
            </div>
          </motion.section>

        </div>
      </div>
    </div>
  );
};

export default Home;



// import { useEffect, useState, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import api from "../api/axios.js";
// import PuppyCard from "../components/puppy/PuppyCard.jsx";

// const STEPS = [
//   {
//     icon: "🔍",
//     title: "Browse",
//     desc: "Search puppies by breed, size, age, and more.",
//   },
//   {
//     icon: "📝",
//     title: "Apply",
//     desc: "Submit a short application directly to the shelter.",
//   },
//   {
//     icon: "💬",
//     title: "Chat",
//     desc: "Message the shelter in real time from your dashboard.",
//   },
//   {
//     icon: "🏠",
//     title: "Adopt",
//     desc: "Meet your new best friend and bring them home.",
//   },
// ];

// const HEADLINES = [
//   "Find your perfect puppy.",
//   "Give a pup a loving home.",
//   "Your new best friend awaits.",
// ];

// const Home = () => {
//   const navigate = useNavigate();
//   const [featured, setFeatured] = useState([]);
//   const [headline, setHeadline] = useState(0);
//   const [search, setSearch] = useState("");
//   const timerRef = useRef(null);

//   useEffect(() => {
//     api
//       .get("/puppies", { params: { limit: 6 } })
//       .then((r) => setFeatured(r.data.puppies || []));
//   }, []);

//   useEffect(() => {
//     timerRef.current = setInterval(
//       () => setHeadline((h) => (h + 1) % HEADLINES.length),
//       3000,
//     );
//     return () => clearInterval(timerRef.current);
//   }, []);

//   const handleSearch = (e) => {
//     e.preventDefault();
//     navigate(`/browse${search ? `?search=${encodeURIComponent(search)}` : ""}`);
//   };

//   return (
//     <div>
//       {/* ── Hero ─────────────────────────────────────────────────────────── */}
//       <section className="relative bg-gradient-to-br from-amber-600 via-amber-500 to-orange-400 text-white overflow-hidden">
//         {/* Decorative paws */}
//         <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden">
//           {[
//             "top-4 left-4",
//             "top-12 right-8",
//             "bottom-8 left-1/3",
//             "top-1/2 right-6",
//             "bottom-12 left-8",
//             "top-1/3 left-1/2",
//           ].map((cls, i) => (
//             <span key={i} className={`absolute text-5xl ${cls}`} aria-hidden>
//               🐾
//             </span>
//           ))}
//         </div>

//         <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-24 text-center">
//           {/* Rotating headline */}
//           <div className="min-h-[3.2rem] md:min-h-[4.5rem] mb-4 flex items-center justify-center overflow-hidden">
//             <motion.h1
//               key={headline}
//               initial={{ opacity: 0, y: 16 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.45 }}
//               className="font-display text-3xl md:text-6xl font-bold leading-tight"
//             >
//               {HEADLINES[headline]}
//             </motion.h1>
//           </div>

//           <p className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-8">
//             Browse adoptable puppies from verified shelters, apply in minutes,
//             and chat directly with rescues.
//           </p>

//           {/* Search bar */}
//           <form
//             onSubmit={handleSearch}
//             className="flex gap-2 max-w-md mx-auto mb-10"
//           >
//             <input
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder="Search by breed, e.g. Labrador…"
//               className="flex-1 rounded-xl px-4 py-3 text-ink text-sm focus:outline-none shadow-lg"
//             />
//             <button
//               type="submit"
//               className="bg-white text-amber-700 font-semibold px-5 py-3 rounded-xl text-sm hover:bg-amber-50 transition-colors shadow-lg whitespace-nowrap"
//             >
//               Search
//             </button>
//           </form>

//           {/* Stats */}
//           <div className="flex justify-center gap-8 md:gap-16">
//             {[
//               ["500+", "Puppies adopted"],
//               ["50+", "Verified shelters"],
//               ["24h", "Avg response"],
//             ].map(([n, l]) => (
//               <div key={l}>
//                 <p className="font-display text-2xl md:text-3xl font-bold">
//                   {n}
//                 </p>
//                 <p className="text-white/70 text-xs mt-0.5">{l}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Wave */}
//         <svg
//           viewBox="0 0 1440 50"
//           className="w-full -mb-px block"
//           fill="#FFF8F0"
//           preserveAspectRatio="none"
//           style={{ height: 40 }}
//         >
//           <path d="M0,32L120,26.7C240,21,480,11,720,16C960,21,1200,43,1320,53.3L1440,64L1440,64L0,64Z" />
//         </svg>
//       </section>

//       <div className="max-w-6xl mx-auto px-4">
//         {/* ── How it works ─────────────────────────────────────────────────── */}
//         <section className="py-12">
//           <motion.h2
//             initial={{ opacity: 0, y: 12 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             className="font-display text-3xl text-center mb-8"
//           >
//             How PawHome works
//           </motion.h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
//             {STEPS.map((step, i) => (
//               <motion.div
//                 key={step.title}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.4, delay: i * 0.1 }}
//                 className="bg-white rounded-2xl p-4 md:p-5 text-center border border-amber-100 shadow-sm"
//               >
//                 <div
//                   className="text-3xl mb-2 animate-float"
//                   style={{ animationDelay: `${i * 0.3}s` }}
//                 >
//                   {step.icon}
//                 </div>
//                 <h3 className="font-display text-base md:text-lg mb-1">
//                   {step.title}
//                 </h3>
//                 <p className="text-xs md:text-sm text-ink/60 leading-relaxed">
//                   {step.desc}
//                 </p>
//               </motion.div>
//             ))}
//           </div>
//         </section>

//         {/* ── Featured puppies ─────────────────────────────────────────────── */}
//         {featured.length > 0 && (
//           <section className="pb-12">
//             <div className="flex items-center justify-between mb-6">
//               <motion.h2
//                 initial={{ opacity: 0, x: -12 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 viewport={{ once: true }}
//                 className="font-display text-3xl"
//               >
//                 Meet our puppies
//               </motion.h2>
//               <Link
//                 to="/browse"
//                 className="text-sm text-amber-700 font-medium hover:underline"
//               >
//                 See all →
//               </Link>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
//               {featured.map((p, i) => (
//                 <PuppyCard key={p._id} puppy={p} index={i} />
//               ))}
//             </div>
//           </section>
//         )}

//         {/* ── Shelter CTA ──────────────────────────────────────────────────── */}
//         <motion.section
//           initial={{ opacity: 0, scale: 0.97 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           viewport={{ once: true }}
//           className="mb-14 bg-gradient-to-r from-amber-600 to-orange-500 rounded-3xl p-8 md:p-12 text-white text-center"
//         >
//           <span className="text-4xl animate-paw inline-block mb-3">🐾</span>
//           <h2 className="font-display text-2xl md:text-4xl mb-3">
//             Run a shelter or rescue?
//           </h2>
//           <p className="text-white/80 mb-6 max-w-md mx-auto text-sm md:text-base">
//             List your puppies for free and reach thousands of potential
//             adopters.
//           </p>
//           <Link
//             to="/register"
//             className="inline-block bg-white text-amber-700 font-semibold px-7 py-3 rounded-xl hover:bg-amber-50 transition-colors shadow-lg text-sm md:text-base"
//           >
//             List your puppies — it's free
//           </Link>
//         </motion.section>
//       </div>
//     </div>
//   );
// };

// export default Home;


import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../api/axios.js";

const SuccessStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/stories")
      .then((r) => setStories(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-10 mb-8"
      >
        <p className="text-5xl mb-3 animate-paw inline-block">🐾</p>
        <h1 className="font-display text-4xl mb-2">Happy tails</h1>
        <p className="text-ink/60 max-w-md mx-auto text-sm leading-relaxed">
          Every adoption is a new beginning. Here are some of the puppies who
          found their forever homes through PawHome.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-amber-100"
            >
              <div className="aspect-[4/3] skeleton" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-2/3 rounded-full" />
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-4/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 border-2 border-dashed border-amber-200 rounded-2xl"
        >
          <p className="text-5xl mb-4">🐶</p>
          <p className="text-ink/50 text-lg font-medium">
            No success stories yet.
          </p>
          <p className="text-ink/40 text-sm mt-1">
            The first one is just around the corner!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {stories.map((story, i) => (
            <StoryCard key={story._id} story={story} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

const StoryCard = ({ story, index }) => {
  const photo = story.storyPhoto || story.puppy?.photo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
    >
      {photo ? (
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={photo}
            alt={story.puppy?.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-amber-50 flex items-center justify-center text-5xl">
          🐾
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg">{story.puppy?.name}</h3>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Adopted ✓
          </span>
        </div>
        <p className="text-xs text-ink/50 mb-3">
          {story.puppy?.breed} · adopted by {story.adopter?.name}
        </p>

        <blockquote className="border-l-2 border-amber-400 pl-3 text-xs text-ink/70 italic leading-relaxed line-clamp-3">
          "{story.message}"
        </blockquote>

        <p className="text-xs text-ink/40 mt-3">
          {story.shelter?.orgName} ·{" "}
          {new Date(story.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default SuccessStories;

// import { useEffect, useState } from 'react';
// import api from '../api/axios.js';

// const SuccessStories = () => {
//   const [stories, setStories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     api.get('/stories')
//       .then((r) => setStories(r.data))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return (
//       <div className="text-center py-20 text-ink/50">Loading stories...</div>
//     );
//   }

//   return (
//     <div>
//       {/* Hero */}
//       <div className="text-center py-12 mb-10">
//         <p className="text-4xl mb-3">🐾</p>
//         <h1 className="font-display text-4xl mb-3">Happy tails</h1>
//         <p className="text-ink/60 max-w-lg mx-auto">
//           Every adoption is a new beginning. Here are some of the puppies who
//           found their forever homes through PawHome.
//         </p>
//       </div>

//       {stories.length === 0 ? (
//         <div className="text-center py-20 border-2 border-dashed border-amber-200 rounded-2xl">
//           <p className="text-5xl mb-4">🐶</p>
//           <p className="text-ink/50 text-lg">No success stories yet.</p>
//           <p className="text-ink/40 text-sm mt-1">
//             The first one is just around the corner!
//           </p>
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {stories.map((story) => (
//             <StoryCard key={story._id} story={story} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// const StoryCard = ({ story }) => {
//   const photo = story.storyPhoto || story.puppy?.photo;

//   return (
//     <div className="bg-white rounded-2xl overflow-hidden border border-amber-100 hover:shadow-md transition-shadow">

//       {/* Photo */}
//       {photo ? (
//         <div className="aspect-[4/3] overflow-hidden">
//           <img
//             src={photo}
//             alt={story.puppy?.name}
//             className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
//           />
//         </div>
//       ) : (
//         <div className="aspect-[4/3] bg-amber-50 flex items-center justify-center text-6xl">
//           🐾
//         </div>
//       )}

//       {/* Content */}
//       <div className="p-5">
//         <div className="flex items-center justify-between mb-1">
//           <h3 className="font-display text-xl">{story.puppy?.name}</h3>
//           <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
//             Adopted ✓
//           </span>
//         </div>
//         <p className="text-sm text-ink/50 mb-3">
//           {story.puppy?.breed} · adopted by {story.adopter?.name}
//         </p>

//         {/* Message in a quote style */}
//         <blockquote className="border-l-2 border-amber-400 pl-3 text-sm text-ink/70 italic leading-relaxed">
//           "{story.message}"
//         </blockquote>

//         <p className="text-xs text-ink/40 mt-4">
//           Shared by {story.shelter?.orgName} ·{' '}
//           {new Date(story.createdAt).toLocaleDateString('en-US', {
//             month: 'long',
//             year:  'numeric',
//           })}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default SuccessStories;

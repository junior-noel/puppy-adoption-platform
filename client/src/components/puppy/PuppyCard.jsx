import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const sizeLabel = { small: "Small", medium: "Medium", large: "Large" };
const genderIcon = { male: "♂", female: "♀" };

const PuppyCard = ({ puppy, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.05 }}
    whileHover={{ y: -4 }}
    className="group"
  >
    <Link
      to={`/puppies/${puppy._id}`}
      className="block bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Photo */}
      <div className="aspect-square overflow-hidden relative bg-amber-100">
        {puppy.photos?.[0] ? (
          <img
            src={puppy.photos[0]}
            alt={puppy.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🐶
          </div>
        )}

        {/* Status badge — only show non-available */}
        {puppy.status !== "available" && (
          <span
            className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
              puppy.status === "adopted"
                ? "bg-gray-800/80 text-white"
                : "bg-amber-500/90 text-white"
            }`}
          >
            {puppy.status === "adopted" ? "Adopted ✓" : "Pending"}
          </span>
        )}

        {/* Gender badge */}
        <span className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-xs font-bold px-1.5 py-0.5 rounded-full text-ink/70">
          {genderIcon[puppy.gender]}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <h3 className="font-display text-base leading-tight">{puppy.name}</h3>
          <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
            {puppy.age}mo
          </span>
        </div>
        <p className="text-xs text-ink/60 truncate">{puppy.breed}</p>
        <p className="text-xs text-ink/40 truncate mt-0.5">
          {puppy.shelter?.orgName}
        </p>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">
            {sizeLabel[puppy.size]}
          </span>
          {puppy.vaccinated && (
            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
              Vaccinated
            </span>
          )}
          {puppy.goodWithKids && (
            <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full">
              Kids ✓
            </span>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
);

export default PuppyCard;

// import { Link } from "react-router-dom";

// const PuppyCard = ({ puppy }) => (
//   <Link
//     to={`/puppies/${puppy._id}`}
//     className="group block overflow-hidden rounded-[1.25rem] border border-amber-200/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
//   >
//     <div className="relative aspect-[4/3] overflow-hidden bg-amber-100">
//       {puppy.photos?.[0] ? (
//         <img
//           src={puppy.photos[0]}
//           alt={puppy.name}
//           className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
//         />
//       ) : (
//         <div className="flex h-full items-center justify-center text-4xl">
//           🐶
//         </div>
//       )}
//       <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
//         {puppy.gender === "female" ? "She’s sweet" : "He’s playful"}
//       </span>
//     </div>
//     <div className="p-4 sm:p-5">
//       <div className="flex items-start justify-between gap-2">
//         <div>
//           <h3 className="font-display text-xl text-ink">{puppy.name}</h3>
//           <p className="mt-1 text-sm text-ink/70">
//             {puppy.breed} · {puppy.age}mo · {puppy.gender}
//           </p>
//         </div>
//         <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
//           {puppy.size || "Any size"}
//         </span>
//       </div>
//       <p className="mt-3 text-sm text-ink/60">{puppy.shelter?.orgName}</p>
//       <div className="mt-4 flex items-center justify-between text-sm font-medium text-amber-700">
//         <span>View profile</span>
//         <span className="transition group-hover:translate-x-1">→</span>
//       </div>
//     </div>
//   </Link>
// );

// export default PuppyCard;

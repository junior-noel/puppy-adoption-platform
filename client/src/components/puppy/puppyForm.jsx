import { useState, useRef } from "react";
import api from "../../api/axios.js";
import { useNavigate } from "react-router-dom";

const TEMPERAMENT_OPTIONS = [
  "Playful",
  "Calm",
  "Shy",
  "Energetic",
  "Gentle",
  "Brave",
  "Affectionate",
  "Independent",
  "Loyal",
  "Curious",
];

const defaultForm = {
  name: "",
  breed: "",
  age: "",
  gender: "",
  size: "",
  description: "",
  medicalHistory: "",
  vaccinated: false,
  neutered: false,
  goodWithKids: false,
  goodWithOtherPets: false,
  temperamentTags: [],
};

const PuppyForm = ({ puppy, onSuccess }) => {
  const navigate = useNavigate();
  const isEdit = Boolean(puppy);
  const fileInput = useRef(null);

  const [form, setForm] = useState(
    puppy
      ? {
          name: puppy.name,
          breed: puppy.breed,
          age: puppy.age,
          gender: puppy.gender,
          size: puppy.size,
          description: puppy.description || "",
          medicalHistory: puppy.medicalHistory || "",
          vaccinated: puppy.vaccinated,
          neutered: puppy.neutered,
          goodWithKids: puppy.goodWithKids,
          goodWithOtherPets: puppy.goodWithOtherPets,
          temperamentTags: puppy.temperamentTags || [],
        }
      : { ...defaultForm },
  );

  const [existingPhotos, setExistingPhotos] = useState(puppy?.photos || []);
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));
  const toggle = (field) => () =>
    setForm((f) => ({ ...f, [field]: !f[field] }));

  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      temperamentTags: f.temperamentTags.includes(tag)
        ? f.temperamentTags.filter((t) => t !== tag)
        : [...f.temperamentTags, tag],
    }));

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const totalSlots = 6 - existingPhotos.length;
    const allowed = selected.slice(0, totalSlots);
    setNewFiles(allowed);
    previews.forEach((url) => URL.revokeObjectURL(url));
    setPreviews(allowed.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const removeExisting = (url) =>
    setExistingPhotos((prev) => prev.filter((u) => u !== url));

  const removeNew = (index) => {
    URL.revokeObjectURL(previews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadNewPhotos = async () => {
    if (newFiles.length === 0) return [];
    const formData = new FormData();
    newFiles.forEach((f) => formData.append("photos", f));
    const { data } = await api.post("/upload/puppies", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      setUploading(true);
      const freshUrls = await uploadNewPhotos();
      setUploading(false);

      const photos = [...existingPhotos, ...freshUrls];
      const payload = { ...form, age: Number(form.age), photos };

      if (isEdit) {
        await api.put(`/puppies/${puppy._id}`, payload);
      } else {
        await api.post("/puppies", payload);
      }

      if (onSuccess) onSuccess();
      else navigate("/dashboard/shelter");
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const totalPhotos = existingPhotos.length + newFiles.length;
  const canAddMore = totalPhotos < 6;
  const isSubmitting = loading || uploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Photos ───────────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Photos{" "}
          <span className="text-ink/40 font-normal">({totalPhotos}/6)</span>
        </label>

        <div className="flex flex-wrap gap-3">
          {/* Existing Cloudinary photos (edit mode) */}
          {existingPhotos.map((url) => (
            <div
              key={url}
              className="relative w-24 h-24 rounded-lg overflow-hidden group"
            >
              <img
                src={url}
                alt="puppy"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeExisting(url)}
                className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                Remove
              </button>
            </div>
          ))}

          {/* Local previews (not yet uploaded) */}
          {previews.map((src, i) => (
            <div
              key={src}
              className="relative w-24 h-24 rounded-lg overflow-hidden group"
            >
              <img
                src={src}
                alt="preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeNew(i)}
                className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add photo button */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInput.current.click()}
              className="w-24 h-24 rounded-lg border-2 border-dashed border-amber-300 flex flex-col items-center justify-center text-ink/40 hover:border-amber-500 hover:text-ink/60 transition-colors"
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-xs mt-1">Add photo</span>
            </button>
          )}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-ink/40 mt-2">
          Up to 6 photos · JPG, PNG, or WebP · Max 5 MB each
        </p>
      </div>

      {/* ── Basic info ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium mb-1">Puppy name *</label>
          <input
            required
            placeholder="e.g. Biscuit"
            className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={form.name}
            onChange={set("name")}
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium mb-1">Breed *</label>
          <input
            required
            placeholder="e.g. Labrador Mix"
            className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={form.breed}
            onChange={set("breed")}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Age (months) *
          </label>
          <input
            required
            type="number"
            min="1"
            placeholder="e.g. 4"
            className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
            value={form.age}
            onChange={set("age")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender *</label>
          <select
            required
            className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            value={form.gender}
            onChange={set("gender")}
          >
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Size *</label>
          <select
            required
            className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            value={form.size}
            onChange={set("size")}
          >
            <option value="">Select</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      {/* ── Description ──────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          rows={4}
          placeholder="Personality, background, what makes this puppy special..."
          className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={form.description}
          onChange={set("description")}
        />
      </div>

      {/* ── Medical ──────────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Medical history
        </label>
        <textarea
          rows={2}
          placeholder="Any known conditions, treatments, vet notes..."
          className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={form.medicalHistory}
          onChange={set("medicalHistory")}
        />
      </div>

      {/* ── Health & compatibility ───────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Health & compatibility
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["vaccinated", "Vaccinated"],
            ["neutered", "Neutered / Spayed"],
            ["goodWithKids", "Good with kids"],
            ["goodWithOtherPets", "Good with other pets"],
          ].map(([field, label]) => (
            <label
              key={field}
              className="flex items-center gap-2 text-sm cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={form[field]}
                onChange={toggle(field)}
                className="w-4 h-4 accent-amber-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* ── Temperament tags ─────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Temperament tags
        </label>
        <div className="flex flex-wrap gap-2">
          {TEMPERAMENT_OPTIONS.map((tag) => {
            const active = form.temperamentTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "bg-amber-600 text-white border-amber-600"
                    : "border-amber-200 text-ink/70 hover:border-amber-400"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* ── Submit ───────────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
        >
          {uploading
            ? `Uploading ${newFiles.length} photo${newFiles.length > 1 ? "s" : ""}…`
            : loading
              ? "Saving…"
              : isEdit
                ? "Save changes"
                : "Add puppy"}
        </button>
        {onSuccess && (
          <button
            type="button"
            onClick={onSuccess}
            disabled={isSubmitting}
            className="px-5 border border-amber-200 rounded-lg text-sm text-ink/70 hover:bg-amber-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default PuppyForm;
// import { useState } from "react";
// import api from "../../api/axios.js";
// import { useNavigate } from "react-router-dom";

// const TEMPERAMENT_OPTIONS = [
//   "Playful",
//   "Calm",
//   "Shy",
//   "Energetic",
//   "Gentle",
//   "Brave",
//   "Affectionate",
//   "Independent",
//   "Loyal",
//   "Curious",
// ];

// const defaultForm = {
//   name: "",
//   breed: "",
//   age: "",
//   gender: "",
//   size: "",
//   description: "",
//   medicalHistory: "",
//   vaccinated: false,
//   neutered: false,
//   goodWithKids: false,
//   goodWithOtherPets: false,
//   temperamentTags: [],
// };

// // Reusable for both create and edit.
// // Pass `puppy` prop to pre-fill for editing; omit for create mode.
// const PuppyForm = ({ puppy, onSuccess }) => {
//   const navigate = useNavigate();
//   const isEdit = Boolean(puppy);

//   const [form, setForm] = useState(
//     puppy
//       ? {
//           name: puppy.name,
//           breed: puppy.breed,
//           age: puppy.age,
//           gender: puppy.gender,
//           size: puppy.size,
//           description: puppy.description || "",
//           medicalHistory: puppy.medicalHistory || "",
//           vaccinated: puppy.vaccinated,
//           neutered: puppy.neutered,
//           goodWithKids: puppy.goodWithKids,
//           goodWithOtherPets: puppy.goodWithOtherPets,
//           temperamentTags: puppy.temperamentTags || [],
//         }
//       : { ...defaultForm },
//   );

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const set = (field) => (e) =>
//     setForm((f) => ({ ...f, [field]: e.target.value }));
//   const toggle = (field) => () =>
//     setForm((f) => ({ ...f, [field]: !f[field] }));

//   const toggleTag = (tag) => {
//     setForm((f) => ({
//       ...f,
//       temperamentTags: f.temperamentTags.includes(tag)
//         ? f.temperamentTags.filter((t) => t !== tag)
//         : [...f.temperamentTags, tag],
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       if (isEdit) {
//         await api.put(`/puppies/${puppy._id}`, form);
//       } else {
//         await api.post("/puppies", { ...form, age: Number(form.age) });
//       }
//       if (onSuccess) onSuccess();
//       else navigate("/dashboard/shelter");
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5">
//       {/* Basic info */}
//       <div className="grid grid-cols-2 gap-4">
//         <div className="col-span-2 sm:col-span-1">
//           <label className="block text-sm font-medium mb-1">Puppy name *</label>
//           <input
//             required
//             placeholder="e.g. Biscuit"
//             className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
//             value={form.name}
//             onChange={set("name")}
//           />
//         </div>
//         <div className="col-span-2 sm:col-span-1">
//           <label className="block text-sm font-medium mb-1">Breed *</label>
//           <input
//             required
//             placeholder="e.g. Labrador Mix"
//             className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
//             value={form.breed}
//             onChange={set("breed")}
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-3 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Age (months) *
//           </label>
//           <input
//             required
//             type="number"
//             min="1"
//             placeholder="e.g. 4"
//             className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
//             value={form.age}
//             onChange={set("age")}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Gender *</label>
//           <select
//             required
//             className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
//             value={form.gender}
//             onChange={set("gender")}
//           >
//             <option value="">Select</option>
//             <option value="male">Male</option>
//             <option value="female">Female</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">Size *</label>
//           <select
//             required
//             className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
//             value={form.size}
//             onChange={set("size")}
//           >
//             <option value="">Select</option>
//             <option value="small">Small</option>
//             <option value="medium">Medium</option>
//             <option value="large">Large</option>
//           </select>
//         </div>
//       </div>

//       {/* Description */}
//       <div>
//         <label className="block text-sm font-medium mb-1">Description</label>
//         <textarea
//           rows={4}
//           placeholder="Personality, background, what makes this puppy special..."
//           className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
//           value={form.description}
//           onChange={set("description")}
//         />
//       </div>

//       {/* Medical */}
//       <div>
//         <label className="block text-sm font-medium mb-1">
//           Medical history
//         </label>
//         <textarea
//           rows={2}
//           placeholder="Any known conditions, treatments, vet notes..."
//           className="w-full border border-amber-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
//           value={form.medicalHistory}
//           onChange={set("medicalHistory")}
//         />
//       </div>

//       {/* Checkboxes */}
//       <div>
//         <label className="block text-sm font-medium mb-2">
//           Health & compatibility
//         </label>
//         <div className="grid grid-cols-2 gap-2">
//           {[
//             ["vaccinated", "Vaccinated"],
//             ["neutered", "Neutered / Spayed"],
//             ["goodWithKids", "Good with kids"],
//             ["goodWithOtherPets", "Good with other pets"],
//           ].map(([field, label]) => (
//             <label
//               key={field}
//               className="flex items-center gap-2 text-sm cursor-pointer select-none"
//             >
//               <input
//                 type="checkbox"
//                 checked={form[field]}
//                 onChange={toggle(field)}
//                 className="w-4 h-4 accent-amber-600"
//               />
//               {label}
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Temperament tags */}
//       <div>
//         <label className="block text-sm font-medium mb-2">
//           Temperament tags
//         </label>
//         <div className="flex flex-wrap gap-2">
//           {TEMPERAMENT_OPTIONS.map((tag) => {
//             const active = form.temperamentTags.includes(tag);
//             return (
//               <button
//                 key={tag}
//                 type="button"
//                 onClick={() => toggleTag(tag)}
//                 className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
//                   active
//                     ? "bg-amber-600 text-white border-amber-600"
//                     : "border-amber-200 text-ink/70 hover:border-amber-400"
//                 }`}
//               >
//                 {tag}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {error && (
//         <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
//           {error}
//         </p>
//       )}

//       <div className="flex gap-3 pt-2">
//         <button
//           type="submit"
//           disabled={loading}
//           className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium transition-colors"
//         >
//           {loading ? "Saving…" : isEdit ? "Save changes" : "Add puppy"}
//         </button>
//         {onSuccess && (
//           <button
//             type="button"
//             onClick={onSuccess}
//             className="px-5 border border-amber-200 rounded-lg text-sm text-ink/70 hover:bg-amber-50 transition-colors"
//           >
//             Cancel
//           </button>
//         )}
//       </div>
//     </form>
//   );
// };

// export default PuppyForm;

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import PuppyForm from '../../components/puppy/PuppyForm.jsx';
import MarkAdoptedModal from '../../components/shelter/MarkAdoptedModal.jsx';

const statusColor = {
  pending:    'bg-amber-100 text-amber-700',
  approved:   'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-700',
  waitlisted: 'bg-gray-100 text-gray-600',
};

const puppyStatusColor = {
  available: 'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  adopted:   'bg-gray-100 text-gray-500',
};

const ShelterDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [puppies,        setPuppies]        = useState([]);
  const [applications,   setApplications]   = useState([]);
  const [conversations,  setConversations]  = useState([]);
  const [tab,            setTab]            = useState('listings');
  const [showForm,       setShowForm]       = useState(false);
  const [editingPuppy,   setEditingPuppy]   = useState(null);
  const [adoptingPuppy,  setAdoptingPuppy]  = useState(null); // puppy to mark as adopted

  const fetchData = () => {
    api.get('/puppies/mine').then((r)         => setPuppies(r.data));
    api.get('/applications/shelter').then((r)  => setApplications(r.data));
    api.get('/chat/conversations').then((r)    => setConversations(r.data));
  };

  useEffect(() => { fetchData(); }, []);

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPuppy(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this listing?')) return;
    await api.delete(`/puppies/${id}`);
    setPuppies((prev) => prev.filter((p) => p._id !== id));
  };

  const handleStatus = async (id, status) => {
    await api.put(`/applications/${id}/status`, { status });
    setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
  };

  if (!user?.shelter) {
    return (
      <div className="text-center py-20">
        <p className="text-ink/60 mb-4">You need to set up your shelter profile first.</p>
        <Link to="/shelter/setup" className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium">
          Set up shelter profile
        </Link>
      </div>
    );
  }

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div>
      {/* Mark adopted modal */}
      {adoptingPuppy && (
        <MarkAdoptedModal
          puppy={adoptingPuppy}
          onClose={() => setAdoptingPuppy(null)}
          onSuccess={fetchData}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Shelter dashboard</h1>
        {tab === 'listings' && !showForm && !editingPuppy && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            + Add puppy
          </button>
        )}
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="mb-8 border border-amber-200 rounded-xl p-6 bg-white">
          <h2 className="font-display text-xl mb-5">New listing</h2>
          <PuppyForm onSuccess={handleFormSuccess} />
        </div>
      )}

      {/* Inline edit form */}
      {editingPuppy && (
        <div className="mb-8 border border-amber-200 rounded-xl p-6 bg-white">
          <h2 className="font-display text-xl mb-5">Edit — {editingPuppy.name}</h2>
          <PuppyForm puppy={editingPuppy} onSuccess={handleFormSuccess} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-amber-100">
        {['listings', 'applications', 'messages'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowForm(false); setEditingPuppy(null); }}
            className={`pb-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-amber-600 text-amber-700'
                : 'text-ink/50 hover:text-ink/80'
            }`}
          >
            {t}
            {t === 'applications' && pendingCount > 0 && (
              <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">
                {pendingCount}
              </span>
            )}
            {t === 'messages' && conversations.length > 0 && (
              <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">
                {conversations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Listings tab ─────────────────────────────────────────────────── */}
      {tab === 'listings' && (
        <>
          {puppies.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-amber-200 rounded-xl">
              <p className="text-ink/50 mb-4">No listings yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                Add your first puppy
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {puppies.map((p) => (
                <div key={p._id} className="border border-amber-100 rounded-xl p-4 bg-white">
                  {p.photos?.[0] ? (
                    <img src={p.photos[0]} alt={p.name} className="w-full h-36 object-cover rounded-lg mb-3" />
                  ) : (
                    <div className="w-full h-36 bg-amber-50 rounded-lg mb-3 flex items-center justify-center text-ink/30 text-sm">
                      No photo yet
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium">{p.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${puppyStatusColor[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-ink/60 mb-3">
                    {p.breed} · {p.age}mo · {p.gender} · {p.size}
                  </p>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingPuppy(p); setShowForm(false); window.scrollTo(0, 0); }}
                        className="flex-1 text-xs border border-amber-200 rounded-lg py-1.5 hover:bg-amber-50 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="flex-1 text-xs border border-red-200 text-red-600 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Mark as adopted — only show for available or pending puppies */}
                    {p.status !== 'adopted' && (
                      <button
                        onClick={() => setAdoptingPuppy(p)}
                        className="w-full text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg py-1.5 hover:bg-green-100 transition-colors"
                      >
                        🎉 Mark as adopted
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Applications tab ─────────────────────────────────────────────── */}
      {tab === 'applications' && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <p className="text-ink/60 py-10 text-center">No applications received yet.</p>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="border border-amber-100 rounded-xl p-4 bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{app.puppy?.name}</p>
                    <p className="text-sm text-ink/60">
                      {app.adopter?.name} · {app.adopter?.email}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${statusColor[app.status]}`}>
                    {app.status}
                  </span>
                </div>

                {app.formData?.reasonForAdopting && (
                  <p className="text-sm text-ink/70 bg-amber-50 rounded-lg px-3 py-2 mb-3 italic">
                    "{app.formData.reasonForAdopting}"
                  </p>
                )}

                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatus(app._id, 'approved')}
                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatus(app._id, 'rejected')}
                      className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatus(app._id, 'waitlisted')}
                      className="text-xs border border-amber-200 text-ink/70 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      Waitlist
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Messages tab ─────────────────────────────────────────────────── */}
      {tab === 'messages' && (
        <div className="space-y-3">
          {conversations.length === 0 ? (
            <p className="text-ink/60 py-10 text-center">No messages yet.</p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => navigate(`/chat/${conv._id}`)}
                className="border border-amber-100 rounded-xl p-4 bg-white hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {conv.puppy?.photos?.[0] ? (
                    <img
                      src={conv.puppy.photos[0]}
                      alt={conv.puppy.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-xl">
                      🐶
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{conv.puppy?.name ?? 'Puppy'}</p>
                    <p className="text-sm text-ink/50">
                      {conv.participants?.length} participant{conv.participants?.length !== 1 ? 's' : ''} ·{' '}
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-amber-600 text-sm font-medium">Open →</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ShelterDashboard;


// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "../../api/axios.js";
// import { useAuth } from "../../context/AuthContext.jsx";
// import PuppyForm from "../../components/puppy/PuppyForm.jsx";

// const statusColor = {
//   pending: "bg-amber-100 text-amber-700",
//   approved: "bg-green-100 text-green-700",
//   rejected: "bg-red-100 text-red-700",
//   waitlisted: "bg-gray-100 text-gray-600",
// };

// const puppyStatusColor = {
//   available: "bg-green-100 text-green-700",
//   pending: "bg-amber-100 text-amber-700",
//   adopted: "bg-gray-100 text-gray-500",
// };

// const ShelterDashboard = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [puppies, setPuppies] = useState([]);
//   const [applications, setApplications] = useState([]);
//   const [conversations, setConversations] = useState([]);
//   const [tab, setTab] = useState("listings");
//   const [showForm, setShowForm] = useState(false);
//   const [editingPuppy, setEditingPuppy] = useState(null);

//   const fetchData = () => {
//     api.get("/puppies/mine").then((r) => setPuppies(r.data));
//     api.get("/applications/shelter").then((r) => setApplications(r.data));
//     api.get("/chat/conversations").then((r) => setConversations(r.data));
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleFormSuccess = () => {
//     setShowForm(false);
//     setEditingPuppy(null);
//     fetchData();
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Remove this listing?")) return;
//     await api.delete(`/puppies/${id}`);
//     setPuppies((prev) => prev.filter((p) => p._id !== id));
//   };

//   const handleStatus = async (id, status) => {
//     await api.put(`/applications/${id}/status`, { status });
//     setApplications((prev) =>
//       prev.map((a) => (a._id === id ? { ...a, status } : a)),
//     );
//   };

//   if (!user?.shelter) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-ink/60 mb-4">
//           You need to set up your shelter profile first.
//         </p>
//         <Link
//           to="/shelter/setup"
//           className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium"
//         >
//           Set up shelter profile
//         </Link>
//       </div>
//     );
//   }

//   const pendingCount = applications.filter(
//     (a) => a.status === "pending",
//   ).length;

//   return (
//     <div>
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="font-display text-3xl">Shelter dashboard</h1>
//         {tab === "listings" && !showForm && !editingPuppy && (
//           <button
//             onClick={() => setShowForm(true)}
//             className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
//           >
//             + Add puppy
//           </button>
//         )}
//       </div>

//       {/* Inline create form */}
//       {showForm && (
//         <div className="mb-8 border border-amber-200 rounded-xl p-6 bg-white">
//           <h2 className="font-display text-xl mb-5">New listing</h2>
//           <PuppyForm onSuccess={handleFormSuccess} />
//         </div>
//       )}

//       {/* Inline edit form */}
//       {editingPuppy && (
//         <div className="mb-8 border border-amber-200 rounded-xl p-6 bg-white">
//           <h2 className="font-display text-xl mb-5">
//             Edit — {editingPuppy.name}
//           </h2>
//           <PuppyForm puppy={editingPuppy} onSuccess={handleFormSuccess} />
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="flex gap-6 mb-6 border-b border-amber-100">
//         {["listings", "applications", "messages"].map((t) => (
//           <button
//             key={t}
//             onClick={() => {
//               setTab(t);
//               setShowForm(false);
//               setEditingPuppy(null);
//             }}
//             className={`pb-2 text-sm font-medium capitalize transition-colors ${
//               tab === t
//                 ? "border-b-2 border-amber-600 text-amber-700"
//                 : "text-ink/50 hover:text-ink/80"
//             }`}
//           >
//             {t}
//             {t === "applications" && pendingCount > 0 && (
//               <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">
//                 {pendingCount}
//               </span>
//             )}
//             {t === "messages" && conversations.length > 0 && (
//               <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">
//                 {conversations.length}
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* ── Listings tab ─────────────────────────────────────────────────── */}
//       {tab === "listings" && (
//         <>
//           {puppies.length === 0 ? (
//             <div className="text-center py-16 border-2 border-dashed border-amber-200 rounded-xl">
//               <p className="text-ink/50 mb-4">No listings yet.</p>
//               <button
//                 onClick={() => setShowForm(true)}
//                 className="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
//               >
//                 Add your first puppy
//               </button>
//             </div>
//           ) : (
//             <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
//               {puppies.map((p) => (
//                 <div
//                   key={p._id}
//                   className="border border-amber-100 rounded-xl p-4 bg-white"
//                 >
//                   {p.photos?.[0] ? (
//                     <img
//                       src={p.photos[0]}
//                       alt={p.name}
//                       className="w-full h-36 object-cover rounded-lg mb-3"
//                     />
//                   ) : (
//                     <div className="w-full h-36 bg-amber-50 rounded-lg mb-3 flex items-center justify-center text-ink/30 text-sm">
//                       No photo yet
//                     </div>
//                   )}
//                   <div className="flex justify-between items-start mb-1">
//                     <p className="font-medium">{p.name}</p>
//                     <span
//                       className={`text-xs px-2 py-0.5 rounded-full ${puppyStatusColor[p.status]}`}
//                     >
//                       {p.status}
//                     </span>
//                   </div>
//                   <p className="text-sm text-ink/60 mb-3">
//                     {p.breed} · {p.age}mo · {p.gender} · {p.size}
//                   </p>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => {
//                         setEditingPuppy(p);
//                         setShowForm(false);
//                         window.scrollTo(0, 0);
//                       }}
//                       className="flex-1 text-xs border border-amber-200 rounded-lg py-1.5 hover:bg-amber-50 transition-colors"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(p._id)}
//                       className="flex-1 text-xs border border-red-200 text-red-600 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {/* ── Applications tab ─────────────────────────────────────────────── */}
//       {tab === "applications" && (
//         <div className="space-y-3">
//           {applications.length === 0 ? (
//             <p className="text-ink/60 py-10 text-center">
//               No applications received yet.
//             </p>
//           ) : (
//             applications.map((app) => (
//               <div
//                 key={app._id}
//                 className="border border-amber-100 rounded-xl p-4 bg-white"
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <div>
//                     <p className="font-medium">{app.puppy?.name}</p>
//                     <p className="text-sm text-ink/60">
//                       {app.adopter?.name} · {app.adopter?.email}
//                     </p>
//                   </div>
//                   <span
//                     className={`text-xs px-3 py-1 rounded-full ${statusColor[app.status]}`}
//                   >
//                     {app.status}
//                   </span>
//                 </div>

//                 {app.formData?.reasonForAdopting && (
//                   <p className="text-sm text-ink/70 bg-amber-50 rounded-lg px-3 py-2 mb-3 italic">
//                     "{app.formData.reasonForAdopting}"
//                   </p>
//                 )}

//                 {app.status === "pending" && (
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleStatus(app._id, "approved")}
//                       className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors"
//                     >
//                       Approve
//                     </button>
//                     <button
//                       onClick={() => handleStatus(app._id, "rejected")}
//                       className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors"
//                     >
//                       Reject
//                     </button>
//                     <button
//                       onClick={() => handleStatus(app._id, "waitlisted")}
//                       className="text-xs border border-amber-200 text-ink/70 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
//                     >
//                       Waitlist
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       {/* ── Messages tab ─────────────────────────────────────────────────── */}
//       {tab === "messages" && (
//         <div className="space-y-3">
//           {conversations.length === 0 ? (
//             <p className="text-ink/60 py-10 text-center">No messages yet.</p>
//           ) : (
//             conversations.map((conv) => (
//               <div
//                 key={conv._id}
//                 onClick={() => navigate(`/chat/${conv._id}`)}
//                 className="border border-amber-100 rounded-xl p-4 bg-white hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
//               >
//                 <div className="flex items-center gap-4">
//                   {/* Puppy thumbnail */}
//                   {conv.puppy?.photos?.[0] ? (
//                     <img
//                       src={conv.puppy.photos[0]}
//                       alt={conv.puppy.name}
//                       className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
//                     />
//                   ) : (
//                     <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-xl">
//                       🐶
//                     </div>
//                   )}
//                   <div>
//                     <p className="font-medium">{conv.puppy?.name ?? "Puppy"}</p>
//                     <p className="text-sm text-ink/50">
//                       {conv.participants?.length} participant
//                       {conv.participants?.length !== 1 ? "s" : ""} ·{" "}
//                       {new Date(conv.lastMessageAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//                 <span className="text-amber-600 text-sm font-medium">
//                   Open →
//                 </span>
//               </div>
//             ))
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShelterDashboard;

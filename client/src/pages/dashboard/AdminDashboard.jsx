import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios.js';

// ── Reusable confirm-then-delete helper ───────────────────────────────────
const confirmDelete = (label) =>
  window.confirm(`Remove ${label}? This cannot be undone.`);

// ── Stat card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = 'amber', index = 0 }) => {
  const colors = {
    amber:  'bg-amber-50  text-amber-700',
    green:  'bg-green-50  text-green-700',
    blue:   'bg-blue-50   text-blue-700',
    red:    'bg-red-50    text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="font-display text-2xl">{value ?? '—'}</p>
      <p className="text-xs text-ink/50 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-amber-600 font-medium mt-1">{sub}</p>}
    </motion.div>
  );
};

// ── Role badge colours ────────────────────────────────────────────────────
const roleBadge = {
  admin:   'bg-purple-100 text-purple-700',
  shelter: 'bg-blue-100   text-blue-700',
  adopter: 'bg-green-100  text-green-700',
};

const puppyStatusColor = {
  available: 'bg-green-100 text-green-700',
  pending:   'bg-amber-100 text-amber-700',
  adopted:   'bg-gray-100  text-gray-500',
};

// ── Delete button ─────────────────────────────────────────────────────────
const DeleteBtn = ({ onClick, label = 'Delete', small = false }) => (
  <button
    onClick={onClick}
    className={`border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors ${
      small ? 'text-xs px-3 py-1.5' : 'text-xs px-3 py-1.5 w-full'
    }`}
  >
    🗑 {label}
  </button>
);

// ═════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const [tab,      setTab]      = useState('overview');
  const [stats,    setStats]    = useState(null);
  const [shelters, setShelters] = useState([]);
  const [puppies,  setPuppies]  = useState([]);
  const [users,    setUsers]    = useState([]);
  const [stories,  setStories]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/shelters'),
      api.get('/admin/puppies'),
      api.get('/admin/users'),
      api.get('/admin/stories'),
    ]).then(([s, sh, p, u, st]) => {
      setStats(s.data);
      setShelters(sh.data);
      setPuppies(p.data);
      setUsers(u.data);
      setStories(st.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Actions ─────────────────────────────────────────────────────────────
  const handleVerify = async (id) => {
    await api.put(`/shelters/${id}/verify`);
    setShelters((prev) => prev.map((s) => s._id === id ? { ...s, verified: true } : s));
    setStats((prev) => prev && {
      ...prev,
      shelters: { ...prev.shelters, pending: Math.max(0, prev.shelters.pending - 1) },
    });
  };

  const handleDeleteShelter = async (id, name) => {
    if (!confirmDelete(`shelter "${name}" and all its listings`)) return;
    await api.delete(`/admin/shelters/${id}`);
    setShelters((prev) => prev.filter((s) => s._id !== id));
    fetchAll(); // refresh stats
  };

  const handleDeletePuppy = async (id, name) => {
    if (!confirmDelete(`listing "${name}"`)) return;
    await api.delete(`/admin/puppies/${id}`);
    setPuppies((prev) => prev.filter((p) => p._id !== id));
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirmDelete(`user "${name}" and all their data`)) return;
    await api.delete(`/admin/users/${id}`);
    setUsers((prev) => prev.filter((u) => u._id !== id));
    fetchAll();
  };

  const handleDeleteStory = async (id, name) => {
    if (!confirmDelete(`success story for "${name}"`)) return;
    await api.delete(`/admin/stories/${id}`);
    setStories((prev) => prev.filter((s) => s._id !== id));
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 skeleton rounded-xl mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-amber-100 p-4 h-24 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  const pendingShelters = shelters.filter((s) => !s.verified);

  const TABS = [
    { key: 'overview',  label: 'Overview'  },
    { key: 'shelters',  label: 'Shelters',  badge: pendingShelters.length },
    { key: 'puppies',   label: 'Puppies'   },
    { key: 'users',     label: 'Users'     },
    { key: 'stories',   label: 'Happy tails' },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-3xl mb-1">Admin dashboard</h1>
        <p className="text-ink/50 text-sm">Platform overview and moderation tools</p>
      </motion.div>

      {/* ── Stat cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard icon="👥" label="Total users"   value={stats.users.total}           sub={`${stats.users.adopters} adopters`}                                                          color="blue"   index={0} />
        <StatCard icon="🏥" label="Shelters"      value={stats.shelters.total}        sub={stats.shelters.pending > 0 ? `${stats.shelters.pending} need verification` : 'All verified'} color={stats.shelters.pending > 0 ? 'red' : 'green'} index={1} />
        <StatCard icon="🐶" label="Puppies"       value={stats.puppies.total}         sub={`${stats.puppies.available} available`}                                                      color="amber"  index={2} />
        <StatCard icon="📋" label="Applications"  value={stats.applications.total}    sub={`${stats.applications.pending} pending`}                                                     color="purple" index={3} />
        <StatCard icon="🎉" label="Adoptions"     value={stats.puppies.adopted}       sub={`${stats.stories.total} stories`}                                                           color="green"  index={4} />
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex gap-4 mb-6 border-b border-amber-100 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-2 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              tab === t.key
                ? 'border-b-2 border-amber-600 text-amber-700'
                : 'text-ink/50 hover:text-ink/80'
            }`}
          >
            {t.label}
            {t.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Overview ───────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Pending verification banner */}
          {pendingShelters.length > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="font-medium mb-1">
                ⚠️ {pendingShelters.length} shelter{pendingShelters.length > 1 ? 's' : ''} awaiting verification
              </p>
              <p className="text-sm text-ink/60 mb-3">
                Shelters cannot list puppies until verified.
              </p>
              <button
                onClick={() => setTab('shelters')}
                className="text-sm bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Review now
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="font-medium text-green-700">✓ All shelters are verified</p>
              <p className="text-sm text-ink/60 mt-1">No pending moderation actions.</p>
            </div>
          )}

          {/* Mini charts */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-amber-100 p-5">
              <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-3">
                Puppy status
              </p>
              <div className="space-y-2">
                {[
                  ['Available', stats.puppies.available,                                  'bg-green-500'],
                  ['Pending',   stats.puppies.total - stats.puppies.available - stats.puppies.adopted, 'bg-amber-400'],
                  ['Adopted',   stats.puppies.adopted,                                    'bg-gray-400'],
                ].map(([label, val, color]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                    <span className="text-sm text-ink/70 flex-1">{label}</span>
                    <span className="text-sm font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-amber-100 p-5">
              <p className="text-xs font-semibold text-ink/40 uppercase tracking-wide mb-3">
                User breakdown
              </p>
              <div className="space-y-2">
                {[
                  ['Adopters', stats.users.adopters,   'bg-green-500'],
                  ['Shelters', stats.shelters.total,   'bg-blue-500'],
                ].map(([label, val, color]) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color}`} />
                    <span className="text-sm text-ink/70 flex-1">{label}</span>
                    <span className="text-sm font-medium">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Shelters ───────────────────────────────────────────────────── */}
      {tab === 'shelters' && (
        <div className="space-y-3">
          {shelters.length === 0 ? (
            <p className="text-ink/60 py-10 text-center">No shelters registered yet.</p>
          ) : (
            shelters
              .slice()
              .sort((a, b) => Number(a.verified) - Number(b.verified))
              .map((s) => (
                <div key={s._id} className="border border-amber-100 rounded-xl p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">{s.orgName}</p>
                      <p className="text-sm text-ink/60">{s.address || 'No address'}</p>
                      <p className="text-xs text-ink/40 mt-0.5">
                        Owner: {s.owner?.name} · {s.owner?.email}
                      </p>
                    </div>
                    {s.verified ? (
                      <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium flex-shrink-0">
                        Verified ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => handleVerify(s._id)}
                        className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors flex-shrink-0"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  <DeleteBtn
                    onClick={() => handleDeleteShelter(s._id, s.orgName)}
                    label="Delete shelter & all listings"
                  />
                </div>
              ))
          )}
        </div>
      )}

      {/* ── Puppies ────────────────────────────────────────────────────── */}
      {tab === 'puppies' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {puppies.length === 0 ? (
            <p className="text-ink/60 py-10 text-center col-span-full">No puppies listed yet.</p>
          ) : (
            puppies.map((p) => (
              <div key={p._id} className="border border-amber-100 rounded-xl p-4 bg-white">
                {p.photos?.[0] ? (
                  <img src={p.photos[0]} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                ) : (
                  <div className="w-full h-32 bg-amber-50 rounded-lg mb-3 flex items-center justify-center text-2xl">🐶</div>
                )}
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-sm">{p.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${puppyStatusColor[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-ink/50 mb-0.5">{p.breed}</p>
                <p className="text-xs text-ink/40 mb-3">
                  {p.shelter?.orgName}
                  {!p.shelter?.verified && (
                    <span className="text-red-400 ml-1">(unverified)</span>
                  )}
                </p>
                <DeleteBtn
                  onClick={() => handleDeletePuppy(p._id, p.name)}
                  label="Remove listing"
                />
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Users ──────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden">
          {users.length === 0 ? (
            <p className="text-ink/60 py-10 text-center">No users yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-amber-50 hover:bg-amber-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-ink/60 hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${roleBadge[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink/40 hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== 'admin' && (
                        <DeleteBtn
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          label="Delete"
                          small
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Happy tails (stories) ──────────────────────────────────────── */}
      {tab === 'stories' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stories.length === 0 ? (
            <p className="text-ink/60 py-10 text-center col-span-full">No stories yet.</p>
          ) : (
            stories.map((s) => (
              <div key={s._id} className="border border-amber-100 rounded-xl p-4 bg-white">
                {(s.storyPhoto || s.puppy?.photo) ? (
                  <img
                    src={s.storyPhoto || s.puppy.photo}
                    alt={s.puppy?.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                ) : (
                  <div className="w-full h-32 bg-amber-50 rounded-lg mb-3 flex items-center justify-center text-2xl">
                    🐾
                  </div>
                )}
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{s.puppy?.name}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Adopted ✓
                  </span>
                </div>
                <p className="text-xs text-ink/50 mb-1">{s.puppy?.breed}</p>
                <p className="text-xs text-ink/40 mb-2 italic line-clamp-2">"{s.message}"</p>
                <p className="text-xs text-ink/40 mb-3">
                  {s.shelter?.orgName} · {new Date(s.createdAt).toLocaleDateString()}
                </p>
                <DeleteBtn
                  onClick={() => handleDeleteStory(s._id, s.puppy?.name)}
                  label="Remove story"
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;



// import { useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import api from '../../api/axios.js';

// const StatCard = ({ icon, label, value, sub, color = 'amber', index = 0 }) => {
//   const colors = {
//     amber: 'bg-amber-50 text-amber-700',
//     green: 'bg-green-50 text-green-700',
//     blue:  'bg-blue-50  text-blue-700',
//     red:   'bg-red-50   text-red-700',
//   };
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 16 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.35, delay: index * 0.05 }}
//       className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm"
//     >
//       <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg mb-3 ${colors[color]}`}>
//         {icon}
//       </div>
//       <p className="font-display text-2xl">{value}</p>
//       <p className="text-xs text-ink/50 mt-0.5">{label}</p>
//       {sub && <p className="text-xs text-amber-600 font-medium mt-1">{sub}</p>}
//     </motion.div>
//   );
// };

// const roleBadge = {
//   admin:   'bg-purple-100 text-purple-700',
//   shelter: 'bg-blue-100   text-blue-700',
//   adopter: 'bg-green-100  text-green-700',
// };

// const puppyStatusColor = {
//   available: 'bg-green-100 text-green-700',
//   pending:   'bg-amber-100 text-amber-700',
//   adopted:   'bg-gray-100  text-gray-500',
// };

// const AdminDashboard = () => {
//   const [tab, setTab]           = useState('overview');
//   const [stats, setStats]       = useState(null);
//   const [shelters, setShelters] = useState([]);
//   const [puppies, setPuppies]   = useState([]);
//   const [users, setUsers]       = useState([]);
//   const [loading, setLoading]   = useState(true);

//   const fetchAll = () => {
//     setLoading(true);
//     Promise.all([
//       api.get('/admin/stats'),
//       api.get('/shelters'),
//       api.get('/admin/puppies'),
//       api.get('/admin/users'),
//     ]).then(([s, sh, p, u]) => {
//       setStats(s.data);
//       setShelters(sh.data);
//       setPuppies(p.data);
//       setUsers(u.data);
//     }).finally(() => setLoading(false));
//   };

//   useEffect(() => { fetchAll(); }, []);

//   const handleVerify = async (id) => {
//     await api.put(`/shelters/${id}/verify`);
//     setShelters((prev) => prev.map((s) => (s._id === id ? { ...s, verified: true } : s)));
//     setStats((prev) => prev && {
//       ...prev,
//       shelters: { ...prev.shelters, pending: Math.max(0, prev.shelters.pending - 1) },
//     });
//   };

//   const handleRemovePuppy = async (id) => {
//     if (!window.confirm('Remove this listing? This cannot be undone.')) return;
//     await api.delete(`/admin/puppies/${id}`);
//     setPuppies((prev) => prev.filter((p) => p._id !== id));
//   };

//   const pendingShelters = shelters.filter((s) => !s.verified);

//   if (loading) {
//     return (
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
//         {Array.from({ length: 5 }).map((_, i) => (
//           <div key={i} className="bg-white rounded-2xl border border-amber-100 p-4 h-24 skeleton" />
//         ))}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
//         <h1 className="font-display text-3xl mb-1">Admin dashboard</h1>
//         <p className="text-ink/50 text-sm">Platform overview and moderation tools</p>
//       </motion.div>

//       {/* ── Stat cards ───────────────────────────────────────────────────── */}
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
//         <StatCard icon="👥" label="Total users"   value={stats.users.total}    sub={`${stats.users.adopters} adopters`} index={0} />
//         <StatCard icon="🏥" label="Shelters"      value={stats.shelters.total} sub={stats.shelters.pending > 0 ? `${stats.shelters.pending} pending` : null} color={stats.shelters.pending > 0 ? 'red' : 'amber'} index={1} />
//         <StatCard icon="🐶" label="Puppies"       value={stats.puppies.total}  sub={`${stats.puppies.available} available`} color="green" index={2} />
//         <StatCard icon="📋" label="Applications"  value={stats.applications.total} sub={stats.applications.pending > 0 ? `${stats.applications.pending} pending` : null} color="blue" index={3} />
//         <StatCard icon="🎉" label="Adoptions"     value={stats.puppies.adopted} sub={`${stats.stories.total} stories shared`} color="green" index={4} />
//       </div>

//       {/* ── Tabs ─────────────────────────────────────────────────────────── */}
//       <div className="flex gap-6 mb-6 border-b border-amber-100 overflow-x-auto">
//         {['overview', 'shelters', 'puppies', 'users'].map((t) => (
//           <button
//             key={t}
//             onClick={() => setTab(t)}
//             className={`pb-2 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
//               tab === t ? 'border-b-2 border-amber-600 text-amber-700' : 'text-ink/50 hover:text-ink/80'
//             }`}
//           >
//             {t}
//             {t === 'shelters' && pendingShelters.length > 0 && (
//               <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
//                 {pendingShelters.length}
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* ── Overview tab ─────────────────────────────────────────────────── */}
//       {tab === 'overview' && (
//         <div className="space-y-4">
//           {pendingShelters.length > 0 ? (
//             <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
//               <p className="font-medium mb-1">⚠️ {pendingShelters.length} shelter{pendingShelters.length > 1 ? 's' : ''} awaiting verification</p>
//               <p className="text-sm text-ink/60 mb-3">Review and verify new shelters in the Shelters tab.</p>
//               <button
//                 onClick={() => setTab('shelters')}
//                 className="text-sm bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors"
//               >
//                 Review now
//               </button>
//             </div>
//           ) : (
//             <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
//               <p className="font-medium text-green-700">✓ All shelters are verified</p>
//               <p className="text-sm text-ink/60 mt-1">No pending moderation actions.</p>
//             </div>
//           )}

//           <div className="grid sm:grid-cols-2 gap-4">
//             <div className="bg-white rounded-2xl border border-amber-100 p-5">
//               <p className="text-sm font-semibold text-ink/40 uppercase tracking-wide mb-3">Puppy status</p>
//               <div className="space-y-2">
//                 {[
//                   ['Available', stats.puppies.available, 'bg-green-500'],
//                   ['Adopted',   stats.puppies.adopted,   'bg-gray-400'],
//                 ].map(([label, val, color]) => (
//                   <div key={label} className="flex items-center gap-3">
//                     <span className={`w-2 h-2 rounded-full ${color}`} />
//                     <span className="text-sm text-ink/70 flex-1">{label}</span>
//                     <span className="text-sm font-medium">{val}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl border border-amber-100 p-5">
//               <p className="text-sm font-semibold text-ink/40 uppercase tracking-wide mb-3">User breakdown</p>
//               <div className="space-y-2">
//                 {[
//                   ['Adopters', stats.users.adopters, 'bg-green-500'],
//                   ['Shelters', stats.shelters.total, 'bg-blue-500'],
//                 ].map(([label, val, color]) => (
//                   <div key={label} className="flex items-center gap-3">
//                     <span className={`w-2 h-2 rounded-full ${color}`} />
//                     <span className="text-sm text-ink/70 flex-1">{label}</span>
//                     <span className="text-sm font-medium">{val}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Shelters tab ─────────────────────────────────────────────────── */}
//       {tab === 'shelters' && (
//         <div className="space-y-3">
//           {shelters.length === 0 ? (
//             <p className="text-ink/60 py-10 text-center">No shelters registered yet.</p>
//           ) : (
//             shelters
//               .slice()
//               .sort((a, b) => Number(a.verified) - Number(b.verified))
//               .map((s) => (
//                 <div key={s._id} className="border border-amber-100 rounded-xl p-4 bg-white flex justify-between items-center">
//                   <div>
//                     <p className="font-medium">{s.orgName}</p>
//                     <p className="text-sm text-ink/60">{s.address || 'No address provided'}</p>
//                   </div>
//                   {s.verified ? (
//                     <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">
//                       Verified ✓
//                     </span>
//                   ) : (
//                     <button
//                       onClick={() => handleVerify(s._id)}
//                       className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
//                     >
//                       Verify shelter
//                     </button>
//                   )}
//                 </div>
//               ))
//           )}
//         </div>
//       )}

//       {/* ── Puppies tab ──────────────────────────────────────────────────── */}
//       {tab === 'puppies' && (
//         <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {puppies.length === 0 ? (
//             <p className="text-ink/60 py-10 text-center col-span-full">No puppies listed yet.</p>
//           ) : (
//             puppies.map((p) => (
//               <div key={p._id} className="border border-amber-100 rounded-xl p-4 bg-white">
//                 {p.photos?.[0] ? (
//                   <img src={p.photos[0]} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-3" />
//                 ) : (
//                   <div className="w-full h-32 bg-amber-50 rounded-lg mb-3 flex items-center justify-center text-2xl">🐶</div>
//                 )}
//                 <div className="flex justify-between items-start mb-1">
//                   <p className="font-medium">{p.name}</p>
//                   <span className={`text-xs px-2 py-0.5 rounded-full ${puppyStatusColor[p.status]}`}>{p.status}</span>
//                 </div>
//                 <p className="text-xs text-ink/50 mb-1">{p.breed}</p>
//                 <p className="text-xs text-ink/40 mb-3">
//                   {p.shelter?.orgName} {!p.shelter?.verified && <span className="text-red-500">(unverified)</span>}
//                 </p>
//                 <button
//                   onClick={() => handleRemovePuppy(p._id)}
//                   className="w-full text-xs border border-red-200 text-red-600 rounded-lg py-1.5 hover:bg-red-50 transition-colors"
//                 >
//                   Remove listing
//                 </button>
//               </div>
//             ))
//           )}
//         </div>
//       )}

//       {/* ── Users tab ────────────────────────────────────────────────────── */}
//       {tab === 'users' && (
//         <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden">
//           <table className="w-full text-sm">
//             <thead className="bg-amber-50 text-ink/50 text-xs uppercase tracking-wide">
//               <tr>
//                 <th className="text-left px-4 py-3">Name</th>
//                 <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
//                 <th className="text-left px-4 py-3">Role</th>
//                 <th className="text-left px-4 py-3 hidden md:table-cell">Joined</th>
//               </tr>
//             </thead>
//             <tbody>
//               {users.map((u) => (
//                 <tr key={u._id} className="border-t border-amber-50">
//                   <td className="px-4 py-3 font-medium">{u.name}</td>
//                   <td className="px-4 py-3 text-ink/60 hidden sm:table-cell">{u.email}</td>
//                   <td className="px-4 py-3">
//                     <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${roleBadge[u.role]}`}>
//                       {u.role}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3 text-ink/40 hidden md:table-cell">
//                     {new Date(u.createdAt).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;



// import { useEffect, useState } from 'react';
// import api from '../../api/axios.js';

// const AdminDashboard = () => {
//   const [shelters, setShelters] = useState([]);

//   useEffect(() => {
//     api.get('/shelters').then((res) => setShelters(res.data));
//   }, []);

//   const handleVerify = async (id) => {
//     await api.put(`/shelters/${id}/verify`);
//     setShelters((prev) => prev.map((s) => (s._id === id ? { ...s, verified: true } : s)));
//   };

//   return (
//     <div>
//       <h1 className="font-display text-3xl mb-6">Admin: shelter moderation</h1>
//       <div className="space-y-3">
//         {shelters.map((s) => (
//           <div key={s._id} className="border border-amber-100 rounded-lg p-4 flex justify-between items-center">
//             <div>
//               <p className="font-medium">{s.orgName}</p>
//               <p className="text-sm text-ink/60">{s.address}</p>
//             </div>
//             {s.verified ? (
//               <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">Verified</span>
//             ) : (
//               <button
//                 onClick={() => handleVerify(s._id)}
//                 className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-md"
//               >
//                 Verify
//               </button>
//             )}
//           </div>
//         ))}
//         {shelters.length === 0 && <p className="text-ink/60">No shelters registered yet.</p>}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

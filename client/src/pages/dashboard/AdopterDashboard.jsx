import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

const statusColor = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  waitlisted: "bg-gray-100 text-gray-600",
};

const AdopterDashboard = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [tab, setTab] = useState("applications");

  useEffect(() => {
    api.get("/applications/mine").then((r) => setApplications(r.data));
    api.get("/chat/conversations").then((r) => setConversations(r.data));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">My dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-amber-100">
        {["applications", "messages"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? "border-b-2 border-amber-600 text-amber-700"
                : "text-ink/50 hover:text-ink/80"
            }`}
          >
            {t}
            {t === "messages" && conversations.length > 0 && (
              <span className="ml-2 bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">
                {conversations.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Applications tab ─────────────────────────────────────────────── */}
      {tab === "applications" && (
        <div className="space-y-3">
          {applications.length === 0 ? (
            <p className="text-ink/60">
              No applications yet.{" "}
              <Link to="/browse" className="text-amber-700">
                Browse puppies
              </Link>
            </p>
          ) : (
            applications.map((app) => (
              <div
                key={app._id}
                className="border border-amber-100 rounded-xl p-4 bg-white flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  {app.puppy?.photos?.[0] ? (
                    <img
                      src={app.puppy.photos[0]}
                      alt={app.puppy.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 text-xl">
                      🐶
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{app.puppy?.name}</p>
                    <p className="text-sm text-ink/60">
                      {app.shelter?.orgName}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full ${statusColor[app.status]}`}
                >
                  {app.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Messages tab ─────────────────────────────────────────────────── */}
      {tab === "messages" && (
        <div className="space-y-3">
          {conversations.length === 0 ? (
            <p className="text-ink/60 py-10 text-center">
              No messages yet. Apply for a puppy to start a conversation with a
              shelter.
            </p>
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
                    <p className="font-medium">{conv.puppy?.name ?? "Puppy"}</p>
                    <p className="text-sm text-ink/50">
                      Last message{" "}
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-amber-600 text-sm font-medium">
                  Open →
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdopterDashboard;

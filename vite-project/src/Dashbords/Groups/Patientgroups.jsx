import { useState, useEffect } from "react";
import { FiUsers, FiLogIn, FiLogOut, FiX } from "react-icons/fi";
import axios from "axios";
import "./Groups.css";

// ─── نفس الـ TherapistGroups تماماً بالنسبة للـ API ───
// المريض يشوف الجروبات وينضم / يغادر فقط
// الفرق بس في النصوص العربية والـ component name

const BASE_URL = "https://mind-space-ov3r.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

function getMyId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).id || null;
  } catch { return null; }
}

/* ── Group Card (Patient) ── */
function PatientGroupCard({ group, myId, onJoin, onLeave }) {
  const [expanded, setExpanded] = useState(false);

  const isMember = group.members?.some((m) => (m._id || m) === myId);

  return (
    <div className="grp-card">
      <div className="grp-card-top">
        <div className="grp-card-icon"><FiUsers /></div>

        <div className="grp-card-info">
          <h3>{group.name}</h3>
          <p>{group.description}</p>
          <span className="grp-badge">
            <FiUsers size={12} /> {group.members?.length || 0} عضو
          </span>
        </div>

        <div className="grp-card-actions">
          <button className="grp-icon-btn" title="عرض الأعضاء" onClick={() => setExpanded(!expanded)}>
            <FiUsers />
          </button>
        </div>
      </div>

      {/* Members list (read-only) */}
      {expanded && (
        <div className="grp-members">
          <h4>الأعضاء</h4>
          {group.members?.length > 0 ? (
            group.members.map((m) => {
              const id   = m._id || m;
              const name = m.userName || "عضو";
              return (
                <div key={id} className="grp-member-item">
                  <div className="grp-avatar">
                    {m.pfp?.secure_url
                      ? <img src={m.pfp.secure_url} alt="" />
                      : <span>{name.charAt(0).toUpperCase()}</span>}
                  </div>
                  <span className="grp-member-name">{name}</span>
                </div>
              );
            })
          ) : (
            <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>لا يوجد أعضاء بعد</p>
          )}
        </div>
      )}

      {/* Join / Leave */}
      <div className="grp-status">
        {isMember
          ? <span className="grp-joined-chip">✓ منضم</span>
          : <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>غير منضم</span>
        }
        {isMember
          ? (
            <button className="grp-btn warn" onClick={() => onLeave(group._id)}>
              <FiLogOut /> مغادرة الجروب
            </button>
          ) : (
            <button className="grp-btn success" onClick={() => onJoin(group._id)}>
              <FiLogIn /> انضم للجروب
            </button>
          )
        }
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function PatientGroups() {
  const [groups, setGroups]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const myId = getMyId();

  const fetchGroups = async () => {
  setLoading(true);

  try {
    const res = await axios.get(`${BASE_URL}/group/get-groups`, {
      headers: authHeader(),
    });

    console.log("GET GROUPS RESPONSE:", res.data);

    const data = res.data;

    setGroups(
      data?.result ||
      data?.data ||
      data ||
      []
    );
  } catch (e) {
    console.log(e.response?.data || e.message);
    setError("تعذر تحميل الجروبات");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => { fetchGroups(); }, []);

  /* Join */
  const handleJoin = async (groupId) => {
    try {
      await axios.post(`${BASE_URL}/group/join/${groupId}`, {}, { headers: authHeader() });
      setGroups((prev) =>
        prev.map((g) =>
          g._id === groupId
            ? { ...g, members: [...(g.members || []), { _id: myId, userName: "أنت" }] }
            : g
        )
      );
    } catch (e) {
      setError(e.response?.data?.message || "فشل الانضمام للجروب");
    }
  };

  /* Leave */
  const handleLeave = async (groupId) => {
    try {
      await axios.post(`${BASE_URL}/group/leave/${groupId}`, {}, { headers: authHeader() });
      setGroups((prev) =>
        prev.map((g) =>
          g._id === groupId
            ? { ...g, members: g.members?.filter((m) => (m._id || m) !== myId) }
            : g
        )
      );
    } catch (e) {
      setError(e.response?.data?.message || "فشل مغادرة الجروب");
    }
  };

  return (
    <div className="grp-container">
      <div className="grp-header">
        <div>
          <h1>جروبات الدعم</h1>
          <p>انضم لجروبات الدعم النفسي المتاحة لك</p>
        </div>
      </div>

      {error && (
        <div className="grp-error" onClick={() => setError("")}>
          <span>{error}</span>
          <FiX size={16} />
        </div>
      )}

      {loading ? (
        <div className="grp-loading">جاري التحميل…</div>
      ) : groups.length === 0 ? (
        <div className="grp-empty">
          <div className="grp-empty-icon">👥</div>
          <h3>لا توجد جروبات متاحة حالياً</h3>
          <p>سيتم إضافة جروبات قريباً</p>
        </div>
      ) : (
        <div className="grp-grid">
          {groups.map((g) => (
            <PatientGroupCard
              key={g._id}
              group={g}
              myId={myId}
              onJoin={handleJoin}
              onLeave={handleLeave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  FiUsers,
  FiSearch,
  FiUserPlus,
  FiUserMinus,
  FiMessageCircle,
} from "react-icons/fi";
import axios from "axios";
import "./PatientGroups.css";

const BASE_URL = "https://mind-space-ov3r.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || null;
  } catch {
    return null;
  }
}

/* ─── Group Card ─── */
function GroupCard({ group, isMember, onJoin, onLeave, loading }) {
  return (
    <div className={`pg-card ${isMember ? "pg-card-joined" : ""}`}>
      {isMember && <div className="pg-joined-badge">منضم ✓</div>}

      <div className="pg-card-top">
        <div className="pg-card-avatar">
          <FiUsers />
        </div>
        <div className="pg-card-info">
          <h3>{group.name}</h3>
          <p className="pg-desc">{group.description || "مجموعة دعم نفسي"}</p>
        </div>
      </div>

      <div className="pg-card-meta">
        <span className="pg-meta-item">
          <FiUsers />
          {group.members?.length || 0} عضو
        </span>
        {group.therapist?.userName && (
          <span className="pg-meta-item">
            👨‍⚕️ د. {group.therapist.userName}
          </span>
        )}
      </div>

      <div className="pg-card-actions">
        {isMember ? (
          <button
            className="pg-btn leave"
            onClick={() => onLeave(group._id)}
            disabled={loading === group._id}
          >
            <FiUserMinus />
            {loading === group._id ? "جاري..." : "مغادرة الجروب"}
          </button>
        ) : (
          <button
            className="pg-btn join"
            onClick={() => onJoin(group._id)}
            disabled={loading === group._id}
          >
            <FiUserPlus />
            {loading === group._id ? "جاري..." : "انضم للجروب"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function PatientGroups() {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all | mine

  const userId = getUserIdFromToken();

  /* ─── Fetch ─── */
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/group`, {
        headers: authHeader(),
      });
      setGroups(res.data?.data || res.data || []);
    } catch (e) {
      setError("تعذر تحميل الجروبات");
      console.log(e.response?.data || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const isMember = (group) =>
    group.members?.some((m) => (m._id || m) === userId);

  /* ─── Join ─── */
  const handleJoin = async (groupId) => {
    setActionLoading(groupId);
    try {
      await axios.post(
        `${BASE_URL}/group/join/${groupId}`,
        {},
        { headers: authHeader() }
      );
      setGroups((prev) =>
        prev.map((g) =>
          g._id === groupId
            ? { ...g, members: [...(g.members || []), userId] }
            : g
        )
      );
    } catch (e) {
      setError("فشل الانضمام للجروب");
      console.log(e.response?.data || e);
    } finally {
      setActionLoading(null);
    }
  };

  /* ─── Leave ─── */
  const handleLeave = async (groupId) => {
    setActionLoading(groupId);
    try {
      await axios.post(
        `${BASE_URL}/group/leave/${groupId}`,
        {},
        { headers: authHeader() }
      );
      setGroups((prev) =>
        prev.map((g) =>
          g._id === groupId
            ? {
                ...g,
                members: g.members?.filter((m) => (m._id || m) !== userId),
              }
            : g
        )
      );
    } catch (e) {
      setError("فشل مغادرة الجروب");
      console.log(e.response?.data || e);
    } finally {
      setActionLoading(null);
    }
  };

  /* ─── Filter ─── */
  const filtered = groups.filter((g) => {
    const matchSearch = g.name?.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "mine") return matchSearch && isMember(g);
    return matchSearch;
  });

  const myGroupsCount = groups.filter(isMember).length;

  return (
    <div className="pg-container">
      {/* Header */}
      <div className="pg-header">
        <div>
          <h1>مجموعات الدعم</h1>
          <p>انضم لمجموعات يشرف عليها متخصصون في الصحة النفسية</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="pg-tabs">
        <button
          className={`pg-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          كل الجروبات
          <span className="pg-tab-count">{groups.length}</span>
        </button>
        <button
          className={`pg-tab ${activeTab === "mine" ? "active" : ""}`}
          onClick={() => setActiveTab("mine")}
        >
          جروباتي
          <span className="pg-tab-count">{myGroupsCount}</span>
        </button>
      </div>

      {/* Search */}
      <div className="pg-search-wrap">
        <FiSearch className="pg-search-icon" />
        <input
          className="pg-search"
          placeholder="ابحث عن جروب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="pg-error" onClick={() => setError("")}>
          {error} ✕
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="pg-loading">جاري التحميل…</div>
      ) : filtered.length === 0 ? (
        <div className="pg-empty">
          <div className="pg-empty-icon">👥</div>
          <h3>
            {activeTab === "mine"
              ? "لم تنضم لأي جروب بعد"
              : "لا توجد جروبات متاحة"}
          </h3>
          <p>
            {activeTab === "mine"
              ? "تصفح الجروبات المتاحة وانضم لما يناسبك"
              : "لا توجد نتائج للبحث"}
          </p>
          {activeTab === "mine" && (
            <button className="pg-btn-outlined" onClick={() => setActiveTab("all")}>
              تصفح الجروبات
            </button>
          )}
        </div>
      ) : (
        <div className="pg-grid">
          {filtered.map((g) => (
            <GroupCard
              key={g._id}
              group={g}
              isMember={isMember(g)}
              onJoin={handleJoin}
              onLeave={handleLeave}
              loading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
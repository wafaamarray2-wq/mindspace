import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiUsers, FiLogOut, FiLogIn, FiArrowRight,
  FiShield, FiTarget, FiUser, FiCalendar, FiMessageCircle,
} from "react-icons/fi";
import axios from "axios";
import "./GroupDetails.css";

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

function Avatar({ name, pfp, size = 40 }) {
  const colors = [
    { bg: "#ccfbf1", color: "#0f766e" },
    { bg: "#dbeafe", color: "#1e40af" },
    { bg: "#fef3c7", color: "#92400e" },
    { bg: "#ffe4e6", color: "#9f1239" },
    { bg: "#ede9fe", color: "#5b21b6" },
  ];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  const { bg, color } = colors[idx];

  if (pfp)
    return (
      <img
        src={pfp}
        alt={name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }}
      />
    );

  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: bg, color, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontWeight: 500, fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {name?.charAt(0)?.toUpperCase() || "؟"}
    </div>
  );
}

function MemberCard({ member }) {
  const name = member.userName || "عضو";
  const role = member.role;
  const isTherapist = role === "therapist";

  return (
    <div className="gd-member-card">
      <Avatar name={name} pfp={member.pfp?.secure_url} size={44} />
      <div className="gd-member-info">
        <span className="gd-member-name">{name}</span>
        <span className={`gd-role-badge ${isTherapist ? "badge-therapist" : "badge-patient"}`}>
          {isTherapist ? "معالج نفسي" : "عضو"}
        </span>
      </div>
    </div>
  );
}

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const myId = getMyId();

  const [group, setGroup]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [activeTab, setActiveTab] = useState("members");

  /* ── fetch single group ── */
  useEffect(() => {
    const fetchGroup = async () => {
      setLoading(true);
      try {
        /* API returns all groups — find the one we need */
        const res = await axios.get(`${BASE_URL}/group/get-groups`, {
          headers: authHeader(),
        });
        const data = res.data;
        const all  = data?.result || data?.data || data || [];
        const found = all.find((g) => g._id === groupId);
        if (!found) { setError("الجروب غير موجود"); return; }
        setGroup(found);
      } catch (e) {
        setError("تعذر تحميل بيانات الجروب");
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [groupId]);

  const isMember = group?.members?.some((m) => (m._id || m) === myId);

  /* ── join ── */
  const handleJoin = async () => {
    try {
      await axios.post(`${BASE_URL}/group/join/${groupId}`, {}, { headers: authHeader() });
      setGroup((prev) => ({
        ...prev,
        members: [...(prev.members || []), { _id: myId, userName: "أنت" }],
      }));
    } catch (e) {
      setError(e.response?.data?.message || "فشل الانضمام");
    }
  };

  /* ── leave ── */
  const handleLeave = async () => {
    try {
      await axios.post(`${BASE_URL}/group/leave/${groupId}`, {}, { headers: authHeader() });
      setGroup((prev) => ({
        ...prev,
        members: prev.members?.filter((m) => (m._id || m) !== myId),
      }));
    } catch (e) {
      setError(e.response?.data?.message || "فشل مغادرة الجروب");
    }
  };

  const therapists = group?.members?.filter((m) => m.role === "therapist") || [];
  const patients   = group?.members?.filter((m) => m.role !== "therapist") || [];

  /* ── states ── */
  if (loading) return <div className="gd-loading"><span className="gd-spinner" />جاري التحميل…</div>;
  if (error)   return (
    <div className="gd-error-page">
      <p>{error}</p>
      <button className="gd-btn-back" onClick={() => navigate(-1)}>
        <FiArrowRight /> العودة
      </button>
    </div>
  );
  if (!group)  return null;

  return (
    <div className="gd-container" dir="rtl">

      {/* ── Back ── */}
      <button className="gd-back-link" onClick={() => navigate(-1)}>
        <FiArrowRight /> العودة للجروبات
      </button>

      {/* ── Hero ── */}
      <div className="gd-hero">
        <div className="gd-hero-blob gd-blob1" />
        <div className="gd-hero-blob gd-blob2" />

        <div className="gd-hero-body">
          <div className="gd-hero-icon">🧠</div>
          <div className="gd-hero-text">
            <div className="gd-hero-top-row">
              <h1 className="gd-hero-title">{group.name}</h1>
              {isMember && <span className="gd-joined-chip">✓ منضم</span>}
            </div>
            {group.description && (
              <p className="gd-hero-desc">{group.description}</p>
            )}
            <div className="gd-hero-stats">
              <span className="gd-stat"><FiUsers size={13} /> {group.members?.length || 0} عضو</span>
              {therapists.length > 0 && (
                <span className="gd-stat"><FiUser size={13} /> {therapists.length} معالج</span>
              )}
              <span className="gd-stat"><FiCalendar size={13} /> {new Date(group.createdAt || Date.now()).toLocaleDateString("ar-EG", { year: "numeric", month: "long" })}</span>
            </div>
          </div>
        </div>

        <div className="gd-hero-action">
          {isMember ? (
            <button className="gd-btn-leave" onClick={handleLeave}>
              <FiLogOut size={15} /> مغادرة الجروب
            </button>
          ) : (
            <button className="gd-btn-join" onClick={handleJoin}>
              <FiLogIn size={15} /> انضم للجروب
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="gd-tabs">
        <button
          className={`gd-tab ${activeTab === "members" ? "active" : ""}`}
          onClick={() => setActiveTab("members")}
        >
          <FiUsers size={14} /> الأعضاء ({group.members?.length || 0})
        </button>
        <button
          className={`gd-tab ${activeTab === "about" ? "active" : ""}`}
          onClick={() => setActiveTab("about")}
        >
          <FiShield size={14} /> عن الجروب
        </button>
      </div>

      {/* ── Tab: Members ── */}
      {activeTab === "members" && (
        <div className="gd-section">
          {therapists.length > 0 && (
            <>
              <p className="gd-sub-label">المعالجون</p>
              <div className="gd-members-grid">
                {therapists.map((m) => (
                  <MemberCard key={m._id || m} member={m} />
                ))}
              </div>
            </>
          )}

          {patients.length > 0 && (
            <>
              <p className="gd-sub-label" style={{ marginTop: therapists.length ? "1.25rem" : 0 }}>
                الأعضاء
              </p>
              <div className="gd-members-grid">
                {patients.map((m) => (
                  <MemberCard key={m._id || m} member={m} />
                ))}
              </div>
            </>
          )}

          {group.members?.length === 0 && (
            <div className="gd-empty">
              <FiUsers size={28} style={{ color: "#14b8a6", marginBottom: 8 }} />
              <p>لا يوجد أعضاء بعد</p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: About ── */}
      {activeTab === "about" && (
        <div className="gd-section">
          <div className="gd-info-rows">
            <div className="gd-info-row">
              <div className="gd-info-icon"><FiTarget size={16} /></div>
              <div>
                <p className="gd-info-label">هدف الجروب</p>
                <p className="gd-info-value">
                  {group.description || "دعم الأعضاء ومساعدتهم على تجاوز تحدياتهم النفسية"}
                </p>
              </div>
            </div>

            <div className="gd-info-row">
              <div className="gd-info-icon"><FiShield size={16} /></div>
              <div>
                <p className="gd-info-label">قواعد المجموعة</p>
                <p className="gd-info-value">
                  الاحترام المتبادل — السرية التامة — عدم مشاركة معلومات الآخرين خارج الجروب
                </p>
              </div>
            </div>

            {therapists.length > 0 && (
              <div className="gd-info-row">
                <div className="gd-info-icon"><FiUser size={16} /></div>
                <div>
                  <p className="gd-info-label">المشرف</p>
                  <p className="gd-info-value">{therapists[0].userName}</p>
                </div>
              </div>
            )}

            <div className="gd-info-row">
              <div className="gd-info-icon"><FiCalendar size={16} /></div>
              <div>
                <p className="gd-info-label">تاريخ الإنشاء</p>
                <p className="gd-info-value">
                  {new Date(group.createdAt || Date.now()).toLocaleDateString("ar-EG", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat placeholder ── */}
      <div className="gd-section gd-chat-placeholder">
        <div className="gd-chat-inner">
          <FiMessageCircle size={28} style={{ color: "#14b8a6" }} />
          <p className="gd-chat-title">المحادثة الجماعية قريباً</p>
          <p className="gd-chat-sub">ستتمكن من التواصل مع أعضاء الجروب قريباً</p>
        </div>
      </div>

    </div>
  );
}
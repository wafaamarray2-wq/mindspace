import { useState, useEffect } from "react";
import {
  FiUsers,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiUserMinus,
  FiX,
  FiCheck,
} from "react-icons/fi";
import axios from "axios";
import "./TherapistGroups.css";

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

/* ─── Create / Edit Modal ─── */
function GroupModal({ open, onClose, onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [desc, setDesc] = useState(initial?.description || "");

  useEffect(() => {
    setName(initial?.name || "");
    setDesc(initial?.description || "");
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="tg-overlay" onClick={onClose}>
      <div className="tg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tg-modal-header">
          <h3>{initial ? "تعديل الجروب" : "إنشاء جروب جديد"}</h3>
          <button className="tg-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <input
          className="tg-input"
          placeholder="اسم الجروب"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="tg-input tg-textarea"
          placeholder="وصف الجروب"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
        />
        <div className="tg-modal-actions">
          <button
            className="tg-btn primary"
            disabled={!name.trim()}
            onClick={() => {
              onSubmit({ name: name.trim(), description: desc.trim() });
              onClose();
            }}
          >
            <FiCheck /> {initial ? "حفظ التعديلات" : "إنشاء"}
          </button>
          <button className="tg-btn secondary" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Group Card ─── */
function GroupCard({ group, onEdit, onRemoveMember }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="tg-card">
      <div className="tg-card-header">
        <div className="tg-card-icon">
          <FiUsers />
        </div>
        <div className="tg-card-info">
          <h3>{group.name}</h3>
          <p>{group.description}</p>
          <span className="tg-members-count">
            {group.members?.length || 0} عضو
          </span>
        </div>
        <div className="tg-card-actions">
          <button
            className="tg-icon-btn"
            title="تعديل"
            onClick={() => onEdit(group)}
          >
            <FiEdit3 />
          </button>
          <button
            className="tg-icon-btn"
            title="الأعضاء"
            onClick={() => setExpanded(!expanded)}
          >
            <FiUsers />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="tg-members-list">
          <h4>الأعضاء</h4>
          {group.members?.length > 0 ? (
            group.members.map((m) => {
              const memberId = m._id || m;
              const memberName = m.userName || "عضو";
              return (
                <div key={memberId} className="tg-member-item">
                  <div className="tg-member-avatar">
                    {m.pfp?.secure_url ? (
                      <img src={m.pfp.secure_url} alt="" />
                    ) : (
                      <span>{memberName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className="tg-member-name">{memberName}</span>
                  <button
                    className="tg-icon-btn danger"
                    title="إزالة العضو"
                    onClick={() => onRemoveMember(group._id, memberId)}
                  >
                    <FiUserMinus />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="tg-no-members">لا يوجد أعضاء بعد</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── MAIN ─── */
export default function TherapistGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [error, setError] = useState("");

  /* ─── Fetch my groups (filter by therapist id) ─── */
  const fetchGroups = async () => {
    setLoading(true);
    try {
      // نجيب كل الجروبات — لو الـ backend مرجعش endpoint خاص
      // بنفلتر بالـ therapist id
      const res = await axios.get(`${BASE_URL}/group`, {
        headers: authHeader(),
      });
      const myId = getUserIdFromToken();
      const all = res.data?.data || res.data || [];
      const mine = all.filter(
        (g) => g.therapistId === myId || g.therapist?._id === myId || g.createdBy === myId
      );
      setGroups(mine.length > 0 ? mine : all);
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



  console.log("TOKEN:", localStorage.getItem("token"));
console.log("HEADERS:", authHeader());
console.log("_____________________________________:");
console.log(
  JSON.parse(atob(localStorage.getItem("token").split(".")[1]))
);
  /* ─── Create ─── */









const handleCreate = async ({ name, description }) => {
  try {
    const token = localStorage.getItem("token");

    console.log("TOKEN =>", token);

    const res = await axios({
      method: "POST",
      url: "https://mind-space-ov3r.onrender.com/group/create-group",
      data: {
        name,
        description,
      },
      headers: {
        Authorization: `dash ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("CREATE SUCCESS =>", res.data);

    const newGroup = res.data?.data || res.data;

    setGroups((prev) => [newGroup, ...prev]);
  } catch (e) {
    console.log("FULL ERROR =>", e);
    console.log("ERROR RESPONSE =>", e.response);
    console.log("ERROR DATA =>", e.response?.data);

    setError(e.response?.data?.message || "فشل إنشاء الجروب");
  }
};
  /* ─── Update ─── */
  const handleUpdate = async ({ name, description }) => {
    if (!editTarget) return;
    try {
      await axios.put(
        `${BASE_URL}/group/update-group/${editTarget._id}`,
        { name, description },
        { headers: authHeader() }
      );
      setGroups((prev) =>
        prev.map((g) =>
          g._id === editTarget._id ? { ...g, name, description } : g
        )
      );
      setEditTarget(null);
    } catch (e) {
      setError("فشل تعديل الجروب");
      console.log(e.response?.data || e);
    }
  };

  /* ─── Remove Member ─── */
  const handleRemoveMember = async (groupId, memberId) => {
    try {
      await axios.delete(
        `${BASE_URL}/group/remove-user/${groupId}/${memberId}`,
        { headers: authHeader() }
      );
      setGroups((prev) =>
        prev.map((g) =>
          g._id === groupId
            ? {
                ...g,
                members: g.members?.filter(
                  (m) => (m._id || m) !== memberId
                ),
              }
            : g
        )
      );
    } catch (e) {
      setError("فشل إزالة العضو");
      console.log(e.response?.data || e);
    }
  };

  return (
    <div className="tg-container">
      {/* Header */}
      <div className="tg-header">
        <div>
          <h1>جروباتي</h1>
          <p>أنشئ وأدر مجموعات الدعم النفسي</p>
        </div>
        <button className="tg-btn primary" onClick={() => setModalOpen(true)}>
          <FiPlus /> جروب جديد
        </button>
      </div>

      {error && (
        <div className="tg-error" onClick={() => setError("")}>
          {error} ✕
        </div>
      )}

      {/* Groups */}
      {loading ? (
        <div className="tg-loading">جاري التحميل…</div>
      ) : groups.length === 0 ? (
        <div className="tg-empty">
          <div className="tg-empty-icon">👥</div>
          <h3>لم تنشئ أي جروب بعد</h3>
          <p>ابدأ بإنشاء جروب دعم لمرضاك</p>
          <button className="tg-btn primary" onClick={() => setModalOpen(true)}>
            <FiPlus /> إنشاء أول جروب
          </button>
        </div>
      ) : (
        <div className="tg-grid">
          {groups.map((g) => (
            <GroupCard
              key={g._id}
              group={g}
              onEdit={(group) => {
                setEditTarget(group);
                setModalOpen(true);
              }}
              onRemoveMember={handleRemoveMember}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <GroupModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        initial={editTarget}
      />
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  FiUsers, FiPlus, FiEdit3, FiUserMinus, FiX, FiCheck,
} from "react-icons/fi";
import axios from "axios";
import "./Groups.css";

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

/* ── Create / Edit Modal ── */
function GroupModal({ open, onClose, onSubmit, initial }) {
  const [name, setName] = useState(initial?.name || "");
  const [desc, setDesc] = useState(initial?.description || "");

  useEffect(() => {
    setName(initial?.name || "");
    setDesc(initial?.description || "");
  }, [initial, open]);

  if (!open) return null;

  return (
    <div className="grp-overlay" onClick={onClose}>
      <div className="grp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="grp-modal-header">
          <h3>{initial ? "تعديل الجروب" : "إنشاء جروب جديد"}</h3>
          <button className="grp-icon-btn" onClick={onClose}><FiX /></button>
        </div>

        <input
          className="grp-input"
          placeholder="اسم الجروب"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className="grp-input"
          placeholder="وصف الجروب"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={3}
        />

        <div className="grp-modal-footer">
          <button
            className="grp-btn primary"
            disabled={!name.trim()}
            onClick={() => { onSubmit({ name: name.trim(), description: desc.trim() }); onClose(); }}
          >
            <FiCheck /> {initial ? "حفظ التعديلات" : "إنشاء"}
          </button>
          <button className="grp-btn secondary" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}

/* ── Group Card (Admin) ── */
function AdminGroupCard({ group, onEdit, onRemoveMember }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="grp-card">
      <div className="grp-card-top">
        <div className="grp-card-icon"><FiUsers /></div>

        <div className="grp-card-info">
          <h3>{group.name}</h3>
          <p>{group.description}</p>
          <span className="grp-badge"><FiUsers size={12} /> {group.members?.length || 0} عضو</span>
        </div>

        <div className="grp-card-actions">
          <button className="grp-icon-btn accent" title="تعديل" onClick={() => onEdit(group)}>
            <FiEdit3 />
          </button>
          <button className="grp-icon-btn" title="عرض الأعضاء" onClick={() => setExpanded(!expanded)}>
            <FiUsers />
          </button>
        </div>
      </div>

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
                  <button
                    className="grp-icon-btn danger"
                    title="إزالة العضو"
                    onClick={() => onRemoveMember(group._id, id)}
                  >
                    <FiUserMinus />
                  </button>
                </div>
              );
            })
          ) : (
            <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>لا يوجد أعضاء بعد</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── MAIN ── */
export default function AdminGroups() {
  const [groups, setGroups]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [error, setError]         = useState("");

  /* Fetch all groups */
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/group`, { headers: authHeader() });
      setGroups(res.data?.data || res.data || []);
    } catch (e) {
      setError("تعذر تحميل الجروبات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  /* Create */
const handleCreate = async ({ name, description }) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/group/create-group`,
      {
        name,
        description,
      },
      {
        headers: authHeader(),
      }
    );
    console.log("res",res)

    const newGroup = res.data?.data || res.data;
    console.log(newGroup)

    setGroups((prev) => [newGroup, ...prev]);
  } catch (e) {
    console.log(e.response?.data);
    setError(e.response?.data?.message || "فشل إنشاء الجروب");
  }
};

  /* Update */
  const handleUpdate = async ({ name, description }) => {
    if (!editTarget) return;
    try {
      await axios.put(
        `${BASE_URL}/group/update-group/${editTarget._id}`,
        { name, description },
        { headers: authHeader() }
      );
      setGroups((prev) =>
        prev.map((g) => g._id === editTarget._id ? { ...g, name, description } : g)
      );
      setEditTarget(null);
    } catch (e) {
      setError(e.response?.data?.message || "فشل تعديل الجروب");
    }
  };

  /* Remove member */
  const handleRemoveMember = async (groupId, memberId) => {
    try {
      await axios.delete(
        `${BASE_URL}/group/remove-user/${groupId}/${memberId}`,
        { headers: authHeader() }
      );
      setGroups((prev) =>
        prev.map((g) =>
          g._id === groupId
            ? { ...g, members: g.members?.filter((m) => (m._id || m) !== memberId) }
            : g
        )
      );
    } catch (e) {
      setError(e.response?.data?.message || "فشل إزالة العضو");
    }
  };

  const openCreate = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit   = (group) => { setEditTarget(group); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  return (
    <div className="grp-container">
      {/* Header */}
      <div className="grp-header">
        <div>
          <h1>إدارة الجروبات</h1>
          <p>أنشئ وعدّل وأدر جميع مجموعات الدعم</p>
        </div>
        <button className="grp-btn primary" onClick={openCreate}>
          <FiPlus /> جروب جديد
        </button>
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
          <h3>لا توجد جروبات بعد</h3>
          <p>ابدأ بإنشاء أول جروب دعم</p>
          <button className="grp-btn primary" onClick={openCreate}>
            <FiPlus /> إنشاء جروب
          </button>
        </div>
      ) : (
        <div className="grp-grid">
          {groups.map((g) => (
            <AdminGroupCard
              key={g._id}
              group={g}
              onEdit={openEdit}
              onRemoveMember={handleRemoveMember}
            />
          ))}
        </div>
      )}

      <GroupModal
        open={modalOpen}
        onClose={closeModal}
        onSubmit={editTarget ? handleUpdate : handleCreate}
        initial={editTarget}
      />
    </div>
  );
}
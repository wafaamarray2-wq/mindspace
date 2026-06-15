import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiCalendar, FiClock } from "react-icons/fi";
import "./patients.css";

const BASE = "https://mind-space-ov3r.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

const STATUS_MAP = {
  pending:   { text: "في الانتظار", cls: "pat-status pending"   },
  confirmed: { text: "مؤكدة",       cls: "pat-status confirmed" },
  canceled:  { text: "ملغاة",       cls: "pat-status canceled"  },
  completed: { text: "منتهية",      cls: "pat-status completed" },
};

function Avatar({ name }) {
  const colors = [
    ["#EEEDFE", "#534AB7"], ["#E1F5EE", "#0F6E56"],
    ["#FEF3C7", "#92400E"], ["#FFE4E6", "#9F1239"],
    ["#DBEAFE", "#1E40AF"],
  ];
  const idx = (name?.charCodeAt(0) || 0) % colors.length;
  const [bg, color] = colors[idx];
  return (
    <div className="pat-avatar" style={{ background: bg, color }}>
      {name?.charAt(0)?.toUpperCase() || "؟"}
    </div>
  );
}

export default function Patients() {
  const navigate  = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res  = await axios.get(`${BASE}/session/therapist`, { headers: authHeader() });
        const data = res.data?.data || res.data || [];
        // deduplicate by patient + keep latest session per patient
        const map  = new Map();
        data.forEach((s) => {
          const pid = s.userId?._id || s.userId;
          if (!pid) return;
          if (!map.has(pid) || new Date(s.sessionTime) > new Date(map.get(pid).sessionTime))
            map.set(pid, s);
        });
        setSessions([...map.values()]);
      } catch (e) {
        setError("تعذر تحميل بيانات المرضى");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="patients">
      <div className="pat-header">
        <h1>المرضى</h1>
        {!loading && (
          <span className="pat-count">{sessions.length} مريض</span>
        )}
      </div>

      {loading && (
        <div className="pat-loading">
          <span className="pat-spinner" /> جاري التحميل…
        </div>
      )}

      {error && <div className="pat-error">{error}</div>}

      {!loading && !error && sessions.length === 0 && (
        <div className="pat-empty">
          <FiUser size={36} />
          <p>لا يوجد مرضى بعد</p>
        </div>
      )}

      {!loading && !error && (
        <div className="boxes">
          {sessions.map((s) => {
            const patient = s.userId;
            const name    = patient?.userName || "مريض";
            const pid     = patient?._id || s.userId;
            const { text, cls } = STATUS_MAP[s.status] || { text: s.status, cls: "pat-status" };

            return (
              <div className="box" key={s._id}>
                <Avatar name={name} />

                <div className="content">
                  <h2>{name}</h2>

                  <div className="pat-info-row">
                    <FiCalendar size={13} />
                    <span>{formatDate(s.sessionTime)}</span>
                  </div>

                  <div className="pat-info-row">
                    <FiClock size={13} />
                    <span className={cls}>{text}</span>
                  </div>

                  <button onClick={() => navigate(`/patient/${pid}`, { state: { session: s } })}>
                    عرض الملف
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
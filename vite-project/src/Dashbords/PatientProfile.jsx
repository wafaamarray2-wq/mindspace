import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiArrowRight, FiCalendar, FiClock, FiUser } from "react-icons/fi";
import "./patientprofile.css";

const BASE = "https://mind-space-ov3r.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

const STATUS_MAP = {
  pending:   { text: "في الانتظار", cls: "pp-badge pending"   },
  confirmed: { text: "مؤكدة",       cls: "pp-badge confirmed" },
  canceled:  { text: "ملغاة",       cls: "pp-badge canceled"  },
  completed: { text: "منتهية",      cls: "pp-badge completed" },
};

function Avatar({ name, size = 72 }) {
  const colors = [
    ["#EEEDFE","#534AB7"], ["#E1F5EE","#0F6E56"],
    ["#FEF3C7","#92400E"], ["#FFE4E6","#9F1239"],
    ["#DBEAFE","#1E40AF"],
  ];
  const [bg, color] = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div className="pp-avatar" style={{ width: size, height: size, background: bg, color, fontSize: size * 0.38 }}>
      {name?.charAt(0)?.toUpperCase() || "؟"}
    </div>
  );
}

export default function PatientProfile() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { state }    = useLocation();

  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  /* اسم المريض من الـ state اللي جاي من Patients page */
  const patientName = state?.session?.userId?.userName || "مريض";

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res  = await axios.get(`${BASE}/session/therapist`, { headers: authHeader() });
        const all  = res.data?.data || res.data || [];
        /* فلتر الجلسات بتاعة المريض ده بس */
        const mine = all.filter((s) => {
          const pid = s.userId?._id || s.userId;
          return pid === id;
        });
        /* ترتيب من الأحدث للأقدم */
        mine.sort((a, b) => new Date(b.sessionTime) - new Date(a.sessionTime));
        setSessions(mine);
      } catch {
        setError("تعذر تحميل بيانات الجلسات");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [id]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("ar-EG", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }) : "—";

  /* إحصائيات */
  const total     = sessions.length;
  const completed = sessions.filter((s) => s.status === "completed").length;
  const upcoming  = sessions.filter((s) => s.status === "confirmed" || s.status === "pending").length;

  return (
    <div className="pp-page" dir="rtl">

      {/* back */}
      <button className="pp-back" onClick={() => navigate(-1)}>
        <FiArrowRight /> العودة للمرضى
      </button>

      {/* hero */}
      <div className="pp-hero">
        <Avatar name={patientName} size={72} />
        <div className="pp-hero-info">
          <h1>{patientName}</h1>
          <span className="pp-role-badge"><FiUser size={11} /> مريض</span>
        </div>
      </div>

      {/* stats */}
      <div className="pp-stats">
        <div className="pp-stat">
          <span className="pp-stat-n">{total}</span>
          <span className="pp-stat-l">إجمالي الجلسات</span>
        </div>
        <div className="pp-stat">
          <span className="pp-stat-n">{completed}</span>
          <span className="pp-stat-l">منتهية</span>
        </div>
        <div className="pp-stat">
          <span className="pp-stat-n">{upcoming}</span>
          <span className="pp-stat-l">قادمة</span>
        </div>
      </div>

      {/* sessions list */}
      <div className="pp-card">
        <div className="pp-card-head">
          <FiCalendar size={15} />
          <span>سجل الجلسات</span>
        </div>

        {loading && (
          <div className="pp-loading">
            <span className="pp-spinner" /> جاري التحميل…
          </div>
        )}

        {error && <div className="pp-error">{error}</div>}

        {!loading && !error && sessions.length === 0 && (
          <div className="pp-empty">
            <FiCalendar size={28} />
            <p>لا توجد جلسات مسجلة</p>
          </div>
        )}

        {!loading && sessions.map((s, i) => {
          const { text, cls } = STATUS_MAP[s.status] || { text: s.status, cls: "pp-badge" };
          return (
            <div className="pp-session-row" key={s._id}>
              <div className="pp-session-num">{i + 1}</div>
              <div className="pp-session-info">
                <div className="pp-session-date">
                  <FiClock size={12} /> {formatDate(s.sessionTime)}
                </div>
              </div>
              <span className={cls}>{text}</span>
            </div>
          );
        })}
      </div>

    </div>
  );
}

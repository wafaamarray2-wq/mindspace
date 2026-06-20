import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiCalendar, FiClock } from "react-icons/fi";
import { useLang } from "../i18n/LanguageContext";
import "./patients.css";

const BASE = "https://mind-space-ov3r.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

const STATUS_MAP = {
  pending:   { key: "pending",   cls: "pat-status pending"   },
  confirmed: { key: "confirmed", cls: "pat-status confirmed" },
  canceled:  { key: "cancelled", cls: "pat-status canceled"  },
  completed: { key: "completed", cls: "pat-status completed" },
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
  const { t } = useLang();
  const navigate  = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res  = await axios.get(`${BASE}/session/therapist`, { headers: authHeader() });
        const data = res.data?.data || res.data || [];
        const map  = new Map();
        data.forEach((s) => {
          const pid = s.userId?._id || s.userId;
          if (!pid) return;
          if (!map.has(pid) || new Date(s.sessionTime) > new Date(map.get(pid).sessionTime))
            map.set(pid, s);
        });
        setSessions([...map.values()]);
      } catch (e) {
        setError(t("errorLoadingPatients"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("ar-EG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="patients">
      <div className="pat-header">
        <h1>{t("patients")}</h1>
        {!loading && (
          <span className="pat-count">{sessions.length} {t("patients")}</span>
        )}
      </div>

      {loading && (
        <div className="pat-loading">
          <span className="pat-spinner" /> {t("loading")}
        </div>
      )}

      {error && <div className="pat-error">{error}</div>}

      {!loading && !error && sessions.length === 0 && (
        <div className="pat-empty">
          <FiUser size={36} />
          <p>{t("noPatients")}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="boxes">
          {sessions.map((s) => {
            const patient = s.userId;
            const name    = patient?.userName || "مريض";
            const pid     = patient?._id || s.userId;
            const { key, cls } = STATUS_MAP[s.status] || { key: s.status, cls: "pat-status" };

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
                    <span className={cls}>{t(key)}</span>
                  </div>
                  <button onClick={() => navigate(`/patient/${pid}`, { state: { session: s } })}>
                    {t("viewProfile")}
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
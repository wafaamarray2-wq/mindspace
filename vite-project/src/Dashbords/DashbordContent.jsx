import { useState, useEffect } from "react";
import axios from "axios";
import { BiSolidStar } from "react-icons/bi";
import { FiClock, FiCalendar, FiUsers, FiCheckCircle } from "react-icons/fi";
import "./doc.css";
import { useLang } from "../i18n/LanguageContext";
const BASE = "https://mind-space-ov3r.onrender.com";

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

export default function DashboardContent() {
  const [sessions, setSessions] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  const STATUS_LABEL = {
    pending: { text: t("pending"), cls: "status-pending" },
    confirmed: { text: t("confirmed"), cls: "status-active" },
    cancelled: { text: t("cancelled"), cls: "status-inactive" },
    completed: { text: t("completed"), cls: "status-inactive" },
  };
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sessRes, fbRes] = await Promise.all([
          axios.get(`${BASE}/session/therapist`, { headers: authHeader() }),
          axios.get(`${BASE}/feedback`, { headers: authHeader() }),
        ]);

        const allSessions = sessRes.data?.data || sessRes.data || [];
        const allFeedbacks = fbRes.data?.data || fbRes.data || [];

        setSessions(allSessions);
        setFeedbacks(allFeedbacks);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* ── derived stats ── */
  const uniquePatients = new Set(
    sessions.map((s) => s.userId?._id || s.userId).filter(Boolean),
  ).size;

  const upcomingSessions = sessions.filter(
    (s) => s.status === "confirmed" || s.status === "pending",
  );

  const avgRating = feedbacks.length
    ? (
        feedbacks.reduce((acc, f) => acc + (f.stars || 0), 0) / feedbacks.length
      ).toFixed(1)
    : null;

  /* ── upcoming sorted by date ── */
  const sortedUpcoming = [...upcomingSessions]
    .sort((a, b) => new Date(a.sessionTime) - new Date(b.sessionTime))
    .slice(0, 10);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("ar-EG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <span className="dash-spinner" /> جاري التحميل…
      </div>
    );
  }

  return (
    <div>
      {/* ── STAT BOXES ── */}
      <div className="boxes">
        <div className="box">
          <FiUsers className="box-icon" />
          <p>{t("patients")}</p>
          <div className="number">
            <span>{uniquePatients}</span>
          </div>
        </div>

        <div className="box">
          <FiCalendar className="box-icon" />
          <p>{t("upcomingSessions")}</p>
          <div className="number">
            <span>{upcomingSessions.length}</span>
          </div>
        </div>

        <div className="box">
          <BiSolidStar className="box-icon" />
          <p>{t("avgRating")}</p>
          <div className="number">
            <span>
              {avgRating ? (
                <>
                  {avgRating} <BiSolidStar />
                </>
              ) : (
                "—"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── UPCOMING SESSIONS TABLE ── */}
      <div className="table-container">
        <div className="table-title">
          <FiClock /> {t("upcomingSessions")}
        </div>

        {sortedUpcoming.length === 0 ? (
          <div className="dash-empty">
            <FiCheckCircle size={28} />
            <p>{t("noUpcomingSessions")}</p>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>{t("patient")}</th>
                <th>{t("appointment")}</th>
                <th> {t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedUpcoming.map((s) => {
                const patientName = s.userId?.userName || s.userName || "—";
                const { text, cls } = STATUS_LABEL[s.status] || {
                  text: s.status,
                  cls: "",
                };
                return (
                  <tr key={s._id}>
                    <td>{patientName}</td>
                    <td>{formatDate(s.sessionTime)}</td>
                    <td>
                      <span className={cls}>{text}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

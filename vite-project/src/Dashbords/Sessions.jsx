import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";
import "./session.css";

export default function Sessions() {
    const { t } = useLang();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://mind-space-ov3r.onrender.com/session/therapist", {
          headers: { Authorization: `dash ${token}` }
        });
        const data = res.data?.data || res.data;
        
        // Map backend format to component needs
        const mappedSessions = data.map(session => ({
          id: session._id,
          patient: session.userId?.userName || "Unknown",
          date: session.sessionTime || "N/A",
          status: session.status || "Pending",
          notes: session.notes || "No notes"
        }));
        
        setSessions(mappedSessions);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("⚠️ هل أنت متأكد من إلغاء/حذف هذه الجلسة؟")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://mind-space-ov3r.onrender.com/session/cancel/${sessionId}`,
        {},
        {
          headers: {
            Authorization: `dash ${token}`,
          },
        }
      );

      toast.success("🚫 تم إلغاء الجلسة بنجاح!");
      // Update the status of the canceled session to "canceled" in the local state
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: "canceled" } : s))
      );
    } catch (err) {
      console.error("Delete session error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "حدث خطأ أثناء إلغاء الجلسة.";
      toast.error(`❌ ${errorMsg}`);
    }
  };

  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status.toLowerCase() === "completed" || s.status.toLowerCase() === "confirmed").length,
    pending: sessions.filter(s => s.status.toLowerCase() === "pending" || s.status.toLowerCase() === "scheduled").length,
  };

  return (
    <div className="sessions-page">

      {/* Header */}
      <div className="sessions-header">
      <h2>{t("sessionsDashboard")}</h2>
        <p>{ t("sessionsSubtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <span>{t("totalSessions")}</span>
        </div>

        <div className="stat-card green">
          <h3>{stats.completed}</h3>
          <span>{t("completed")}</span>
        </div>

        <div className="stat-card orange">
          <h3>{stats.pending}</h3>
          <span>{t("pending")}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>{t("patient")}</th>
              <th>{t("date")}</th>
              <th>{t("status")}</th>
              <th>{t("notes")}</th>
              <th> {t("actions")}</th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session) => (
              <tr key={session.id}>
                <td>{session.patient}</td>
                <td>{session.date}</td>

                <td>
                  <span className={`status ${session.status.toLowerCase()}`}>
                    {session.status}
                  </span>
                </td>

                <td>{session.notes}</td>

                <td className="actions">
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/doctor-dashboard/session/${session.id}`, { state: session })}
                  >
                    {t("view")}
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                   {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
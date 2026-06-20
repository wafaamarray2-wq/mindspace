import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLang } from "../i18n/LanguageContext";
import "./sessiondetails.css";

export default function SessionDetails() {
  const { t } = useLang();
  const { id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [delayLoading, setDelayLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showDelayInput, setShowDelayInput] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [session, setSession] = useState(location.state || null);
  const [fetchLoading, setFetchLoading] = useState(!location.state);

  useEffect(() => {
    if (session) { setFetchLoading(false); return; }
    const fetchSession = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://mind-space-ov3r.onrender.com/session/therapist", {
          headers: { Authorization: `dash ${token}` }
        });
        const list = res.data?.data || res.data || [];
        const data = list.find((s) => s._id === id);
        if (data) {
          setSession({
            id: data._id,
            patient: data.userId?.userName || "Unknown",
            date: data.sessionTime || "N/A",
            status: data.status || "Pending",
            notes: data.notes || "No notes available."
          });
        }
      } catch (err) {
        console.error("Error fetching session details fallback:", err);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchSession();
  }, [id, session]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://mind-space-ov3r.onrender.com/session/confirm/${id}`,
        {},
        { headers: { Authorization: `dash ${token}` } }
      );
      toast.success(t("sessionConfirmed"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("sessionConfirmError"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelay = async () => {
    if (!newTime) { toast.warning(t("selectNewTime")); return; }
    setDelayLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://mind-space-ov3r.onrender.com/session/delay/${id}`,
        { newTime: new Date(newTime).toISOString() },
        { headers: { Authorization: `dash ${token}` } }
      );
      toast.success(t("sessionDelayed"));
      setShowDelayInput(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t("sessionDelayError"));
    } finally {
      setDelayLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://mind-space-ov3r.onrender.com/session/cancel/${id}`,
        {},
        { headers: { Authorization: `dash ${token}` } }
      );
      toast.success(t("sessionCancelled"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("sessionCancelError"));
    } finally {
      setCancelLoading(false);
    }
  };

  if (fetchLoading) return <h2 className="not-found">{t("loading")}</h2>;
  if (!session) return <h2 className="not-found">{t("sessionNotFound")}</h2>;

  return (
    <div className="details-page">

      <div className="details-header">
        <h2>{t("sessionOverview")}</h2>
        {/* <p>{t("sessionOverviewDesc")} #{session.id}</p> */}
      </div>

      <div className="details-card">
        <div className="top-section">
          <div>
            <h3>{session.patient}</h3>
            <span className={`status ${session.status.toLowerCase()}`}>
              {session.status}
            </span>
          </div>
          <div className="date-box">
            <p>{session.date}</p>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-box">
            <h4>{t("patientName")}</h4>
            <p>{session.patient}</p>
          </div>
          <div className="info-box">
            <h4>{t("sessionDate")}</h4>
            <p>{session.date}</p>
          </div>
          <div className="info-box">
            <h4>{t("status")}</h4>
            <p>{session.status}</p>
          </div>
        </div>

        <div className="notes-section">
          <h4>{t("doctorNotes")}</h4>
          <p>{session.notes}</p>
        </div>

        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button
            className="confirm-btn"
            onClick={handleConfirm}
            disabled={loading || delayLoading || cancelLoading}
            style={{ padding: "10px 20px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: loading || delayLoading || cancelLoading ? "not-allowed" : "pointer", fontSize: "16px" }}
          >
            {loading ? t("confirming") : t("confirmSession")}
          </button>

          <button
            className="delay-btn"
            onClick={() => setShowDelayInput(!showDelayInput)}
            disabled={loading || delayLoading || cancelLoading}
            style={{ padding: "10px 20px", backgroundColor: "#ffc107", color: "#333", border: "none", borderRadius: "5px", cursor: loading || delayLoading || cancelLoading ? "not-allowed" : "pointer", fontSize: "16px" }}
          >
            {t("delaySession")}
          </button>

          <button
            className="cancel-btn"
            onClick={handleCancel}
            disabled={loading || delayLoading || cancelLoading}
            style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "5px", cursor: loading || delayLoading || cancelLoading ? "not-allowed" : "pointer", fontSize: "16px" }}
          >
            {cancelLoading ? t("cancelling") : t("cancelSession")}
          </button>
        </div>

        {showDelayInput && (
          <div style={{ marginTop: "15px", display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
            />
            <button
              onClick={handleDelay}
              disabled={delayLoading}
              style={{ padding: "8px 15px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: delayLoading ? "not-allowed" : "pointer" }}
            >
              {delayLoading ? t("delaying") : t("saveNewTime")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
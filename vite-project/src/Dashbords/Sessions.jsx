import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./session.css";

export default function Sessions() {
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
          patient: session.patientId?.userName || "Unknown",
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

  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === "Confirmed" || s.status === "Completed").length,
    pending: sessions.filter(s => s.status === "Pending").length,
  };

  return (
    <div className="sessions-page">

      {/* Header */}
      <div className="sessions-header">
        <h2>Sessions Dashboard</h2>
        <p>Manage and track all patient sessions</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.total}</h3>
          <span>Total Sessions</span>
        </div>

        <div className="stat-card green">
          <h3>{stats.completed}</h3>
          <span>Completed</span>
        </div>

        <div className="stat-card orange">
          <h3>{stats.pending}</h3>
          <span>Pending</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <table className="sessions-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Actions</th>
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
                    onClick={() => navigate(`/session/${session.id}`)}
                  >
                    View
                  </button>
                  <button className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
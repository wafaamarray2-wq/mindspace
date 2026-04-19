import "./session.css";
import { useNavigate } from "react-router-dom";

export default function Sessions() {
  const navigate = useNavigate();

  const sessions = [
    { id: 1, patient: "Ali", date: "2024-02-10", status: "Completed", notes: "Routine check" },
    { id: 2, patient: "Sara", date: "2024-02-12", status: "Pending", notes: "Follow up" },
    { id: 3, patient: "Ahmed", date: "2024-02-15", status: "Cancelled", notes: "Missed appointment" },
    { id: 1, patient: "Ali", date: "2024-02-10", status: "Completed", notes: "Routine check" },
    { id: 2, patient: "Sara", date: "2024-02-12", status: "Pending", notes: "Follow up" },
    { id: 3, patient: "Ahmed", date: "2024-02-15", status: "Cancelled", notes: "Missed appointment" },
  ];

  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === "Completed").length,
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
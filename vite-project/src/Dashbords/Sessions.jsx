import "./session.css";
import { useNavigate } from "react-router-dom";
export default function Sessions() {
  const navigate = useNavigate();
  const sessions = [
    {
      id: 1,
      patient: "Ali",
      date: "2024-02-10",
      status: "Completed",
      notes: "Routine check",
    },
    {
      id: 2,
      patient: "Sara",
      date: "2024-02-12",
      status: "Pending",
      notes: "Follow up",
    },
    {
      id: 3,
      patient: "Ahmed",
      date: "2024-02-15",
      status: "Cancelled",
      notes: "Missed appointment",
    },
  ];

  return (
    <div className="sessions-container">
      <h2>Sessions</h2>

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
              <td>
              <button className="view-btn" onClick={() => navigate(`/session/${session.id}`)}>
                 View
              </button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
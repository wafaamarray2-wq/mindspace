import { useParams } from "react-router-dom";
import "./sessiondetails.css";

export default function SessionDetails() {
  const { id } = useParams();

  const sessions = [
    {
      id: "1",
      patient: "Ali",
      date: "2024-02-10",
      status: "Completed",
      notes: "Routine check, everything normal. Patient shows good progress and stable condition.",
    },
    {
      id: "2",
      patient: "Sara",
      date: "2024-02-12",
      status: "Pending",
      notes: "Needs follow-up visit. Recommend additional assessment for progress evaluation.",
    },
  ];

  const session = sessions.find((s) => s.id === id);

  if (!session) return <h2 className="not-found">Session Not Found</h2>;

  return (
    <div className="details-page">

      {/* Header */}
      <div className="details-header">
        <h2>Session Overview</h2>
        <p>Detailed information about patient session #{session.id}</p>
      </div>

      {/* Main Card */}
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

        {/* Info Grid */}
        <div className="info-grid">
          <div className="info-box">
            <h4>Patient Name</h4>
            <p>{session.patient}</p>
          </div>

          <div className="info-box">
            <h4>Session Date</h4>
            <p>{session.date}</p>
          </div>

          <div className="info-box">
            <h4>Status</h4>
            <p>{session.status}</p>
          </div>
        </div>

        {/* Notes */}
        <div className="notes-section">
          <h4>Doctor Notes</h4>
          <p>{session.notes}</p>
        </div>

      </div>
    </div>
  );
}
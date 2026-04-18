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
      notes: "Routine check, everything normal",
    },
    {
      id: "2",
      patient: "Sara",
      date: "2024-02-12",
      status: "Pending",
      notes: "Needs follow-up visit",
    },
  ];

  const session = sessions.find((s) => s.id === id);

  if (!session) return <h2>Session Not Found</h2>;

  return (
    <div className="details-container">
      <h2>Session Details</h2>

      <div className="details-card">
        <p><strong>Patient:</strong> {session.patient}</p>
        <p><strong>Date:</strong> {session.date}</p>
        <p><strong>Status:</strong> {session.status}</p>
        <p><strong>Notes:</strong> {session.notes}</p>
      </div>
    </div>
  );
}
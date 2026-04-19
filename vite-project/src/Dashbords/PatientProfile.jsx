import { useParams } from "react-router-dom";
import './patientprofile.css';

export default function PatientProfile() {
  const { id } = useParams();

  const patientsData = [
    {
      id: "1",
      name: "Ali",
      age: 30,
      gender: "Male",
      condition: "Stable",
      status: "Active",
      diseases: ["Diabetes"],
      medications: ["Metformin"],
      image: "https://i.pravatar.cc/150?img=1"
    },
    {
      id: "2",
      name: "Ahmed",
      age: 45,
      gender: "Male",
      condition: "Critical",
      status: "Inactive",
      diseases: ["Heart Disease"],
      medications: ["Aspirin"],
      image: "https://i.pravatar.cc/150?img=2"
    },
    {
      id: "3",
      name: "Sara",
      age: 28,
      gender: "Female",
      condition: "Stable",
      status: "Active",
      diseases: ["Asthma"],
      medications: ["Inhaler"],
      image: "https://i.pravatar.cc/150?img=3"
    },
  ];

  const patient = patientsData.find((p) => p.id === id);
const sessions = [
  { date: "2024-02-10", notes: "Regular check" },
  { date: "2024-03-01", notes: "Follow up" },
  { date: "2024-03-20", notes: "Improvement noticed" },
  { date: "2024-04-05", notes: "Medication updated" },
];
  if (!patient) {
    return <h2>Patient Not Found</h2>;
  }

  return (
    <div className="profile-container">

      {/* Header */}
      <div className="profile-header">
        <img src={patient.image} alt="patient" className="profile-img"/>

        <div>
          <h2>{patient.name}</h2>

          <span className={`badge ${patient.condition === "Stable" ? "stable" : "critical"}`}>
            {patient.condition}
          </span>

          <span className={`badge ${patient.status === "Active" ? "active" : "inactive"}`}>
            {patient.status}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="info-grid">
        <div className="card">
          <h3>Personal Info</h3>
          <p><strong>Age:</strong> {patient.age}</p>
          <p><strong>Gender:</strong> {patient.gender}</p>
        </div>

        <div className="card">
          <h3>Medical Info</h3>
          <p><strong>Diseases:</strong> {patient.diseases.join(", ")}</p>
          <p><strong>Medications:</strong> {patient.medications.join(", ")}</p>
        </div>
      </div>

      {/* Sessions */}
      <div className="card">
        <h3>Sessions</h3>

      <div className="sessions-list">
  {sessions.map((s, index) => (
    <div key={index} className="session-item">
      <p><strong>Date:</strong> {s.date}</p>
      <p><strong>Notes:</strong> {s.notes}</p>
    </div>
  ))}
</div>
<div className="card">
  <h3>Contact Info</h3>
  <p><strong>Phone:</strong> 01012345678</p>
  <p><strong>Email:</strong> patient@email.com</p>
</div>
<div className="card">
  <h3>Health Progress</h3>

  <div className="progress-bar">
    <div className="progress-fill"></div>
  </div>

  <p>Recovery: 70%</p>
</div>
      </div>

    </div>
  );
}
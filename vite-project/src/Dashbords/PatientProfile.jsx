import { useParams } from "react-router-dom";
import './patientprofile.css'
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
        image:
      "../images/photo_2026-03-04_02-40-47.jpg"
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
        image:
      "https://i.pravatar.cc/150"
    
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
     image:
      "https://i.pravatar.cc/150"
    },
  ];

  // نجيب المريض حسب id
  const patient = patientsData.find((p) => p.id === id);

  if (!patient) {
    return <h2>Patient Not Found</h2>;
  }

  return (
<div className="profile-container">
  <div className="profile-header card">
    <img src={patient.image} alt="patient"   className="profile-img"/>
  
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

  <div className="card">
    <h3>Personal Info</h3>
    <p>Age: {patient.age}</p>
    <p>Gender: {patient.gender}</p>
  </div>

  <div className="card">
    <h3>Medical Info</h3>
    <p>Diseases: {patient.diseases.join(", ")}</p>
    <p>Medications: {patient.medications.join(", ")}</p>
  </div>
</div>
  );
}
 
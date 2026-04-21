import { useNavigate } from "react-router-dom";

export default function Doctors() {
  const navigate = useNavigate();

  const doctors = [
    { id: 1, name: "Dr. Ahmed", spec: "Psychology" },
    { id: 2, name: "Dr. Sara", spec: "Therapist" },
  ];

  return (
    <div className="cards">
      {doctors.map((doc) => (
        <div className="card" key={doc.id}>
          <h3>{doc.name}</h3>
          <p>{doc.spec}</p>

         <button onClick={() => navigate(`/doctor/${doc.id}`)}>
  عرض الملف
</button>
        </div>
      ))}
    </div>
  );
}
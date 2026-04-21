import { useParams, useNavigate } from "react-router-dom";

export default function DoctorInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="card">
      <h2>Doctor {id}</h2>
      <p>Specialist in Mental Health</p>

      <button onClick={() => navigate(`/patient/book/${id}`)}>
        احجز جلسة
      </button>
    </div>
  );
}
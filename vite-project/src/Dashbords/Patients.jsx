import React from 'react'
import './patients.css'
import { useNavigate } from 'react-router-dom';
import Sic from "../images/photo_2026-03-04_02-40-47.jpg";

function Patients() {
  const navigate = useNavigate();

  const patientsData = [
    { id: "1", name: "Ali", condition: "Stable", status: "Active" },
    { id: "2", name: "Ahmed", condition: "Critical", status: "Inactive" },
    { id: "3", name: "Sara", condition: "Stable", status: "Active" },
    { id: "4", name: "Mona", condition: "Stable", status: "Active" },
    { id: "5", name: "Omar", condition: "Critical", status: "Inactive" },
  ];

  return (
    <div className='patients'>
      <h1>Patients</h1>

      <div className="boxes">
        {patientsData.map((patient) => (
          <div className="box" key={patient.id}>
            <div className="image">
              <img src={Sic} alt="" style={{ width: "80px" }} />
            </div>

            <div className="content">
              <h2>{patient.name}</h2>
              <p><strong>Condition:</strong> {patient.condition}</p>
              <p><strong>Status:</strong> {patient.status}</p>

              <button onClick={() => navigate(`/patient/${patient.id}`)}>
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Patients;

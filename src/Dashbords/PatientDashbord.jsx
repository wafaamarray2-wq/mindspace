// PatientDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./patientDashboard.css";

function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="patient-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Patient Panel</h2>
        <ul>
          <li><Link to="/patient-dashboard">Dashboard</Link></li>
          <li><Link to="/patient-therapists">Therapists</Link></li>
          <li><Link to="/patient-appointments">Appointments</Link></li>
          <li><Link to="/patient-chat">Chat</Link></li>
          <li><Link to="/patient-profile">Profile</Link></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h1>Welcome, {user?.name || "Patient"}</h1>
        </header>

        <div className="widgets">
          <div className="widget">
            <h3>Upcoming Sessions</h3>
            <p>2</p>
          </div>
          <div className="widget">
            <h3>Assigned Therapist</h3>
            <p>Dr. Ahmed</p>
          </div>
          <div className="widget">
            <h3>Messages</h3>
            <p>5</p>
          </div>
        </div>

        <section className="charts">
          <h2>Mental Health Overview</h2>
          <p>Graph placeholder</p>
        </section>
      </main>
    </div>
  );
}

export default PatientDashboard;

    
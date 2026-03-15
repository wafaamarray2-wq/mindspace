// DoctorDashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./doctorDashboard.css";

function DoctorDashboard() {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Doctor Panel</h2>
        <ul>
          <li><Link to="/doctor-dashboard">Dashboard</Link></li>
          <li><Link to="/doctor-patients">Patients</Link></li>
          <li><Link to="/doctor-appointments">Appointments</Link></li>
          <li><Link to="/doctor-chat">Chat</Link></li>
          <li><Link to="/doctor-profile">Profile</Link></li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h1>Welcome, Dr. [Name]</h1>
        </header>

        <div className="widgets">
          <div className="widget">
            <h3>Patients</h3>
            <p>12</p>
          </div>
          <div className="widget">
            <h3>Today's Appointments</h3>
            <p>5</p>
          </div>
          <div className="widget">
            <h3>Messages</h3>
            <p>3</p>
          </div>
        </div>

        <section className="charts">
          <h2>Appointments Overview</h2>
          <p>Graph placeholder</p>
        </section>
      </main>
    </div>
  );
}

export default DoctorDashboard;


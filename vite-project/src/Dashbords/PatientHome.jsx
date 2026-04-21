import "./patientHome.css";

export default function PatientHome() {
  return (
    <div className="home-container">

      <div className="home-card">
        <h2>Welcome Back 👋</h2>
        <p>Manage your sessions and explore doctors بسهولة</p>

        <div className="stats">

          <div className="stat-box">
            <h3>12</h3>
            <span>Sessions</span>
          </div>

          <div className="stat-box">
            <h3>5</h3>
            <span>Doctors</span>
          </div>

          <div className="stat-box">
            <h3>3</h3>
            <span>Messages</span>
          </div>

        </div>

      </div>

    </div>
  );
}
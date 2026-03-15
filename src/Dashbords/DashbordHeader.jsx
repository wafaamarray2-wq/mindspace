
import './dashbordHeader.css'
function DashboardHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="dashboard-header">
      <h2>Dashboard</h2>

      <div className="user-info">
        <span>Welcome, Dr. {user?.name}</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
        />
      </div>
    </div>
  );
}

export default DashboardHeader;

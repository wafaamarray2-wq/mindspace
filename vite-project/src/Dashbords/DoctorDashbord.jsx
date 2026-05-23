import { Outlet, NavLink } from "react-router-dom";
import { IoPerson } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { BiMessageSquareDots } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { MdEventNote } from "react-icons/md";
import { FiUsers, FiActivity, FiArchive } from "react-icons/fi";
import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./doc.css"; // ← استخدم الـ CSS الجديد

// ═══════════════════════════════════════════════
//  Context — للـ Feed والصفحات التانية
// ═══════════════════════════════════════════════
const DashContext = createContext(null);

export const useDashUser = () => useContext(DashContext);

// ═══════════════════════════════════════════════
export default function DoctorDashbord() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ================= GET USER DATA =================
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("❌ Token not found, please login");
        navigate("/login");
        return;
      }
      const res = await axios.get(
        "https://mind-space-ov3r.onrender.com/user/profile",
        { headers: { Authorization: `dash ${token}` } },
      );
      const userData = res.data.data;
      setUser(userData);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("❌ Session expired, please login again");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error("❌ Failed to load user data");
      }
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // ================= LOGOUT =================
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/logout",
        { flag: "logoutFromAllDevices" },
        { headers: { Authorization: `dash ${token}` } },
      );
      toast.success("تم تسجيل الخروج بنجاح 👋");
    } catch (err) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setTimeout(() => navigate("/login"), 1000);
  };

  const navClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <DashContext.Provider value={{ user, setUser, fetchUserData }}>
      <div className="dashbord">
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── HEADER ── */}
        <header className="dash-header">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="dash-header__brand">
            <span className="dash-header__logo">🧠</span>
            <span className="dash-header__name">MindSpace</span>
          </div>

          <div className="dash-header__right">
            <div className="dash-header__greeting">
              Welcome back,&nbsp;<strong>Dr. {user?.userName || "..."}</strong>
            </div>
            <div className="dash-header__avatar">
              {user?.pfp?.secure_url ? (
                <img src={user.pfp.secure_url} alt="" />
              ) : (
                <span>{user?.userName?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
          </div>
        </header>

        <div className="dash-content">
          {/* ── SIDEBAR ── */}
          <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
            <div className="head">
              {/* Profile Image */}
              <div className="image-box">
                {user?.pfp?.secure_url ? (
                  <div>
                    <img src={user.pfp.secure_url} alt="" style={{ borderRadius: '50%', width: '100px', height: '100px', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="empty-avatar">
                    {user?.userName?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                )}
              </div>

              {/* Doctor Info */}
              <h3>Dr. {user?.userName || "Doctor"}</h3>
              <p className="role-badge">{user?.role || "Therapist"}</p>
            </div>

            {/* Divider */}
            <div className="sidebar-divider" />

            {/* Navigation */}
            <nav>
              <ul>
                <li>
                  <NavLink to="home" className={navClass} end>
                    <span><IoHome /></span>
                    <h5>Home</h5>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="dash" className={navClass} end>
                    <span><IoHome /></span>
                    <h5>Dashboard</h5>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="profile" className={navClass}>
                    <span><IoPerson /></span>
                    <h5>Profile</h5>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="patients" className={navClass}>
                    <span><IoPerson /></span>
                    <h5>Patients</h5>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="message" className={navClass}>
                    <span><BiMessageSquareDots /></span>
                    <h5>Messages</h5>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="session" className={navClass}>
                    <span><MdEventNote /></span>
                    <h5>Sessions</h5>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="groups" className={navClass}>
                    <span><FiUsers /></span>
                    <h5>Groups</h5>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="setting" className={navClass}>
                    <span><MdSettings /></span>
                    <h5>Settings</h5>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="admin" className={navClass}>
                    <span><FiArchive /></span>
                    <h5>Admin</h5>
                  </NavLink>
                </li>

                {/* Logout Button */}
                <li className="log-out">
                  <button onClick={handleLogout}>
                    <span><MdLogout /></span>
                    <h5>Log Out</h5>
                  </button>
                </li>
              </ul>
            </nav>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main className="details">
            <Outlet />
          </main>
        </div>
      </div>
    </DashContext.Provider>
  );
}
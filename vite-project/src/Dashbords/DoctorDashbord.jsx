import { Outlet, NavLink } from "react-router-dom";
import { IoPerson } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { BiMessageSquareDots } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { MdEventNote } from "react-icons/md";
import { useEffect, useState, createContext, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./doc.css";

// ═══════════════════════════════════════════════
//  Context — بيتعمل هنا وبيتصدر عشان الـ Feed
//  والصفحات التانية تستخدمه
// ═══════════════════════════════════════════════
const DashContext = createContext(null);

export const useDashUser = () => useContext(DashContext);
//  ↑ ده الـ hook اللي هتستورده في TherapistFeed:
//  import { useDashUser } from "../Dashbords/DoctorDashboard";
//  const { user } = useDashUser();

// ═══════════════════════════════════════════════
export default function DoctorDashbord() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
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
        { headers: { Authorization: `dash ${token}` } }
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

  useEffect(() => { fetchUserData(); }, []);

  // ================= UPLOAD IMAGE =================
  const uploadImage = async (fileParam) => {
    const formData = new FormData();
    formData.append("pfp", fileParam || imageFile);
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://mind-space-ov3r.onrender.com/user/profile-picture",
        formData,
        { headers: { Authorization: `dash ${token}` } }
      );
      const newPfp = res.data?.data?.pfp || res.data?.pfp;
      if (newPfp?.secure_url) {
        setUser((prev) => ({
          ...prev,
          pfp: { ...newPfp, secure_url: newPfp.secure_url + "?t=" + Date.now() },
        }));
      }
      setPreview(null);
      await fetchUserData();
      toast.success("✅ Photo uploaded successfully");
    } catch (err) {
      console.log("upload error:", err.response?.data);
      if (err.response?.status === 401) { toast.error("❌ Session expired"); navigate("/login"); }
      else toast.error("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET IMAGE =================
  const resetImage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        "https://mind-space-ov3r.onrender.com/user/reset-profile-picture",
        {},
        { headers: { Authorization: `dash ${token}` } }
      );
      setUser((prev) => ({ ...prev, pfp: null }));
      setPreview(null);
      await fetchUserData();
      toast.success("✅ Photo removed successfully");
    } catch (err) {
      if (err.response?.status === 401) { toast.error("❌ Session expired"); navigate("/login"); }
      else toast.error("❌ Failed to remove photo");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGOUT =================
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/logout",
        { flag: "logoutFromAllDevices" },
        { headers: { Authorization: `dash ${token}` } }
      );
      toast.success("تم تسجيل الخروج بنجاح 👋");
    } catch (err) {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setTimeout(() => navigate("/login"), 1000);
  };

  const navClass = ({ isActive }) => isActive ? "active" : "";

  return (
    <DashContext.Provider value={{ user, setUser, fetchUserData }}>
      <div className="dashbord">
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── HEADER ── */}
        <header className="dash-header">
          <button
            className="hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <span /><span /><span />
          </button>

          <div className="dash-header__brand">
            <span className="dash-header__logo">🧠</span>
            <span className="dash-header__name">MindSpace</span>
          </div>

          <div className="dash-header__right">
            <div className="dash-header__greeting">
              Welcome back,&nbsp;<strong>{user?.userName || "..."}</strong>
            </div>
            <div className="dash-header__avatar">
              {user?.pfp?.secure_url
                ? <img src={user.pfp.secure_url} alt="avatar" />
                : <span>{user?.userName?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
          </div>
        </header>

        <div className="dash-content">

          {/* ── SIDEBAR ── */}
          <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>
            <div className="head">
              <div className="image-box">
                <label>
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setImageFile(file);
                      setPreview(URL.createObjectURL(file));
                      uploadImage(file);
                    }}
                  />
                  {preview || user?.pfp?.secure_url ? (
                    <img src={preview || user?.pfp?.secure_url} alt="doctor" />
                  ) : (
                    <div className="empty-avatar">{user?.userName?.charAt(0)}</div>
                  )}
                </label>
                {loading && (
                  <div className="loading">
                    <span /><span /><span />
                  </div>
                )}
              </div>

              <h3>Dr. {user?.userName || "Doctor"}</h3>
              <p>{user?.role || "Therapist"}</p>
              <button onClick={resetImage}>Remove Photo</button>
            </div>

            <nav>
              <ul>
                <li>
                  <NavLink to="home" className={navClass} end>
                    <IoHome /> Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="dash" className={navClass} end>
                    <IoHome /> Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="profile" className={navClass}>
                    <IoPerson /> Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="patients" className={navClass}>
                    <IoPerson /> Patients
                  </NavLink>
                </li>
                <li>
                  <NavLink to="message" className={navClass}>
                    <BiMessageSquareDots /> Messages
                  </NavLink>
                </li>
                <li>
                  <NavLink to="session" className={navClass}>
                    <MdEventNote /> Sessions
                  </NavLink>
                </li>
                <li>
                  <NavLink to="setting" className={navClass}>
                    <MdSettings /> Settings
                  </NavLink>
                </li>

                <li className="log-out">
                  <button onClick={handleLogout}>
                    <MdLogout />
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
import { Outlet } from "react-router-dom";
import { IoPerson } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { BiMessageSquareDots } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./doc.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function PatientDashbord() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");

  // ================= GET USER =================
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

  useEffect(() => {
    fetchUserData();
  }, []);

  // ================= CLOSE SIDEBAR ON RESIZE =================
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          pfp: {
            ...newPfp,
            secure_url: newPfp.secure_url + "?t=" + Date.now(),
          },
        }));
      }
      setPreview(null);
      await fetchUserData();
      toast.success("✅ Photo uploaded successfully");
    } catch (err) {
      console.log("upload error:", err.response?.data);
      if (err.response?.status === 401) {
        toast.error("❌ Session expired");
        navigate("/login");
      } else {
        toast.error("❌ Upload failed");
      }
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
      if (err.response?.status === 401) {
        toast.error("❌ Session expired");
        navigate("/login");
      } else {
        toast.error("❌ Failed to remove photo");
      }
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
        {
          headers: { Authorization: `dash ${token || ""}` },
        }
      );
      toast.success("تم تسجيل الخروج بنجاح 👋");
    } catch (err) {
      console.log(err);
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  // ================= CLOSE SIDEBAR ON LINK CLICK =================
  const handleNavLinkClick = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashbord">
      {/* ── MOBILE OVERLAY ── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* ── HEADER ── */}
      <header className="dash-header">
        <button
          className={`hamburger${sidebarOpen ? " active" : ""}`}
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen}
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
            Welcome back,&nbsp;<strong>{user?.userName || "..."}</strong>
          </div>
          <div className="dash-header__avatar">
            {user?.pfp?.secure_url ? (
              <img src={user.pfp.secure_url} alt="avatar" />
            ) : (
              <span>{user?.userName?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="dash-content">
        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          {/* Profile block */}
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
                  accept="image/*"
                />

                {preview || user?.pfp?.secure_url ? (
                  <div className="image-box__img">
                    <img src={preview || user?.pfp?.secure_url} alt="profile" />
                  </div>
                ) : (
                  <div className="empty-avatar">
                    {user?.userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}

                {/* Camera overlay on hover */}
                <div className="image-box__overlay">
                  <span>📷</span>
                </div>
              </label>

              {loading && (
                <div className="loading">
                  <span />
                  <span />
                  <span />
                </div>
              )}
            </div>

            <h3>{user?.userName || "Loading..."}</h3>
            <p className="role-badge">{user?.role || "User"}</p>

            {user?.pfp?.secure_url && (
              <button className="remove-photo-btn" onClick={resetImage}>
                Remove Photo
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="sidebar-divider" />

          {/* Navigation */}
          <nav>
            <ul>
              {/* <li>
                <Link to="/" onClick={handleNavLinkClick}>
                  <span>
                    <IoHome />
                  </span>
                  <h5>Home</h5>
                </Link>
              </li> */}

              <li>
                <Link to="/PatientHome" onClick={handleNavLinkClick}>
                  <span>
                    <IoHome />
                  </span>
                  <h5>Home</h5>
                </Link>
              </li>

              {/* <li>
                <Link to="profile" onClick={handleNavLinkClick}>
                  <span>
                    <IoPerson />
                  </span>
                  <h5>My Profile</h5>
                </Link>
              </li> */}

              <li>
                <Link to="/doctor" onClick={handleNavLinkClick}>
                  <span>
                    <IoPerson />
                  </span>
                  <h5>Doctors</h5>
                </Link>
              </li>

              <li>
                <Link to="message" onClick={handleNavLinkClick}>
                  <span>
                    <BiMessageSquareDots />
                  </span>
                  <h5>Messages</h5>
                </Link>
              </li>

              <li>
                <Link to="groups" onClick={handleNavLinkClick}>
                  <span>
                    <FiUsers />
                  </span>
                  <h5>Groups</h5>
                </Link>
              </li>

              <li>
                <Link to="setting" onClick={handleNavLinkClick}>
                  <span>
                    <MdSettings />
                  </span>
                  <h5>Settings</h5>
                </Link>
              </li>

              {/* Logout */}
              <li className="log-out">
                <button onClick={handleLogout} aria-label="Logout">
                  <span>
                    <MdLogout />
                  </span>
                  <h5>Log Out</h5>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* ── PAGE CONTENT ── */}
        <main className="details">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
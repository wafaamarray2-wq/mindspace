import { Outlet } from "react-router-dom";
import Sic from "..//images/photo_2026-03-04_02-40-47.jpg";
import { IoPerson } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { BiMessageSquareDots } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { Link } from "react-router-dom";
import "./doc.css";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import { toast } from "react-toastify";

export default function PatientDashbord() {
  const navigate = useNavigate();
  const { user, setUser, fetchUser } = useUser();

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── NEW UI state: mobile sidebar toggle ──
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem("token");

  const authHeader = {
    Authorization: `dash ${token}`,
  };

  // ================= GET USER =================
  const fetchUserData = async () => {
    try {
      const res = await axios.get(
        "https://mind-space-ov3r.onrender.com/user/profile",
        { headers: authHeader }
      );
      setUser(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (token) fetchUserData();
  }, []);

  // ================= UPLOAD IMAGE =================
  const uploadImage = async (fileParam) => {
    const formData = new FormData();
    formData.append("pfp", fileParam || imageFile);

    try {
      setLoading(true);

      const res = await axios.post(
        "https://mind-space-ov3r.onrender.com/user/profile-picture",
        formData,
        {
          headers: {
            ...authHeader,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newPfp = res.data.data.pfp;

      setUser((prev) => ({
        ...prev,
        pfp: {
          ...newPfp,
          secure_url: newPfp.secure_url + "?t=" + Date.now(),
        },
      }));

      setPreview(null);
      await fetchUser();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= RESET IMAGE =================
  const resetImage = async () => {
    await axios.patch(
      "https://mind-space-ov3r.onrender.com/user/reset-profile-picture",
      {},
      { headers: authHeader }
    );

    setUser((prev) => ({ ...prev, pfp: null }));
    setPreview(null);
    await fetchUser();
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

  return (
    <div className="dashbord">

      {/* ── MOBILE OVERLAY (closes sidebar on tap) ── */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── TOP HEADER BAR ── */}
      <header className="dash-header">
        {/* Hamburger for mobile */}
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
            Welcome back,&nbsp;
            <strong>{user?.userName || "..."}</strong>
          </div>
          <div className="dash-header__avatar">
            {user?.pfp?.secure_url
              ? <img src={user.pfp.secure_url} alt="avatar" />
              : <span>{user?.userName?.charAt(0)?.toUpperCase()}</span>
            }
          </div>
        </div>
      </header>

      {/* ── MAIN LAYOUT ── */}
      <div className="dash-content">

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar${sidebarOpen ? " sidebar--open" : ""}`}>

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
                />

                {preview || user?.pfp?.secure_url ? (
                  <img src={preview || user?.pfp?.secure_url} alt="profile" />
                ) : (
                  <div className="empty-avatar">
                    {user?.userName?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                {/* Camera overlay on hover */}
                <div className="image-box__overlay">
                  <span>📷</span>
                </div>
              </label>

              {loading && <span className="loading"><span/><span/><span/></span>}
            </div>

            <h3>{user?.userName || "Loading..."}</h3>
            <p className="role-badge">{user?.role || "User"}</p>

            <button className="remove-photo-btn" onClick={resetImage}>
              Remove Photo
            </button>
          </div>

          {/* Divider */}
          <div className="sidebar-divider" />

          {/* Navigation */}
          <nav>
            <ul>
              <li>
                <Link to="/">
                  <span><IoHome /></span>
                  <h5>Home</h5>
                </Link>
              </li>

              <li>
                <Link to="/PatientHome">
                  <span><IoHome /></span>
                  <h5>PatientHome</h5>
                </Link>
              </li>
              <li>
  <Link to="profile">
    <span><IoPerson /></span>
    <h5>My Profile</h5>
  </Link>
</li>

              <li>
                <Link to="/doctor">
                  <span><IoPerson /></span>
                  <h5>Doctors</h5>
                </Link>
              </li>

              <li>
                <Link to="message">
                  <span><BiMessageSquareDots /></span>
                  <h5>Messages</h5>
                </Link>
              </li>

              <li>
                <Link to="setting">
                  <span><MdSettings /></span>
                  <h5>Settings</h5>
                </Link>
              </li>

              {/* Logout */}
              <li className="log-out">
                <button onClick={handleLogout}>
                  <span><MdLogout /></span>
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
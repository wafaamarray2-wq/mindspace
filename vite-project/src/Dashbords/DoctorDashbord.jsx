import { Outlet } from "react-router-dom";
import TherapistPhoto from "..//images/photo_2026-03-04_02-40-47.jpg";
import { IoPerson } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import { MdSettings } from "react-icons/md";
import { BiMessageSquareDots } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { Link } from "react-router-dom";
import "./doc.css";
import { MdEventNote } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";
import { toast } from "react-toastify";

export default function DoctorDashbord() {
  const navigate = useNavigate();
  const { user, setUser, fetchUser } = useUser();

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

      // ✅ استخدم POST /user/profile بدلاً من GET
      const res = await axios.get(
        "https://mind-space-ov3r.onrender.com/user/profile",
        // ✅ ممكن تبعت الـ ID هنا لو احتاج
        {
          headers: {
            Authorization: `dash ${token}`,
          },
        },
      );

      console.log("✅ Profile loaded:", res.data);

      // ✅ استخرج البيانات
      const userData = res.data?.data || res.data;
      setUser(userData);
    } catch (err) {
      console.log("❌ Error fetching profile:", err);

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

  // ================= UPLOAD IMAGE =================
  const uploadImage = async (fileParam) => {
    const formData = new FormData();
    formData.append("pfp", fileParam || imageFile);

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      // ✅ استخدم Bearer + JWT
      const res = await axios.post(
        "https://mind-space-ov3r.onrender.com/user/profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const newPfp = res.data?.data?.pfp;

      setUser((prev) => ({
        ...prev,
        pfp: {
          ...newPfp,
          secure_url: newPfp.secure_url + "?t=" + Date.now(),
        },
      }));

      setPreview(null);
      await fetchUserData();

      toast.success("✅ Photo uploaded successfully");
    } catch (err) {
      console.log("❌ Upload error:", err);

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

      // ✅ استخدم Bearer + JWT
      await axios.patch(
        "https://mind-space-ov3r.onrender.com/user/reset-profile-picture",
        {},
        {
          headers: {
            Authorization: `dash ${token}`,
          },
        },
      );

      setUser((prev) => ({ ...prev, pfp: null }));
      setPreview(null);
      await fetchUserData();

      toast.success("✅ Photo removed successfully");
    } catch (err) {
      console.log("❌ Reset error:", err);

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

  return (
    <div className="dashbord">
      {/* overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* header */}
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


      <div className="dash-content">
        {/* sidebar */}
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
                  <div className="empty-avatar">
                    {user?.userName?.charAt(0)}
                  </div>
                )}
              </label>

              {loading && <p>Loading...</p>}
            </div>

            <h3> Dr. {user?.userName || "Doctor"}</h3>
            <p>{user?.role || "professional"}</p>

            <button onClick={resetImage}>Remove Photo</button>
          </div>

          <nav>
            <ul>
              <li>
                <Link to="/">
                  <IoHome /> Home
                </Link>
              </li>

              <li>
                <Link to="dash">
                  <IoHome /> Dashboard
                </Link>
              </li>

              <li>
                <Link to="patients">
                  <IoPerson /> Patients
                </Link>
              </li>

              <li>
                <Link to="message">
                  <BiMessageSquareDots /> Messages
                </Link>
              </li>

              <li>
            
                <Link to="session">    
                <MdEventNote />
                Sessions</Link>
              </li>

              <li>
                <Link to="setting">
                  <MdSettings /> Settings
                </Link>
              </li>

           <li className="log-out">
                <button onClick={handleLogout}>
                  <span><MdLogout /></span>
                  <h5>Log Out</h5>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* content */}
        <main className="details">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

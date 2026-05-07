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

// 🔥 NEW
import { useUser } from "../UserContext";

export default function PatientDashbord() {
  const { user, setUser, fetchUser } = useUser();

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const authHeader = {
    Authorization: `dash ${token}`,
  };

  // ================= GET USER =================
  const fetchUserData = async () => {
    try {
      const res = await axios.get(
        "https://mind-space-ov3r.onrender.com/user/profile",
        {
          headers: authHeader,
        }
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

      // // 🔥 FIX
      // window.location.reload();

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
      {
        headers: authHeader,
      }
    );

    setUser((prev) => ({
      ...prev,
      pfp: null,
    }));

    setPreview(null);

    await fetchUser();

    // // 🔥 FIX
    // window.location.reload();
  };

  return (
    <div className="dashbord">
      <div className="dash-content">
        <div className="sidebar">
          <div className="head">

            {/* IMAGE */}
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
                  <img
                    src={preview || user?.pfp?.secure_url}
                    alt="profile"
                  />
                ) : (
                  <div className="empty-avatar">
                    {user?.userName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </label>

              {loading && <span className="loading">...</span>}
            </div>

            <h3>{user?.userName || "Loading..."}</h3>
            <p>{user?.role || "User"}</p>

            <button onClick={resetImage}>Remove Photo</button>

          </div>

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

            <li className="log-out">
              <Link to="/logout">
                <span><MdLogout /></span>
                <h5>Log Out</h5>
              </Link>
            </li>
          </ul>

        </div>

        <div className="details">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
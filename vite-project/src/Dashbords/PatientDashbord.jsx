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

export default function PatientDashbord() {
  const [user, setUser] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("https://mind-space-ov3r.onrender.com/user/profile", {
        headers: {
          Authorization: `dash ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const uploadImage = async () => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("pfp", imageFile);

    const res = await axios.post(
      "https://mind-space-ov3r.onrender.com/user/profile-picture",
      formData,
      {
        headers: {
          Authorization: `dash ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setUser((prev) => ({
      ...prev,
      pfp: res.data.data.pfp,
    }));
  };

  const resetImage = async () => {
    const token = localStorage.getItem("token");

    await axios.patch(
      "https://mind-space-ov3r.onrender.com/user/reset-profile-picture",
      {},
      {
        headers: {
          Authorization: `dash ${token}`,
        },
      }
    );

    setUser((prev) => ({
      ...prev,
      pfp: null,
    }));
  };

  return (
    <div className="dashbord">
      <div className="dash-content">
        <div className="sidebar">
          <div className="head">

            {/* ================= IMAGE (FIXED ONLY HERE) ================= */}
            <div className="image-prof">
              <label>
                <input
                  type="file"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />

                {user?.pfp?.secure_url ? (
                  <img
                    src={user.pfp.secure_url}
                    alt="profile"
                  />
                ) : (
                  <div className="empty-avatar">
                    {user?.userName?.charAt(0)?.toUpperCase()}
                  </div>
                )}
              </label>
            </div>

            <h3>{user?.userName || "Loading..."}</h3>
            <p>{user?.role || "User"}</p>

            <button onClick={uploadImage}>Upload</button>
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
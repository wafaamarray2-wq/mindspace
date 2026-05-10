import { useState, useEffect } from "react";
import axios from "axios";
import "./settings.css";

export default function SettingPatients() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    newPassword: "",
  });

  const [image, setImage] = useState(null);

  const BASE_URL = "https://mind-space-ov3r.onrender.com";

  const token = localStorage.getItem("token");

  // ✅ Authorization FIX (no empty header)
  const getAuthHeader = () => {
    if (!token) return null;
    return { Authorization: `dash ${token}` };
  };

  // ================= GET PROFILE =================
  useEffect(() => {
    const getProfile = async () => {
      try {
        const headers = getAuthHeader();
        if (!headers) return;

        const res = await axios.get(`${BASE_URL}/user/profile`, {
          headers,
        });

        setForm({
          name: res.data.userName || "",
          email: res.data.email || "",
          password: "",
          newPassword: "",
        });
      } catch (err) {
        const msg = err.response?.data?.message;

        console.log("Get profile error:", err.response?.data || err.message);

        if (msg === "jwt expired") {
          localStorage.removeItem("token");
          window.location.reload();
        }
      }
    };

    if (token) getProfile();
  }, [token]);

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= IMAGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  // ================= UPDATE USER =================
  const handleSave = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) {
        alert("Please login again");
        return;
      }

      const payload = {
        userName: form.name,
        password: form.newPassword || form.password,
      };

      const res = await axios.put(
        `${BASE_URL}/user/update-user`,
        payload,
        {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        }
      );

      setForm((prev) => ({
        ...prev,
        name: res.data.user?.userName || prev.name,
      }));

      alert("Profile updated successfully ✅");
    } catch (err) {
      console.log("Update error:", err.response?.data || err.message);

      const msg = err.response?.data?.message;

      if (msg === "jwt expired") {
        localStorage.removeItem("token");
        window.location.reload();
      }

      alert(msg || "Update failed ❌");
    }
  };

  return (
    <div className="page">
      <div className="layout-center">

        {/* CONTENT ONLY (no side) */}
        <div className="content-set full-width">

          <h1>Patient Settings</h1>

          <div className="grid">
            <div className="box-set">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="box-set">
              <label>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled
              />
            </div>

            <div className="box full">
              <label>Current Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="box full">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button className="set-btn" onClick={handleSave}>
            Save Changes
          </button>

        </div>
      </div>
    </div>
  );
}
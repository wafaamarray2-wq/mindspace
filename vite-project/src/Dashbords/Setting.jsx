import { useEffect, useState } from "react";
import axios from "axios";
import "./settings.css";

export default function Settings() {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  // ── UI only: show/hide password ──
  const [showPass, setShowPass] = useState(false);

  const token = localStorage.getItem("token");

  // ===== GET USER =====
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(
          "https://mind-space-ov3r.onrender.com/user/profile",
          { headers: { Authorization: `dash ${token}` } }
        );
        console.log("Current user:", res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, []);

  // ===== HANDLE CHANGE =====
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===== UPDATE USER =====
  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.put(
        "https://mind-space-ov3r.onrender.com/user/update-user",
        { userName: form.userName, email: form.email, password: form.password },
        { headers: { Authorization: `dash ${token}` } }
      );
      alert("Profile updated successfully ✅");
      setForm({ userName: "", email: "", password: "" });
    } catch (err) {
      console.log(err);
      alert("Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="layout">
        <div className="content-set">

          {/* ── Page header ── */}
          <div className="settings-header">
            <div className="settings-header__icon" aria-hidden="true">⚙️</div>
            <div>
              <h1>Account Settings</h1>
              <p className="settings-header__sub">
                Update your name, email or password below
              </p>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="settings-divider" aria-hidden="true" />

          {/* ── Section label ── */}
          <p className="settings-section-label">
            <span className="settings-section-label__bar" aria-hidden="true" />
            Personal Information
          </p>

          <div className="grid">

            {/* NAME */}
            <div className="box-set">
              <label htmlFor="set-name">
                <span className="label-icon" aria-hidden="true">👤</span>
                Name
              </label>
              <div className="input-wrap">
                <input
                  id="set-name"
                  name="userName"
                  value={form.userName}
                  onChange={handleChange}
                  placeholder="Enter new name"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="box-set">
              <label htmlFor="set-email">
                <span className="label-icon" aria-hidden="true">✉️</span>
                Email
              </label>
              <div className="input-wrap">
                <input
                  id="set-email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter new email"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="box full">
              <label htmlFor="set-pass">
                <span className="label-icon" aria-hidden="true">🔒</span>
                Password
              </label>
              <div className="input-wrap input-wrap--password">
                <input
                  id="set-pass"
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                {/* Toggle visibility — UI only, no state impact on form */}
                <button
                  type="button"
                  className="pass-toggle"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              <p className="input-hint">
                Min 8 characters — leave blank to keep current password
              </p>
            </div>

          </div>

          {/* ── Save button ── */}
          <button
            className="set-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading
              ? <><span className="set-btn__spinner" aria-hidden="true" /> Saving...</>
              : <><span aria-hidden="true">💾</span> Save Changes</>
            }
          </button>

        </div>
      </div>
    </div>
  );
}
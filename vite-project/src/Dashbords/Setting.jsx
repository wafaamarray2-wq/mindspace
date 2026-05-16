import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./settings.css";

const BASE_URL = "https://mind-space-ov3r.onrender.com";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return { Authorization: `dash ${token}` };
}

export default function Settings() {
  const role = localStorage.getItem("role"); // "therapist" | "patient"

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [form, setForm] = useState({ userName: "", password: "", newPassword: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  /* ─── GET PROFILE ─────────────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers = getAuthHeader();
        if (!headers) return;

        const res = await axios.get(`${BASE_URL}/user/profile`, { headers });
        const data = res.data?.data || res.data;

        setProfile({
          name: data.userName || "",
          email: data.email || "",
        });

        setForm((prev) => ({ ...prev, userName: data.userName || "" }));
        setTwoFaEnabled(data.twoFactorEnabled || false);
      } catch (err) {
        console.log(err.response?.data || err);
        if (err.response?.data?.message === "jwt expired") {
          localStorage.removeItem("token");
          window.location.reload();
        }
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ─── UPDATE NAME/PASSWORD ────────── */
  const handleSave = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error("❌ New passwords don't match");
      return;
    }

    if (!form.password) {
      toast.error("❌ Current password is required");
      return;
    }

    try {
      setLoading(true);
      const headers = getAuthHeader();

      const payload = { userName: form.userName, password: form.password };
      if (form.newPassword) payload.newPassword = form.newPassword;

      await axios.put(`${BASE_URL}/user/update-user`, payload, {
        headers: { ...headers, "Content-Type": "application/json" },
      });

      setProfile((prev) => ({ ...prev, name: form.userName }));
      setForm((prev) => ({ ...prev, password: "", newPassword: "", confirmPassword: "" }));
      toast.success("✅ Profile updated successfully");
    } catch (err) {
      console.log(err.response?.data || err);
      toast.error(err.response?.data?.message || "❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ─── SEND OTP ────────────────────── */
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.get(`${BASE_URL}/auth/send-otp-2fa`, { headers });
      setOtpSent(true);
      toast.success("✅ OTP sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ─── ENABLE 2FA ──────────────────── */
  const handleEnable2FA = async () => {
    if (!otp.trim()) { toast.error("❌ Enter the OTP first"); return; }
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.post(
        `${BASE_URL}/auth/enable-2fa`,
        { otp },
        { headers: { ...headers, "Content-Type": "application/json" } }
      );
      setTwoFaEnabled(true);
      setOtp("");
      setOtpSent(false);
      toast.success("✅ 2FA enabled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ─── DISABLE 2FA ─────────────────── */
  const handleDisable2FA = async () => {
    if (!otp.trim()) { toast.error("❌ Enter the OTP first"); return; }
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.post(
        `${BASE_URL}/auth/disable-2fa`,
        { otp },
        { headers: { ...headers, "Content-Type": "application/json" } }
      );
      setTwoFaEnabled(false);
      setOtp("");
      setOtpSent(false);
      toast.success("✅ 2FA disabled");
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ─── LOGOUT FROM ALL DEVICES ─────── */
  const handleLogoutAll = async () => {
    if (!window.confirm("Logout from all devices?")) return;
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.post(
        `${BASE_URL}/auth/logout`,
        { flag: "logoutFromAllDevices" },
        { headers: { ...headers, "Content-Type": "application/json" } }
      );
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed");
    } finally {
      setLoading(false);
    }
  };

  /* ─── DEACTIVATE ACCOUNT ──────────── */
  const handleDeactivate = async () => {
    if (!window.confirm("Are you sure you want to deactivate your account? This cannot be undone.")) return;
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.delete(`${BASE_URL}/user/deactivate`, { headers });
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to deactivate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="layout-center">
        <div className="content-set full-width">

          {/* ── HEADER ── */}
          <div className="settings-header">
            <div className="settings-header__icon">⚙️</div>
            <div>
              <h1>{role === "therapist" ? "Therapist" : "Patient"} Settings</h1>
              <p className="settings-header__sub">
                Manage your account — {profile.email}
              </p>
            </div>
          </div>
          <div className="settings-divider" />

          {/* ══ SECTION 1: PROFILE INFO ══ */}
          <div className="settings-section-label">
            <span className="settings-section-label__bar" />
            Profile Information
          </div>

          <div className="grid">
            <div className="box-set">
              <label>👤 Display Name</label>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                placeholder="Your name"
              />
            </div>

            <div className="box-set">
              <label>✉️ Email</label>
              <input value={profile.email} disabled />
            </div>

            <div className="box full">
              <label>🔒 Current Password <span style={{ color: "red" }}>*</span></label>
              <div className="input-wrap input-wrap--password">
                <button
                  className="pass-toggle"
                  onClick={() => setShowPass((p) => ({ ...p, current: !p.current }))}
                >
                  {showPass.current ? "🙈" : "👁️"}
                </button>
                <input
                  type={showPass.current ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Required to save changes"
                />
              </div>
              <p className="input-hint">Required to update your name or password</p>
            </div>

            <div className="box-set">
              <label>🔑 New Password</label>
              <div className="input-wrap input-wrap--password">
                <button
                  className="pass-toggle"
                  onClick={() => setShowPass((p) => ({ ...p, new: !p.new }))}
                >
                  {showPass.new ? "🙈" : "👁️"}
                </button>
                <input
                  type={showPass.new ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Leave empty to keep current"
                />
              </div>
            </div>

            <div className="box-set">
              <label>🔑 Confirm New Password</label>
              <div className="input-wrap input-wrap--password">
                <button
                  className="pass-toggle"
                  onClick={() => setShowPass((p) => ({ ...p, confirm: !p.confirm }))}
                >
                  {showPass.confirm ? "🙈" : "👁️"}
                </button>
                <input
                  type={showPass.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                />
              </div>
            </div>
          </div>

          <button className="set-btn" onClick={handleSave} disabled={loading}>
            {loading
              ? <><span className="set-btn__spinner" /> Saving...</>
              : "💾 Save Changes"
            }
          </button>

          <div className="settings-divider" style={{ marginTop: 32 }} />

          {/* ══ SECTION 2: TWO-FACTOR AUTH ══ */}
          <div className="settings-section-label">
            <span className="settings-section-label__bar" />
            Two-Factor Authentication (2FA)
          </div>

          <div className="grid">
            <div className="box full">
              <label>
                🛡️ 2FA Status —{" "}
                <span style={{ color: twoFaEnabled ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                  {twoFaEnabled ? "Enabled ✅" : "Disabled ❌"}
                </span>
              </label>
              <p className="input-hint">
                {twoFaEnabled
                  ? "Your account is protected with 2FA. Enter OTP to disable it."
                  : "Add an extra layer of security. Send OTP to your email to enable."}
              </p>
            </div>

            {!otpSent ? (
              <div className="box full">
                <button className="set-btn" onClick={handleSendOtp} disabled={loading}>
                  {loading
                    ? <><span className="set-btn__spinner" /> Sending...</>
                    : "📧 Send OTP to Email"
                  }
                </button>
              </div>
            ) : (
              <>
                <div className="box full">
                  <label>🔢 Enter OTP</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit code from your email"
                    maxLength={6}
                  />
                </div>

                <div className="box full" style={{ display: "flex", gap: 12 }}>
                  {!twoFaEnabled ? (
                    <button className="set-btn" onClick={handleEnable2FA} disabled={loading}>
                      {loading ? <><span className="set-btn__spinner" /> Enabling...</> : "✅ Enable 2FA"}
                    </button>
                  ) : (
                    <button
                      className="set-btn"
                      onClick={handleDisable2FA}
                      disabled={loading}
                      style={{ background: "#ef4444" }}
                    >
                      {loading ? <><span className="set-btn__spinner" /> Disabling...</> : "❌ Disable 2FA"}
                    </button>
                  )}
                  <button
                    className="set-btn"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    style={{ background: "#94a3b8", boxShadow: "none" }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="settings-divider" style={{ marginTop: 32 }} />

          {/* ══ SECTION 3: DANGER ZONE ══ */}
          <div className="settings-section-label">
            <span className="settings-section-label__bar" style={{ background: "#ef4444" }} />
            Danger Zone
          </div>

          <div className="grid">
            <div className="box-set">
              <label>🚪 Logout from all devices</label>
              <p className="input-hint">This will end all active sessions on all devices.</p>
              <button
                className="set-btn"
                onClick={handleLogoutAll}
                disabled={loading}
                style={{ background: "#f97316", boxShadow: "0 4px 20px rgba(249,115,22,0.30)" }}
              >
                Logout from All Devices
              </button>
            </div>

            <div className="box-set">
              <label>🗑️ Deactivate Account</label>
              <p className="input-hint">Permanently deactivate your account. This cannot be undone.</p>
              <button
                className="set-btn"
                onClick={handleDeactivate}
                disabled={loading}
                style={{ background: "#ef4444", boxShadow: "0 4px 20px rgba(239,68,68,0.30)" }}
              >
                Deactivate Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
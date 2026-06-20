import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLang } from "../i18n/LanguageContext";
import "./settings.css";

const BASE_URL = "https://mind-space-ov3r.onrender.com";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return { Authorization: `dash ${token}` };
}

export default function Settings() {
  const { t } = useLang();
  const role = localStorage.getItem("role");

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [form, setForm] = useState({
    userName: "",
    phoneNumber: "",
    sessionFee: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const headers = getAuthHeader();
        if (!headers) return;
        const res = await axios.get(`${BASE_URL}/user/profile`, { headers });
        const data = res.data?.data || res.data;
        setProfile({ name: data.userName || "", email: data.email || "" });
        setForm((prev) => ({
          ...prev,
          userName: data.userName || "",
          phoneNumber: data.phoneNumber || "",
          sessionFee: data.sessionFee || "",
        }));
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

  const handleSave = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error(t("passwordsMismatch"));
      return;
    }
    if (!form.password) {
      toast.error(t("currentPasswordRequired"));
      return;
    }
    try {
      setLoading(true);
      const headers = getAuthHeader();
      const payload = {
        userName: form.userName,
        phoneNumber: form.phoneNumber,
        sessionFee: form.sessionFee,
        password: form.password,
      };
      if (form.newPassword) payload.newPassword = form.newPassword;
      await axios.put(`${BASE_URL}/user/update-user`, payload, {
        headers: { ...headers, "Content-Type": "application/json" },
      });
      setProfile((prev) => ({ ...prev, name: form.userName }));
      setForm((prev) => ({ ...prev, password: "", newPassword: "", confirmPassword: "" }));
      toast.success(t("profileUpdated"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.get(`${BASE_URL}/auth/send-otp-2fa`, { headers });
      setOtpSent(true);
      toast.success(t("otpSent"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("otpFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!otp.trim()) { toast.error(t("enterOtp")); return; }
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.post(`${BASE_URL}/auth/enable-2fa`, { otp },
        { headers: { ...headers, "Content-Type": "application/json" } }
      );
      setTwoFaEnabled(true);
      setOtp(""); setOtpSent(false);
      toast.success(t("twoFAEnabled"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("invalidOtp"));
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!otp.trim()) { toast.error(t("enterOtp")); return; }
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.post(`${BASE_URL}/auth/disable-2fa`, { otp },
        { headers: { ...headers, "Content-Type": "application/json" } }
      );
      setTwoFaEnabled(false);
      setOtp(""); setOtpSent(false);
      toast.success(t("twoFADisabled"));
    } catch (err) {
      toast.error(err.response?.data?.message || t("invalidOtp"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm(t("logoutAllConfirm"))) return;
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.post(`${BASE_URL}/auth/logout`,
        { flag: "logoutFromAllDevices" },
        { headers: { ...headers, "Content-Type": "application/json" } }
      );
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.message || t("failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm(t("deactivateConfirm"))) return;
    try {
      setLoading(true);
      const headers = getAuthHeader();
      await axios.delete(`${BASE_URL}/user/deactivate`, { headers });
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      toast.error(err.response?.data?.message || t("deactivateFailed"));
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
              <h1>{role === "therapist" ? t("therapistSettings") : t("patientSettings")}</h1>
              <p className="settings-header__sub">
                {t("manageAccount")} — {profile.email}
              </p>
            </div>
          </div>
          <div className="settings-divider" />

          {/* ══ SECTION 1: PROFILE INFO ══ */}
          <div className="settings-section-label">
            <span className="settings-section-label__bar" />
            {t("profileInfo")}
          </div>

          <div className="grid">
            <div className="box-set">
              <label>👤 {t("displayName")}</label>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                placeholder={t("displayName")}
              />
            </div>

            <div className="box-set">
              <label>✉️ {t("email")}</label>
              <input value={profile.email} disabled />
            </div>

            <div className="box-set">
              <label>📞 {t("phone")}</label>
              <input
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder={t("phone")}
              />
            </div>

            {role === "therapist" && (
              <div className="box-set">
                <label>💰 {t("sessionFee")}</label>
                <input
                  type="number"
                  name="sessionFee"
                  value={form.sessionFee}
                  onChange={handleChange}
                  placeholder={t("sessionFee")}
                />
              </div>
            )}

            <div className="box full">
              <label>🔒 {t("currentPassword")} <span style={{ color: "red" }}>*</span></label>
              <div className="input-wrap input-wrap--password">
                <button className="pass-toggle"
                  onClick={() => setShowPass((p) => ({ ...p, current: !p.current }))}>
                  {showPass.current ? "🙈" : "👁️"}
                </button>
                <input
                  type={showPass.current ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={t("currentPasswordHint")}
                />
              </div>
              <p className="input-hint">{t("currentPasswordHint")}</p>
            </div>

            <div className="box-set">
              <label>🔑 {t("newPassword")}</label>
              <div className="input-wrap input-wrap--password">
                <button className="pass-toggle"
                  onClick={() => setShowPass((p) => ({ ...p, new: !p.new }))}>
                  {showPass.new ? "🙈" : "👁️"}
                </button>
                <input
                  type={showPass.new ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder={t("newPasswordHint")}
                />
              </div>
            </div>

            <div className="box-set">
              <label>🔑 {t("confirmPassword")}</label>
              <div className="input-wrap input-wrap--password">
                <button className="pass-toggle"
                  onClick={() => setShowPass((p) => ({ ...p, confirm: !p.confirm }))}>
                  {showPass.confirm ? "🙈" : "👁️"}
                </button>
                <input
                  type={showPass.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder={t("confirmPasswordHint")}
                />
              </div>
            </div>
          </div>

          <button className="set-btn" onClick={handleSave} disabled={loading}>
            {loading
              ? <><span className="set-btn__spinner" /> {t("saving")}</>
              : `💾 ${t("saveChanges")}`
            }
          </button>

          <div className="settings-divider" style={{ marginTop: 32 }} />

          {/* ══ SECTION 2: TWO-FACTOR AUTH ══ */}
          <div className="settings-section-label">
            <span className="settings-section-label__bar" />
            {t("twoFA")}
          </div>

          <div className="grid">
            <div className="box full">
              <label>
                🛡️ {t("twoFAStatus")} —{" "}
                <span style={{ color: twoFaEnabled ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                  {twoFaEnabled ? t("enabled") : t("disabled")}
                </span>
              </label>
              <p className="input-hint">
                {twoFaEnabled ? t("twoFAEnabledHint") : t("twoFADisabledHint")}
              </p>
            </div>

            {!otpSent ? (
              <div className="box full">
                <button className="set-btn" onClick={handleSendOtp} disabled={loading}>
                  {loading
                    ? <><span className="set-btn__spinner" /> {t("sending")}</>
                    : `📧 ${t("sendOtp")}`
                  }
                </button>
              </div>
            ) : (
              <>
                <div className="box full">
                  <label>🔢 {t("enterOtp")}</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t("otpPlaceholder")}
                    maxLength={6}
                  />
                </div>
                <div className="box full" style={{ display: "flex", gap: 12 }}>
                  {!twoFaEnabled ? (
                    <button className="set-btn" onClick={handleEnable2FA} disabled={loading}>
                      {loading ? <><span className="set-btn__spinner" /> {t("enabling")}</> : `✅ ${t("enable2FA")}`}
                    </button>
                  ) : (
                    <button className="set-btn" onClick={handleDisable2FA} disabled={loading}
                      style={{ background: "#ef4444" }}>
                      {loading ? <><span className="set-btn__spinner" /> {t("disabling")}</> : `❌ ${t("disable2FA")}`}
                    </button>
                  )}
                  <button className="set-btn"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    style={{ background: "#94a3b8", boxShadow: "none" }}>
                    {t("cancel")}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="settings-divider" style={{ marginTop: 32 }} />

          {/* ══ SECTION 3: DANGER ZONE ══ */}
          <div className="settings-section-label">
            <span className="settings-section-label__bar" style={{ background: "#ef4444" }} />
            {t("dangerZone")}
          </div>

          <div className="grid">
            <div className="box-set">
              <label>🚪 {t("logoutAllDevices")}</label>
              <p className="input-hint">{t("logoutAllHint")}</p>
              <button className="set-btn" onClick={handleLogoutAll} disabled={loading}
                style={{ background: "#f97316", boxShadow: "0 4px 20px rgba(249,115,22,0.30)" }}>
                {t("logoutAllDevices")}
              </button>
            </div>

            <div className="box-set">
              <label>🗑️ {t("deactivateAccount")}</label>
              <p className="input-hint">{t("deactivateHint")}</p>
              <button className="set-btn" onClick={handleDeactivate} disabled={loading}
                style={{ background: "#ef4444", boxShadow: "0 4px 20px rgba(239,68,68,0.30)" }}>
                {t("deactivateAccount")}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
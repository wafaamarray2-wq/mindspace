import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDashUser } from "../Dashbords/DoctorDashbord";
import {
  FiEdit2, FiCamera, FiMail, FiPhone, FiMapPin,
  FiGlobe, FiCalendar, FiPlus, FiCheck, FiTrash2, FiX,
  FiAward, FiBarChart2,
} from "react-icons/fi";
import "./ProfilePatient.css";

/* ══════════════════════════════════════════════
   CROP MODAL
══════════════════════════════════════════════ */
function CropModal({ src, onCrop, onCancel }) {
  const canvasRef = useRef();
  const imgRef = useRef();
  const [scale, setScale] = useState(1);

  const handleCrop = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const s = scale;
    const sw = img.naturalWidth / s;
    const sh = img.naturalHeight / s;
    const sx = (img.naturalWidth - sw) / 2;
    const sy = (img.naturalHeight - sh) / 2;

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

    canvas.toBlob((blob) => {
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
      onCrop(file);
    }, "image/jpeg", 0.92);
  };

  return (
    <div className="pp-crop-overlay" onClick={onCancel}>
      <div className="pp-crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pp-crop-header">
          <h3>Crop photo</h3>
          <button className="pp-crop-close" onClick={onCancel}><FiX /></button>
        </div>

        <div className="pp-crop-preview">
          <img
            ref={imgRef}
            src={src}
            alt="crop"
            style={{ transform: `scale(${scale})`, transition: "transform 0.2s" }}
          />
          <div className="pp-crop-circle" />
        </div>

        <div className="pp-crop-controls">
          <span>Zoom</span>
          <input
            type="range" min="1" max="3" step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
          />
          <span>{Math.round(scale * 100)}%</span>
        </div>

        <canvas ref={canvasRef} hidden />

        <div className="pp-crop-actions">
          <button className="pp-crop-cancel" onClick={onCancel}>Cancel</button>
          <button className="pp-crop-save" onClick={handleCrop}>Apply</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   REVIEW AVATAR
══════════════════════════════════════════════ */
function RevAvatar({ initials }) {
  return (
    <div className="pp-rev-av" style={{ background: "#CECBF6", color: "#3C3489" }}>
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function ProfilePatient() {
  const dashUser = useDashUser() || {};
  const user = dashUser.user || {};
  const setUser = dashUser.setUser || (() => {});
  const fetchUserData = dashUser.fetchUserData || (() => {});

  const galleryRef  = useRef();
  const cameraRef   = useRef();
  const coverRef    = useRef();

  const [loading, setLoading]       = useState(false);
  const [coverImg, setCoverImg]     = useState(null);
  const [cropSrc, setCropSrc]       = useState(null);
  const [cropTarget, setCropTarget] = useState(null);

  const openCrop = (file, target) => {
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setCropTarget(target);
  };

  const handleCropped = async (file) => {
    setCropSrc(null);
    if (cropTarget === "cover") {
      setCoverImg(URL.createObjectURL(file));
      return;
    }
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("pfp", file);

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

      await fetchUserData();
      toast.success("✅ Photo updated successfully");
    } catch (err) {
      console.error("upload error:", err.response?.data);
      toast.error("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        "https://mind-space-ov3r.onrender.com/user/reset-profile-picture",
        {},
        { headers: { Authorization: `dash ${token}` } }
      );
      setUser((prev) => ({ ...prev, pfp: null }));
      await fetchUserData();
      toast.success("✅ Photo removed");
    } catch (err) {
      toast.error("❌ Failed to remove photo");
    } finally {
      setLoading(false);
    }
  };

  const pfpUrl = user?.pfp?.secure_url;
  const initial = user?.userName?.charAt(0)?.toUpperCase() || "P";

  const info = [
    { icon: <FiMail />,       label: "Email",       val: user?.email || "—" },
    { icon: <FiPhone />,      label: "Phone",       val: "+20 100 123 4567" },
    { icon: <FiMapPin />,     label: "Location",    val: "Cairo, Egypt" },
    { icon: <FiGlobe />,      label: "Language",    val: "Arabic, English" },
  ];

  const concerns = [
    "Anxiety", "Depression", "Sleep issues",
    "Stress management", "Relationship issues", "Self-esteem",
  ];

  const therapists = [
    { name: "Dr. Ahmed Mahmoud", specialty: "Anxiety & CBT", sessions: 12 },
    { name: "Dr. Amira Hassan", specialty: "Depression", sessions: 8 },
  ];

  const progress = [
    { metric: "Sessions attended", value: 20, goal: 30 },
    { metric: "Mood improvement", value: 65, goal: 100 },
    { metric: "Sleep quality", value: 72, goal: 100 },
  ];

  const milestones = [
    { date: "Jan 2024", text: "Started therapy journey" },
    { date: "Feb 2024", text: "Completed anxiety management course" },
    { date: "Mar 2024", text: "First 10 sessions milestone" },
    { date: "Apr 2024", text: "Noticed significant mood improvement" },
  ];

  return (
    <div className="pp-page">

      {/* ══ HIDDEN FILE INPUTS ══ */}
      <input ref={galleryRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files[0]; if (f) openCrop(f, "avatar"); e.target.value = ""; }} />
      <input ref={cameraRef} type="file" accept="image/*" capture="user" hidden
        onChange={(e) => { const f = e.target.files[0]; if (f) uploadAvatar(f); e.target.value = ""; }} />
      <input ref={coverRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files[0]; if (f) openCrop(f, "cover"); e.target.value = ""; }} />

      {/* ══ CROP MODAL ══ */}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onCrop={handleCropped}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* ══ COVER ══ */}
      <div
        className="pp-cover"
        style={coverImg ? { backgroundImage: `url(${coverImg})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        onClick={() => coverRef.current.click()}
        title="Click to change cover"
      >
        <button className="pp-edit-cover" onClick={(e) => { e.stopPropagation(); coverRef.current.click(); }}>
          <FiCamera size={13} /> Edit cover
        </button>

        {/* ── AVATAR ── */}
        <div className="pp-avatar-wrap" onClick={(e) => e.stopPropagation()}>
          <div className="pp-avatar-ring">
            {pfpUrl
              ? <img src={pfpUrl} alt="" className="pp-avatar-img" />
              : <div className="pp-avatar-fallback">{initial}</div>
            }
            {loading && <div className="pp-avatar-loading"><span /><span /><span /></div>}
          </div>

          {/* أزرار الأفاتار */}
          <div className="pp-avatar-btns">
            <button className="pp-av-btn" title="Choose from gallery"
              onClick={() => galleryRef.current.click()}>
              <FiEdit2 size={12} />
            </button>
            <button className="pp-av-btn" title="Take a photo"
              onClick={() => cameraRef.current.click()}>
              <FiCamera size={12} />
            </button>
            <button className="pp-av-btn danger" title="Remove photo"
              onClick={removeAvatar} disabled={loading || !pfpUrl}>
              <FiTrash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ══ NAME CARD ══ */}
      <div className="pp-card">
        <div className="pp-name-row">
          <div>
            <div className="pp-name">{user?.userName || "—"}</div>
            <div className="pp-role">
              <span>Patient</span>
              <span className="pp-member"><FiCheck size={10} /> Member since Jan 2024</span>
            </div>
          </div>
          <button className="pp-edit-btn"><FiEdit2 size={13} /> Edit profile</button>
        </div>
        <div className="pp-stats">
          {[{ n: 20, l: "Sessions" }, { n: 2, l: "Therapists" }, { n: "3 mo", l: "Active" }]
            .map(({ n, l }) => (
              <div className="pp-stat" key={l}>
                <div className="pp-stat-n">{n}</div>
                <div className="pp-stat-l">{l}</div>
              </div>
            ))}
        </div>
      </div>

      {/* ══ PERSONAL INFO ══ */}
      <div className="pp-card">
        <div className="pp-sec-title">Personal information
          <button className="pp-sec-edit"><FiEdit2 size={12} /> Edit</button>
        </div>
        {info.map(({ icon, label, val }) => (
          <div className="pp-info-row" key={label}>
            <span className="pp-info-icon">{icon}</span>
            <span className="pp-info-label">{label}</span>
            <span className="pp-info-val">{val}</span>
          </div>
        ))}
      </div>

      {/* ══ ABOUT ══ */}
      <div className="pp-card">
        <div className="pp-sec-title">About
          <button className="pp-sec-edit"><FiEdit2 size={12} /> Edit</button>
        </div>
        <p className="pp-about-text">
          I'm on a journey to improve my mental health and overall well-being. 
          I'm working with my therapists to develop healthier coping strategies and build resilience. 
          Open to learning and growing every day.
        </p>
      </div>

      {/* ══ PRIMARY CONCERNS ══ */}
      <div className="pp-card">
        <div className="pp-sec-title">Primary concerns
          <button className="pp-sec-edit"><FiEdit2 size={12} /> Edit</button>
        </div>
        <div className="pp-tags">
          {concerns.map((c) => <span className="pp-tag" key={c}>{c}</span>)}
        </div>
      </div>

      {/* ══ CURRENT THERAPISTS ══ */}
      <div className="pp-card">
        <div className="pp-sec-title">Current therapists
          <button className="pp-sec-edit"><FiPlus size={12} /> Add</button>
        </div>
        {therapists.map(({ name, specialty, sessions }) => (
          <div className="pp-therapist-item" key={name}>
            <div className="pp-ther-avatar">
              {name.charAt(0)}
            </div>
            <div>
              <div className="pp-ther-name">{name}</div>
              <div className="pp-ther-specialty">{specialty}</div>
              <div className="pp-ther-sessions">{sessions} sessions completed</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ PROGRESS TRACKING ══ */}
      <div className="pp-card">
        <div className="pp-sec-title">Progress tracking <FiBarChart2 size={14} style={{ marginLeft: 'auto' }} /></div>
        {progress.map(({ metric, value, goal }) => (
          <div className="pp-progress-item" key={metric}>
            <div className="pp-progress-label">
              <span>{metric}</span>
              <span className="pp-progress-pct">{value}%</span>
            </div>
            <div className="pp-progress-bar">
              <div className="pp-progress-fill" style={{ width: `${value}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ══ MILESTONES ══ */}
      <div className="pp-card">
        <div className="pp-sec-title">Your journey <FiAward size={14} style={{ marginLeft: 'auto' }} /></div>
        <div className="pp-timeline">
          {milestones.map(({ date, text }, i) => (
            <div className="pp-milestone" key={i}>
              <div className="pp-milestone-dot" />
              <div>
                <div className="pp-milestone-date">{date}</div>
                <div className="pp-milestone-text">{text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
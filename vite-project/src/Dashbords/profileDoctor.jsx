import { useState, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDashUser } from "../Dashbords/DoctorDashbord";
import {
  FiEdit2, FiCamera, FiMail, FiPhone, FiMapPin,
  FiGlobe, FiDollarSign, FiPlus, FiCheck, FiTrash2, FiX,
} from "react-icons/fi";
import "./ProfileDoctor.css";

/* ══════════════════════════════════════════════
   CROP MODAL — بسيط بدون library
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

    // رسم الصورة في مربع متمركز
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
    <div className="dp-crop-overlay" onClick={onCancel}>
      <div className="dp-crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="dp-crop-header">
          <h3>Crop photo</h3>
          <button className="dp-crop-close" onClick={onCancel}><FiX /></button>
        </div>

        <div className="dp-crop-preview">
          <img
            ref={imgRef}
            src={src}
            alt="crop"
            style={{ transform: `scale(${scale})`, transition: "transform 0.2s" }}
          />
          <div className="dp-crop-circle" />
        </div>

        <div className="dp-crop-controls">
          <span>Zoom</span>
          <input
            type="range" min="1" max="3" step="0.05"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
          />
          <span>{Math.round(scale * 100)}%</span>
        </div>

        <canvas ref={canvasRef} hidden />

        <div className="dp-crop-actions">
          <button className="dp-crop-cancel" onClick={onCancel}>Cancel</button>
          <button className="dp-crop-save" onClick={handleCrop}>Apply</button>
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
    <div className="dp-rev-av" style={{ background: "#CECBF6", color: "#3C3489" }}>
      {initials}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function ProfileDoctor() {
  const { user, setUser, fetchUserData } = useDashUser();

  // refs للـ file inputs
  const galleryRef  = useRef();   // اختيار من المعرض
  const cameraRef   = useRef();   // فتح الكاميرا
  const coverRef    = useRef();   // صورة الغلاف

  // states
  const [loading, setLoading]       = useState(false);
  const [coverImg, setCoverImg]     = useState(null);   // local فقط
  const [cropSrc, setCropSrc]       = useState(null);   // الصورة قبل الـ crop
  const [cropTarget, setCropTarget] = useState(null);   // "avatar" | "cover"

  // ── فتح الـ crop modal ──
  const openCrop = (file, target) => {
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setCropTarget(target);
  };

  // ── بعد الـ crop ──
  const handleCropped = async (file) => {
    setCropSrc(null);
    if (cropTarget === "cover") {
      setCoverImg(URL.createObjectURL(file));
      // لو عندك API للغلاف — استدعيها هنا
      return;
    }
    // avatar
    await uploadAvatar(file);
  };

  // ══════════════════════════════════════════
  //  UPLOAD AVATAR → API → تحديث الـ context
  // ══════════════════════════════════════════
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
        // تحديث الـ context → السايدبار + الهيدر + الفيد كلهم بيتحدثوا
        setUser((prev) => ({
          ...prev,
          pfp: { ...newPfp, secure_url: newPfp.secure_url + "?t=" + Date.now() },
        }));
      }

      await fetchUserData();   // تحديث كامل من السيرفر
      toast.success("✅ Photo updated successfully");
    } catch (err) {
      console.error("upload error:", err.response?.data);
      toast.error("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════
  //  REMOVE AVATAR → API → تحديث الـ context
  // ══════════════════════════════════════════
  const removeAvatar = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.patch(
        "https://mind-space-ov3r.onrender.com/user/reset-profile-picture",
        {},
        { headers: { Authorization: `dash ${token}` } }
      );
      // مسح الصورة من الـ context → السايدبار + الهيدر + الفيد
      setUser((prev) => ({ ...prev, pfp: null }));
      await fetchUserData();
      toast.success("✅ Photo removed");
    } catch (err) {
      toast.error("❌ Failed to remove photo");
    } finally {
      setLoading(false);
    }
  };

  // ── الصورة الحالية ──
  const pfpUrl = user?.pfp?.secure_url;
  const initial = user?.userName?.charAt(0)?.toUpperCase() || "D";

  // ── static demo data ──
  const info = [
    { icon: <FiMail />,       label: "Email",       val: user?.email || "—" },
    { icon: <FiPhone />,      label: "Phone",       val: "+20 100 123 4567" },
    { icon: <FiMapPin />,     label: "Location",    val: "Cairo, Egypt" },
    { icon: <FiGlobe />,      label: "Languages",   val: "Arabic, English" },
    { icon: <FiDollarSign />, label: "Session fee", val: "500 EGP / 60 min" },
  ];

  const specializations = [
    "Anxiety disorders", "Depression", "Trauma & PTSD",
    "CBT", "Mindfulness", "Relationship issues",
  ];

  const availability = [
    { day: "Sun", time: "10am – 5pm", off: false },
    { day: "Mon", time: "9am – 6pm",  off: false },
    { day: "Tue", time: "Unavailable", off: true  },
    { day: "Wed", time: "10am – 4pm", off: false },
    { day: "Thu", time: "9am – 5pm",  off: false },
    { day: "Fri", time: "Unavailable", off: true  },
    { day: "Sat", time: "10am – 2pm", off: false },
  ];

  const certifications = [
    { name: "Licensed Clinical Psychologist", org: "Egyptian Psychological Association · 2018" },
    { name: "CBT Practitioner",               org: "Beck Institute · 2020" },
    { name: "Trauma-Focused Therapy",          org: "EMDR International · 2022" },
  ];

  const reviews = [
    { initials: "SM", name: "Sara M.",   time: "2 weeks ago", stars: 5,
      text: "Dr. Ahmed is incredibly patient and understanding. After just a few sessions I noticed a real difference in how I handle stress." },
    { initials: "KR", name: "Khaled R.", time: "1 month ago",  stars: 5,
      text: "Very professional and compassionate. The CBT techniques he taught me have been life-changing." },
  ];

  return (
    <div className="dp-page">

      {/* ══ HIDDEN FILE INPUTS ══ */}
      {/* معرض الصور */}
      <input ref={galleryRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files[0]; if (f) openCrop(f, "avatar"); e.target.value = ""; }} />
      {/* كاميرا */}
      <input ref={cameraRef} type="file" accept="image/*" capture="user" hidden
        onChange={(e) => { const f = e.target.files[0]; if (f) uploadAvatar(f); e.target.value = ""; }} />
      {/* غلاف */}
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
        className="dp-cover"
        style={coverImg ? { backgroundImage: `url(${coverImg})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        onClick={() => coverRef.current.click()}
        title="Click to change cover"
      >
        <button className="dp-edit-cover" onClick={(e) => { e.stopPropagation(); coverRef.current.click(); }}>
          <FiCamera size={13} /> Edit cover
        </button>

        {/* ── AVATAR ── */}
        <div className="dp-avatar-wrap" onClick={(e) => e.stopPropagation()}>
       
<div className="dp-avatar-ring">
  {pfpUrl
    ? <img src={pfpUrl} alt="" className="dp-avatar-img" />
    : <div className="dp-avatar-fallback">{initial}</div>
  }
  {loading && <div className="dp-avatar-loading"><span /><span /><span /></div>}
</div>



          {/* أزرار الأفاتار */}
          <div className="dp-avatar-btns">
            <button className="dp-av-btn" title="Choose from gallery"
              onClick={() => galleryRef.current.click()}>
              <FiEdit2 size={12} />
            </button>
            <button className="dp-av-btn" title="Take a photo"
              onClick={() => cameraRef.current.click()}>
              <FiCamera size={12} />
            </button>
            <button className="dp-av-btn danger" title="Remove photo"
              onClick={removeAvatar} disabled={loading || !pfpUrl}>
              <FiTrash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* ══ NAME CARD ══ */}
      <div className="dp-card">
        <div className="dp-name-row">
          <div>
            <div className="dp-name">Dr. {user?.userName || "—"}</div>
            <div className="dp-role">
              <span>{user?.role || "Therapist"}</span>
              <span className="dp-verified"><FiCheck size={10} /> Verified</span>
            </div>
          </div>
          <button className="dp-edit-btn"><FiEdit2 size={13} /> Edit profile</button>
        </div>
        <div className="dp-stats">
          {[{ n: 124, l: "Patients" }, { n: "4.9", l: "Rating" }, { n: "6 yrs", l: "Experience" }]
            .map(({ n, l }) => (
              <div className="dp-stat" key={l}>
                <div className="dp-stat-n">{n}</div>
                <div className="dp-stat-l">{l}</div>
              </div>
            ))}
        </div>
      </div>

      {/* ══ PERSONAL INFO ══ */}
      <div className="dp-card">
        <div className="dp-sec-title">Personal information
          <button className="dp-sec-edit"><FiEdit2 size={12} /> Edit</button>
        </div>
        {info.map(({ icon, label, val }) => (
          <div className="dp-info-row" key={label}>
            <span className="dp-info-icon">{icon}</span>
            <span className="dp-info-label">{label}</span>
            <span className="dp-info-val">{val}</span>
          </div>
        ))}
      </div>

      {/* ══ ABOUT ══ */}
      <div className="dp-card">
        <div className="dp-sec-title">About
          <button className="dp-sec-edit"><FiEdit2 size={12} /> Edit</button>
        </div>
        <p className="dp-about-text">
          Experienced clinical psychologist specializing in anxiety, depression, and trauma recovery.
          I use evidence-based approaches including CBT and mindfulness to help clients build lasting mental resilience.
        </p>
      </div>

      {/* ══ SPECIALIZATIONS ══ */}
      <div className="dp-card">
        <div className="dp-sec-title">Specializations
          <button className="dp-sec-edit"><FiPlus size={12} /> Add</button>
        </div>
        <div className="dp-tags">
          {specializations.map((s) => <span className="dp-tag" key={s}>{s}</span>)}
        </div>
      </div>

      {/* ══ AVAILABILITY ══ */}
      <div className="dp-card">
        <div className="dp-sec-title">Weekly availability
          <button className="dp-sec-edit"><FiEdit2 size={12} /> Edit</button>
        </div>
        <div className="dp-avail-grid">
          {availability.map(({ day, time, off }) => (
            <div className={`dp-day-box${off ? " off" : ""}`} key={day}>
              <div className="dp-day-name">{day}</div>
              <div className="dp-day-time">{time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CERTIFICATIONS ══ */}
      <div className="dp-card">
        <div className="dp-sec-title">Certifications
          <button className="dp-sec-edit"><FiPlus size={12} /> Add</button>
        </div>
        {certifications.map(({ name, org }) => (
          <div className="dp-cert-item" key={name}>
            <div className="dp-cert-icon">🎓</div>
            <div>
              <div className="dp-cert-name">{name}</div>
              <div className="dp-cert-org">{org}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ REVIEWS ══ */}
      <div className="dp-card">
        <div className="dp-sec-title">Patient reviews</div>
        {reviews.map(({ initials, name, time, stars, text }) => (
          <div className="dp-review-item" key={name}>
            <div className="dp-rev-top">
              <RevAvatar initials={initials} />
              <span className="dp-rev-name">{name}</span>
              <span className="dp-rev-time">{time}</span>
            </div>
            <div className="dp-stars">{"★".repeat(stars)}</div>
            <div className="dp-rev-text">{text}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
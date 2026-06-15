import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDashUser } from "../Dashbords/DoctorDashbord";
import {
  FiCamera, FiMail, FiPhone,
  FiDollarSign, FiCheck, FiTrash2, FiX,
} from "react-icons/fi";
import "./ProfileDoctor.css";


function CropModal({ src, onCrop, onCancel }) {
  const canvasRef = useRef();
  const imgRef    = useRef();
  const [scale, setScale] = useState(1);

  const handleCrop = () => {
    const img    = imgRef.current;
    const canvas = canvasRef.current;
    const size   = 400;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const sw  = img.naturalWidth  / scale;
    const sh  = img.naturalHeight / scale;
    const sx  = (img.naturalWidth  - sw) / 2;
    const sy  = (img.naturalHeight - sh) / 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
    canvas.toBlob((blob) => {
      onCrop(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
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
          <img ref={imgRef} src={src} alt="crop"
            style={{ transform: `scale(${scale})`, transition: "transform .2s" }} />
          <div className="dp-crop-circle" />
        </div>
        <div className="dp-crop-controls">
          <span>Zoom</span>
          <input type="range" min="1" max="3" step="0.05" value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))} />
          <span>{Math.round(scale * 100)}%</span>
        </div>
        <canvas ref={canvasRef} hidden />
        <div className="dp-crop-actions">
          <button className="dp-crop-cancel" onClick={onCancel}>Cancel</button>
          <button className="dp-crop-save"   onClick={handleCrop}>Apply</button>
        </div>
      </div>
    </div>
  );
}


export default function ProfileDoctor() {
  const dashUser      = useDashUser() || {};
  const user          = dashUser.user        || {};
  const setUser       = dashUser.setUser       || (() => {});
  const fetchUserData = dashUser.fetchUserData || (() => {});

  const galleryRef = useRef();

  const [loading,          setLoading]          = useState(false);
  const [cropSrc,          setCropSrc]          = useState(null);
  const [feedbacks,        setFeedbacks]        = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [sessions,         setSessions]         = useState([]);

  /* ── fetch feedbacks & sessions ── */
  useEffect(() => {
    if (!user?._id) return;

    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await axios.get("https://mind-space-ov3r.onrender.com/feedback", {
          headers: { Authorization: `dash ${token}` },
        });
        const data     = res.data?.data || res.data || [];
        const filtered = data.filter((f) => {
          const tId = f.therapistId?._id || f.therapistId || "";
          return tId === user._id;
        });
        setFeedbacks(filtered);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        setLoadingFeedbacks(false);
      }
    };

    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await axios.get("https://mind-space-ov3r.onrender.com/session/therapist", {
          headers: { Authorization: `dash ${token}` },
        });
        setSessions(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };

    fetchFeedbacks();
    fetchSessions();
  }, [user?._id]);

  /* ── helpers ── */
  const getReviewerName = (feedback) => {
    if (feedback.userId?.userName) return feedback.userId.userName;
    if (feedback.user?.userName)   return feedback.user.userName;
    if (feedback.userName)         return feedback.userName;

    const userIdStr = typeof feedback.userId === "object"
      ? feedback.userId?._id
      : feedback.userId;
    if (!userIdStr) return "مريض";

    let hash = 0;
    for (let i = 0; i < userIdStr.length; i++)
      hash = userIdStr.charCodeAt(i) + ((hash << 5) - hash);

    const firstNames  = ["أحمد","سارة","محمد","ياسمين","كريم","منى","علي","فاطمة","محمود","ليلى","خالد","رانيا","عمر","هالة","يوسف","مي"];
    const lastInitials = ["أ.","ب.","ت.","ج.","ح.","خ.","د.","ر.","س.","ش.","ع.","م.","ن.","هـ."];
    return `${firstNames[Math.abs(hash) % firstNames.length]} ${lastInitials[Math.abs(hash >> 3) % lastInitials.length]}`;
  };

  /* ── avatar upload ── */
  const uploadAvatar = async (file) => {
    try {
      setLoading(true);
      const token    = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("pfp", file);
      const res    = await axios.post(
        "https://mind-space-ov3r.onrender.com/user/profile-picture",
        formData,
        { headers: { Authorization: `dash ${token}` } }
      );
      const newPfp = res.data?.data?.pfp || res.data?.pfp;
      if (newPfp?.secure_url)
        setUser((prev) => ({
          ...prev,
          pfp: { ...newPfp, secure_url: newPfp.secure_url + "?t=" + Date.now() },
        }));
      await fetchUserData();
      toast.success("✅ Photo updated successfully");
    } catch {
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
    } catch {
      toast.error("❌ Failed to remove photo");
    } finally {
      setLoading(false);
    }
  };

  /* ── derived values ── */
  const pfpUrl  = user?.pfp?.secure_url;
  const initial = user?.userName?.charAt(0)?.toUpperCase() || "د";

  const uniquePatients = new Set(
    sessions.map((s) => s.userId?._id || s.userId).filter(Boolean)
  ).size;

  const hasReviews    = feedbacks.length > 0;
  const avgRating     = hasReviews
    ? feedbacks.reduce((acc, f) => acc + f.stars, 0) / feedbacks.length
    : 0;
  const avgRatingText = hasReviews ? avgRating.toFixed(1) : "—";

  const info = [
    { icon: <FiMail />,       label: "البريد الإلكتروني", val: user?.email       || "—" },
    { icon: <FiPhone />,      label: "الهاتف",             val: user?.phoneNumber || "—" },
    { icon: <FiDollarSign />, label: "سعر الجلسة",
      val: user?.sessionFee ? `${user.sessionFee} ج.م / 60 دقيقة` : "—" },
  ];

  return (
    <div className="dp-page">

      {/* hidden input */}
      <input ref={galleryRef} type="file" accept="image/*" hidden
        onChange={(e) => {
          const f = e.target.files[0];
          if (f) setCropSrc(URL.createObjectURL(f));
          e.target.value = "";
        }} />

      {/* crop modal */}
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onCrop={(file) => { setCropSrc(null); uploadAvatar(file); }}
          onCancel={() => setCropSrc(null)}
        />
      )}

      {/* ── HERO ── */}
      <div className="dp-card">
        <div className="dp-hero">
          <div className="dp-avatar-wrap">
            <div className="dp-avatar-ring">
              {pfpUrl
                ? <img src={pfpUrl} alt="" className="dp-avatar-img" />
                : <span>{initial}</span>}
              {loading && (
                <div className="dp-avatar-loading">
                  <span /><span /><span />
                </div>
              )}
            </div>
            <div className="dp-avatar-btns">
              <button className="dp-av-btn" title="تغيير الصورة"
                onClick={() => galleryRef.current.click()}>
                <FiCamera size={10} />
              </button>
              {pfpUrl && (
                <button className="dp-av-btn danger" title="احذف الصورة"
                  onClick={removeAvatar} disabled={loading}>
                  <FiTrash2 size={10} />
                </button>
              )}
            </div>
          </div>

          <div className="dp-hero-info">
            <div className="dp-name">Dr. {user?.userName || "—"}</div>
            <div className="dp-role">
              <span>{user?.role || "Therapist"}</span>
              <span className="dp-verified"><FiCheck size={9} /> Verified</span>
            </div>
          </div>


        </div>
      </div>

      {/* ── STATS — real data now ── */}
      <div className="dp-stats-row">
        {[
          { n: uniquePatients || "0",   l: "المرضى"        },
          { n: avgRatingText,           l: "متوسط التقييم"  },
          { n: feedbacks.length || "0", l: "التقييمات"     },
        ].map(({ n, l }) => (
          <div className="dp-stat-box" key={l}>
            <div className="dp-stat-n">{n}</div>
            <div className="dp-stat-l">{l}</div>
          </div>
        ))}
      </div>

      {/* ── PERSONAL INFO ── */}
      <div className="dp-card">
        <div className="dp-sec-head">
          <span className="dp-sec-title">البيانات الشخصية</span>
        </div>
        {info.map(({ icon, label, val }) => (
          <div className="dp-info-row" key={label}>
            <span className="dp-info-icon">{icon}</span>
            <span className="dp-info-label">{label}</span>
            <span className="dp-info-val">{val}</span>
          </div>
        ))}
      </div>

      {/* ── REVIEWS ── */}
      <div className="dp-card">
        <div className="dp-sec-head">
          <span className="dp-sec-title">تقييمات وآراء المرضى</span>
          {hasReviews && (
            <span style={{ fontSize: 12, color: "var(--muted)" }}>
              {feedbacks.length} تقييم
            </span>
          )}
        </div>

        {loadingFeedbacks ? (
          <div className="dp-about-text" style={{ color: "var(--muted)" }}>
            جاري تحميل التقييمات…
          </div>
        ) : !hasReviews ? (
          <div className="dp-about-text" style={{ color: "var(--muted)" }}>
            لا توجد تقييمات من المرضى بعد.
          </div>
        ) : (
          feedbacks.map((f, index) => {
            const name = getReviewerName(f);
            const time = f.createdAt
              ? new Date(f.createdAt).toLocaleDateString("ar-EG")
              : "مؤخراً";
            return (
              <div className="dp-review-item" key={f._id || index}>
                <div className="dp-rev-top">
                  <div className="dp-rev-av" style={{ background: "#CECBF6", color: "#3C3489" }}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="dp-rev-name">{name}</span>
                  <span className="dp-rev-time">{time}</span>
                </div>
                <div className="dp-stars">
                  {"★".repeat(f.stars)}{"☆".repeat(5 - f.stars)}
                </div>
                <div className="dp-rev-text">{f.content}</div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
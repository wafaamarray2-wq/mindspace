import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useDashUser } from "../Dashbords/DoctorDashbord";
import {
  FiEdit2, FiCamera, FiMail, FiPhone, FiMapPin,
  FiGlobe, FiDollarSign, FiPlus, FiCheck, FiTrash2, FiX,
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
  const user          = dashUser.user  || {};
  const setUser       = dashUser.setUser       || (() => {});
  const fetchUserData = dashUser.fetchUserData || (() => {});

  const galleryRef = useRef();
  const cameraRef  = useRef();

  const [loading,    setLoading]    = useState(false);
  const [cropSrc,    setCropSrc]    = useState(null);
  const [cropTarget, setCropTarget] = useState(null);

  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [sessions, setSessions] = useState([]);

  // Fetch feedbacks and sessions for this therapist
  useEffect(() => {
    if (!user?._id) return;
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://mind-space-ov3r.onrender.com/feedback", {
          headers: { Authorization: `dash ${token}` }
        });
        const data = res.data?.data || res.data || [];
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
        const res = await axios.get("https://mind-space-ov3r.onrender.com/session/therapist", {
          headers: { Authorization: `dash ${token}` }
        });
        setSessions(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Error fetching sessions:", err);
      }
    };

    fetchFeedbacks();
    fetchSessions();
  }, [user?._id]);

  const getReviewerName = (feedback, currentUserId, currentUserName) => {
    if (feedback.userId === currentUserId || (feedback.userId?._id && feedback.userId._id === currentUserId)) {
      return currentUserName || "أنت";
    }
    
    if (feedback.userId?.userName) return feedback.userId.userName;
    if (feedback.user?.userName) return feedback.user.userName;
    if (feedback.userName) return feedback.userName;
    
    const userIdStr = typeof feedback.userId === 'object' ? feedback.userId?._id : feedback.userId;
    if (!userIdStr) return "مريض";
    
    let hash = 0;
    for (let i = 0; i < userIdStr.length; i++) {
      hash = userIdStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const firstNames = [
      "أحمد", "سارة", "محمد", "ياسمين", "كريم", "منى", "علي", "فاطمة", 
      "محمود", "ليلى", "خالد", "رانيا", "عمر", "هالة", "يوسف", "مي"
    ];
    const lastInitials = [
      "أ.", "ب.", "ت.", "ج.", "ح.", "خ.", "د.", "ر.", "س.", "ش.", "ع.", "م.", "ن.", "هـ."
    ];
    
    const firstName = firstNames[Math.abs(hash) % firstNames.length];
    const lastInitial = lastInitials[Math.abs(hash >> 3) % lastInitials.length];
    
    return `${firstName} ${lastInitial}`;
  };

  const translateSpecialty = (spec) => {
    const translations = {
      "therapist": "العلاج النفسي",
      "psychologist": "علم النفس الإكلينيكي",
      "psychiatrist": "الطب النفسي",
      "anxiety": "القلق والتوتر",
      "depression": "الاكتئاب",
      "stress": "الضغط النفسي",
      "cbt": "العلاج المعرفي السلوكي"
    };
    return translations[(spec || "").toLowerCase()] || spec || "العلاج النفسي العام";
  };

  const openCrop = (file, target) => {
    setCropSrc(URL.createObjectURL(file));
    setCropTarget(target);
  };

  const handleCropped = async (file) => {
    setCropSrc(null);
    await uploadAvatar(file);
  };

  /* ── upload avatar ── */
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
      if (newPfp?.secure_url) {
        setUser((prev) => ({
          ...prev,
          pfp: { ...newPfp, secure_url: newPfp.secure_url + "?t=" + Date.now() },
        }));
      }
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

  const pfpUrl  = user?.pfp?.secure_url;
  const initial = user?.userName?.charAt(0)?.toUpperCase() || "د";


  const uniquePatients = new Set(sessions.map((s) => s.userId?._id || s.userId).filter(Boolean)).size;
  const hasReviews = feedbacks.length > 0;
  const avgRating = hasReviews 
    ? feedbacks.reduce((acc, f) => acc + f.stars, 0) / feedbacks.length 
    : 0;
  const avgRatingText = hasReviews ? `${avgRating.toFixed(1)}⭐` : "جديد";

  const info = [
    { icon: <FiMail />,       label: "البريد الإلكتروني",      val: user?.email || "—" },
    { icon: <FiPhone />,      label: "الهاتف",      val: user?.phoneNumber || "—" },
    { icon: <FiDollarSign />, label: "سعر الجلسة", val: `${user?.sessionFee || "150"} ج.م / 60 دقيقة` },
  ];

  const specializations = user?.specialty 
    ? user.specialty.split(/[,،\s\n]+/).map(s => s.trim()).filter(Boolean)
    : ["العلاج النفسي", "الإرشاد السلوكي", "الدعم النفسي"];

  const availability = [
    { day: "الأحد", time: "10-5",  off: false },
    { day: "الأثنين", time: "9-6",   off: false },
    { day: "الثلاثاء", time: "—",     off: true  },
    { day: "الأربعاء", time: "10-4",  off: false },
    { day: "الخميس", time: "9-5",   off: false },
    { day: "الجمعة", time: "—",     off: true  },
    { day: "السبت", time: "10-2",  off: false },
  ];

  const certifications = [
    { name: "أخصائي نفسي عيادي معتمد", org: "الجمعية المصرية للدراسات النفسية · 2018" },
    { name: "ممارس العلاج المعرفي السلوكي (CBT)", org: "معهد بيك · 2020" },
    { name: "معالج الصدمات النفسية المعتمد", org: "الجمعية الدولية لعلاج الصدمات · 2022" },
  ];

  return (
    <div className="dp-page">

      {/* hidden inputs */}
      <input ref={galleryRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files[0]; if (f) openCrop(f, "avatar"); e.target.value = ""; }} />
      <input ref={cameraRef} type="file" accept="image/*" capture="user" hidden
        onChange={(e) => { const f = e.target.files[0]; if (f) uploadAvatar(f); e.target.value = ""; }} />

      {/* crop modal */}
      {cropSrc && (
        <CropModal src={cropSrc} onCrop={handleCropped} onCancel={() => setCropSrc(null)} />
      )}

      {/* ── HERO CARD ── */}
      <div className="dp-card">
        <div className="dp-hero">

          {/* avatar */}
          <div className="dp-avatar-wrap">
            <div className="dp-avatar-ring">
              {pfpUrl
                ? <img src={pfpUrl} alt="" className="dp-avatar-img" />
                : <span>{initial}</span>
              }
              {loading && (
                <div className="dp-avatar-loading">
                  <span /><span /><span />
                </div>
              )}
            </div>
            <div className="dp-avatar-btns">
              <button className="dp-av-btn" title="اختر من المعرض"
                onClick={() => galleryRef.current.click()}>
                <FiEdit2 size={10} />
              </button>
              <button className="dp-av-btn" title="التقط صورة"
                onClick={() => cameraRef.current.click()}>
                <FiCamera size={10} />
              </button>
              <button className="dp-av-btn danger" title="احذف الصورة"
                onClick={removeAvatar} disabled={loading || !pfpUrl}>
                <FiTrash2 size={10} />
              </button>
            </div>
          </div>

          {/* info */}
          <div className="dp-hero-info">
            <div className="dp-name">Dr. {user?.userName || "—"}</div>
            <div className="dp-role">
              <span>{user?.role || "Therapist"}</span>
              <span className="dp-verified"><FiCheck size={9} /> Verified</span>
            </div>
          </div>

          {/* edit btn */}
          <button className="dp-hero-edit">
            <FiEdit2 size={13} /> Edit profile
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="dp-stats-row">
        {[
          { n: uniquePatients, l: "المرضى" },
          { n: avgRatingText, l: "التقييم" },
          { n: `${user?.experience || 0} سنوات`, l: "سنوات الخبرة" }
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
          <button className="dp-sec-btn"><FiEdit2 size={12} /> تعديل</button>
        </div>
        {info.map(({ icon, label, val }) => (
          <div className="dp-info-row" key={label}>
            <span className="dp-info-icon">{icon}</span>
            <span className="dp-info-label">{label}</span>
            <span className="dp-info-val">{val}</span>
          </div>
        ))}
      </div>

      {/* ── ABOUT ── */}
      <div className="dp-card">
        <div className="dp-sec-head">
          <span className="dp-sec-title">عن الدكتور</span>
          <button className="dp-sec-btn"><FiEdit2 size={12} /> تعديل</button>
        </div>
        <p className="dp-about-text">
          {user?.bio || user?.description || `الدكتور ${user?.userName} هو أخصائي نفسي متميز في مجال ${translateSpecialty(user?.specialty)}، ولديه خبرة عملية تمتد لأكثر من ${user?.experience || 0} سنوات في تقديم الدعم النفسي والإرشاد السلوكي لمساعدة المرضى على تجاوز الصعاب وتحقيق التوازن النفسي.`}
        </p>
      </div>

      {/* ── SPECIALIZATIONS ── */}
      <div className="dp-card">
        <div className="dp-sec-head">
          <span className="dp-sec-title">التخصصات</span>
          <button className="dp-sec-btn"><FiPlus size={12} /> إضافة</button>
        </div>
        <div className="dp-tags">
          {specializations.map((s) => (
            <span className="dp-tag" key={s}>{translateSpecialty(s)}</span>
          ))}
        </div>
      </div>

      {/* ── AVAILABILITY ── */}
      <div className="dp-card">
        <div className="dp-sec-head">
          <span className="dp-sec-title">مواعيد العمل الأسبوعية</span>
          <button className="dp-sec-btn"><FiEdit2 size={12} /> تعديل</button>
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

      {/* ── CERTIFICATIONS ── */}
      <div className="dp-card">
        <div className="dp-sec-head">
          <span className="dp-sec-title">الشهادات والاعتمادات</span>
          <button className="dp-sec-btn"><FiPlus size={12} /> إضافة</button>
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

      {/* ── REVIEWS ── */}
      <div className="dp-card">
        <div className="dp-sec-head">
          <span className="dp-sec-title">تقييمات وآراء المرضى</span>
        </div>
        {loadingFeedbacks ? (
          <div style={{ padding: "20px", color: "var(--text-light)" }}>جاري تحميل التقييمات...</div>
        ) : feedbacks.map((f, index) => {
          const name = getReviewerName(f, user?._id, user?.userName);
          const time = f.createdAt ? new Date(f.createdAt).toLocaleDateString("ar-EG") : "مؤخراً";
          return (
            <div className="dp-review-item" key={f._id || index}>
              <div className="dp-rev-top">
                <div className="dp-rev-av" style={{ background: "#CECBF6", color: "#3C3489" }}>
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="dp-rev-name">{name}</span>
                <span className="dp-rev-time">{time}</span>
              </div>
              <div className="dp-stars">{"★".repeat(f.stars)}</div>
              <div className="dp-rev-text">{f.content}</div>
            </div>
          );
        })}
        {!loadingFeedbacks && feedbacks.length === 0 && (
          <div className="dp-no-reviews" style={{ padding: "20px", color: "var(--text-light)" }}>لا توجد تقييمات من المرضى بعد.</div>
        )}
      </div>

    </div>
  );
}
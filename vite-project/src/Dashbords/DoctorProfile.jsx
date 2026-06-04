import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./DoctorProfile.css";

import { FaCircleCheck } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { RiShieldCheckFill } from "react-icons/ri";
import { RiVideoOnLine } from "react-icons/ri";

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [doctor, setDoctor] = useState(state || null);
  const [loadingDoctor, setLoadingDoctor] = useState(!state);

  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [stars, setStars] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const userRole = localStorage.getItem("role"); // 'user' (patient) or 'therapist'
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch logged in user profile to associate review names accurately
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("https://mind-space-ov3r.onrender.com/user/profile", {
          headers: { Authorization: `dash ${token}` }
        });
        setCurrentUser(res.data?.data || res.data);
      } catch (err) {
        console.error("Error fetching current user profile:", err);
      }
    };
    fetchCurrentUser();
  }, []);

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

  // Fetch doctor data if not available in state
  useEffect(() => {
    if (doctor) {
      setLoadingDoctor(false);
      return;
    }
    const fetchDoctor = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://mind-space-ov3r.onrender.com/user/get-therapists", {
          headers: { Authorization: `dash ${token}` }
        });
        const list = res.data?.therapists || res.data?.data || res.data || [];
        const found = list.find((d) => d._id === id);
        if (found) {
          setDoctor(found);
        } else {
          // Check if they are looking at their own profile (in case therapist accesses it)
          const profileRes = await axios.get("https://mind-space-ov3r.onrender.com/user/profile", {
            headers: { Authorization: `dash ${token}` }
          });
          const currentProfile = profileRes.data?.data || profileRes.data;
          if (currentProfile && currentProfile._id === id) {
            setDoctor(currentProfile);
          }
        }
      } catch (err) {
        console.error("Error fetching doctor:", err);
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [id, doctor]);

  // Fetch feedbacks for this doctor
  useEffect(() => {
    if (!doctor) return;
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://mind-space-ov3r.onrender.com/feedback", {
          headers: { Authorization: `dash ${token}` }
        });
        const data = res.data?.data || res.data || [];
        
        // Filter feedbacks by this doctor's ID
        const filtered = data.filter((f) => {
          const tId = f.therapistId?._id || f.therapistId || "";
          const targetId = doctor._id || id;
          return tId === targetId;
        });
        
        setFeedbacks(filtered);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        setLoadingFeedbacks(false);
      }
    };
    
    fetchFeedbacks();
  }, [doctor?._id, id]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!reviewContent.trim()) {
      toast.warning("من فضلك اكتب تعليقاً أولاً");
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://mind-space-ov3r.onrender.com/feedback/add_feedback",
        {
          therapistId: doctor._id,
          stars: stars,
          content: reviewContent.trim()
        },
        {
          headers: { Authorization: `dash ${token}` }
        }
      );
      
      toast.success("🎉 تم إضافة تقييمك بنجاح!");
      setReviewContent("");
      setStars(5);
      
      // Re-fetch to display newly added feedback with full user object populated if possible
      const response = await axios.get("https://mind-space-ov3r.onrender.com/feedback", {
        headers: { Authorization: `dash ${token}` }
      });
      const data = response.data?.data || response.data || [];
      const filtered = data.filter((f) => {
        const tId = f.therapistId?._id || f.therapistId || "";
        return tId === doctor._id;
      });
      setFeedbacks(filtered);
    } catch (err) {
      console.error("Error adding feedback:", err);
      const errMsg = err.response?.data?.message || "حدث خطأ أثناء إضافة التقييم";
      toast.error(`❌ ${errMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="doctor-profile">
        <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
          <h2 style={{ color: "#6366f1" }}>جاري تحميل بيانات الطبيب...</h2>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="doctor-profile">
        <div className="container" style={{ textAlign: "center", padding: "100px 0" }}>
          <h2 style={{ marginBottom: "20px" }}>عذراً، لم يتم العثور على الطبيب المطلوب</h2>
          <button className="book-btn" onClick={() => navigate("/doctor")}>العودة لقائمة الأطباء</button>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const hasReviews = feedbacks.length > 0;
  const avgRating = hasReviews 
    ? feedbacks.reduce((acc, f) => acc + f.stars, 0) / feedbacks.length 
    : 0;

  const avgRatingText = hasReviews ? avgRating.toFixed(1) : "جديد";

  // Dynamic Biography
  const bioText = doctor.bio || doctor.description || `الدكتور ${doctor.userName} هو أخصائي نفسي متميز في مجال ${doctor.specialty || "العلاج النفسي"}، ولديه خبرة عملية تمتد لأكثر من ${doctor.experience || 0} سنوات في تقديم الدعم النفسي والإرشاد السلوكي لمساعدة المرضى على تجاوز الصعاب وتحقيق التوازن النفسي.`;

  // Dynamic Specialties list
  const specialtiesList = doctor.specialty 
    ? doctor.specialty.split(/[,،\s\n]+/).map(s => s.trim()).filter(Boolean)
    : ["العلاج النفسي", "الإرشاد السلوكي", "الدعم النفسي"];

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
    return translations[spec.toLowerCase()] || spec;
  };

  return (
    <div className="doctor-profile">
      <div className="container">
        <div className="doctor-card">
          <img
            src={doctor.pfp?.secure_url}
            alt="doctor"
            className="doctor-img"
          />

          <div className="doctor-info">
            <h2>Dr. {doctor.userName}</h2>
            <p className="special">{translateSpecialty(doctor.specialty)}</p>

            <div className="meta">
              <span>⭐ {avgRatingText}</span>
              <span>خبرة {doctor.experience} سنوات</span>
            </div>

            <button
              className="book-btn"
              onClick={() => navigate(`/booking/${doctor._id}`)}
            >
              احجز جلسة
            </button>
          </div>
        </div>

        <div className="about-card">
          <h3>عن الدكتور</h3>
          <p>{bioText}</p>
        </div>

        <div className="stats">
          <div className="stat-box one">
            <h2>متاح الان</h2>
            <span>
              <FaCircleCheck />
            </span>
          </div>

          <div className="stat-box">
            <h2>{hasReviews ? `${avgRating.toFixed(1)}⭐` : "جديد⭐"}</h2>
            <p>التقييم</p>
          </div>

          <div className="stat-box">
            <h2>{doctor.sessionFee || "150"} ج.م</h2>
            <p>سعر الجلسة</p>
          </div>

          <div className="stat-box">
            <h2>+{doctor.experience || 0}</h2>
            <p>سنوات خبرة</p>
          </div>
        </div>

        <div className="specials-card">
          <h3>التخصصات</h3>
          <div className="boxs">
            {specialtiesList.map((spec, idx) => (
              <div className="box" key={idx}>
                <h2>{translateSpecialty(spec)}</h2>
              </div>
            ))}
          </div>
        </div>

        <div className="why">
          <h3>لماذا تختار العلاج معي؟ </h3>
          <div className="boxes">
            <div className="box">
              <span>
                <FaHeart style={{ color: "#E53935" }} />
              </span>
              <p>دعم ومتابعه مستمره</p>
            </div>

            <div className="box">
              <span>
                <RiShieldCheckFill style={{ color: "#2E7D32" }} />
              </span>
              <p>خصوصية تامة وسرية</p>
            </div>

            <div className="box">
              <span>
                <RiVideoOnLine style={{ color: "#1565C0" }} />
              </span>
              <p>جلسات اون لاين مرحه</p>
            </div>
          </div>
        </div>

        {/* ─── Feedback & Review Section ─── */}
        <div className="feedback-section text-right">
          <h3>التقييمات وآراء المرضى</h3>
          
          {/* Average rating and review stats */}
          <div className="rating-summary-card">
            <div className="average-rating-col">
              <span className="avg-num">{hasReviews ? avgRating.toFixed(1) : "0.0"}</span>
              <div className="stars-row">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={i < Math.round(avgRating) ? "star-filled" : "star-empty"}>★</span>
                ))}
              </div>
              <span className="reviews-count">بناءً على {feedbacks.length} تقييم</span>
            </div>
            
            <div className="rating-bars-col">
              {[5, 4, 3, 2, 1].map((starNum) => {
                const count = feedbacks.filter((f) => f.stars === starNum).length;
                const percent = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
                return (
                  <div key={starNum} className="rating-bar-row">
                    <span className="star-label">{starNum} نجوم</span>
                    <div className="bar-outer">
                      <div className="bar-inner" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="count-label">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to submit review (only for patients) */}
          {userRole === "user" && (
            <form className="add-review-form" onSubmit={handleSubmitFeedback}>
              <h4>أضف تقييمك للـ دكتور</h4>
              
              <div className="rating-input-row">
                <span className="label">تقييمك بالنجوم:</span>
                <div className="stars-input">
                  {[1, 2, 3, 4, 5].map((starNum) => (
                    <button
                      key={starNum}
                      type="button"
                      className={`star-input-btn ${stars >= starNum ? "selected" : ""}`}
                      onClick={() => setStars(starNum)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="textarea-wrap">
                <textarea
                  placeholder="اكتب تجربتك مع الدكتور وملاحظاتك هنا..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className="submit-review-btn" disabled={submitting}>
                {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
              </button>
            </form>
          )}

          {/* Feedbacks list */}
          <div className="feedbacks-list">
            {loadingFeedbacks ? (
              <div className="loading-feedbacks">جاري تحميل الآراء...</div>
            ) : feedbacks.length > 0 ? (
              feedbacks.map((f, index) => {
                const revUser = getReviewerName(f, currentUser?._id, currentUser?.userName);
                const pfp = f.userId?.pfp?.secure_url || f.user?.pfp?.secure_url || null;
                return (
                  <div key={f._id || index} className="feedback-card">
                    <div className="feedback-card-header">
                      {pfp ? (
                        <img src={pfp} alt={revUser} className="reviewer-pfp" />
                      ) : (
                        <div className="reviewer-avatar-placeholder">
                          {revUser.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="reviewer-meta">
                        <span className="reviewer-name">{revUser}</span>
                        <span className="reviewer-date">
                          {f.createdAt ? new Date(f.createdAt).toLocaleDateString("ar-EG") : "مؤخراً"}
                        </span>
                      </div>
                      <div className="reviewer-stars">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={i < f.stars ? "star-filled" : "star-empty"}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="feedback-content">{f.content}</p>
                  </div>
                );
              })
            ) : (
              <div className="no-feedbacks">لا توجد تقييمات لهذا الدكتور بعد. كن أول من يضيف تقييماً!</div>
            )}
          </div>
        </div>

        <button
          className="book-btn2"
          onClick={() => navigate(`/booking/${doctor._id}`)}
        >
          احجز جلستك الان
        </button>
      </div>
    </div>
  );
}
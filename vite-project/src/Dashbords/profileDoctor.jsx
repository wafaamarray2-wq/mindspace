import { useState } from "react";
import { useUser } from "../UserContext";
import {
  FiEdit2, FiCamera, FiMail, FiPhone, FiMapPin,
  FiGlobe, FiDollarSign, FiPlus, FiCheck
} from "react-icons/fi";
import "./ProfileDoctor.css";

/* ── small reusable avatar ── */
function RevAvatar({ initials, bg = "#CECBF6", color = "#3C3489" }) {
  return (
    <div className="dp-rev-av" style={{ background: bg, color }}>
      {initials}
    </div>
  );
}

export default function ProfileDoctor() {
  const { user } = useUser();

  /* demo data — replace with real API data later */
  const [profile] = useState({
    name: user?.userName || "Ahmed Hassan",
    role: user?.role || "Clinical Psychologist",
    email: user?.email || "dr.ahmed@mindspace.com",
    phone: "+20 100 123 4567",
    location: "Cairo, Egypt",
    languages: "Arabic, English",
    fee: "500 EGP / 60 min",
    about:
      "Experienced clinical psychologist specializing in anxiety, depression, and trauma recovery. I use evidence-based approaches including CBT and mindfulness to help clients build lasting mental resilience.",
    stats: { patients: 124, rating: "4.9", experience: "6 yrs" },
    specializations: [
      "Anxiety disorders", "Depression", "Trauma & PTSD",
      "CBT", "Mindfulness", "Relationship issues",
    ],
    availability: [
      { day: "Sun", time: "10am – 5pm", off: false },
      { day: "Mon", time: "9am – 6pm",  off: false },
      { day: "Tue", time: "Unavailable", off: true  },
      { day: "Wed", time: "10am – 4pm", off: false },
      { day: "Thu", time: "9am – 5pm",  off: false },
      { day: "Fri", time: "Unavailable", off: true  },
      { day: "Sat", time: "10am – 2pm", off: false },
    ],
    certifications: [
      { name: "Licensed Clinical Psychologist", org: "Egyptian Psychological Association · 2018" },
      { name: "CBT Practitioner",               org: "Beck Institute · 2020" },
      { name: "Trauma-Focused Therapy",          org: "EMDR International · 2022" },
    ],
    reviews: [
      {
        initials: "SM", name: "Sara M.", time: "2 weeks ago", stars: 5,
        text: "Dr. Ahmed is incredibly patient and understanding. After just a few sessions I noticed a real difference in how I handle stress.",
      },
      {
        initials: "KR", name: "Khaled R.", time: "1 month ago", stars: 5,
        text: "Very professional and compassionate. The CBT techniques he taught me have been life-changing.",
      },
    ],
  });

  const pfpUrl = user?.pfp?.secure_url;

  return (
    <div className="dp-page">

      {/* ── COVER ── */}
      <div className="dp-cover">
        <button className="dp-edit-cover">
          <FiCamera size={13} /> Edit cover
        </button>

        <div className="dp-avatar-wrap">
          <div className="dp-avatar-ring">
            {pfpUrl
              ? <img src={pfpUrl} alt="profile" className="dp-avatar-img" />
              : <div className="dp-avatar-fallback">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
            }
            <button className="dp-avatar-edit" aria-label="Change photo">
              <FiCamera size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── NAME CARD ── */}
      <div className="dp-card">
        <div className="dp-name-row">
          <div>
            <div className="dp-name">Dr. {profile.name}</div>
            <div className="dp-role">
              <span>{profile.role}</span>
              <span className="dp-verified">
                <FiCheck size={10} /> Verified
              </span>
            </div>
          </div>
          <button className="dp-edit-btn">
            <FiEdit2 size={13} /> Edit profile
          </button>
        </div>

        <div className="dp-stats">
          <div className="dp-stat">
            <div className="dp-stat-n">{profile.stats.patients}</div>
            <div className="dp-stat-l">Patients</div>
          </div>
          <div className="dp-stat">
            <div className="dp-stat-n">{profile.stats.rating}</div>
            <div className="dp-stat-l">Rating</div>
          </div>
          <div className="dp-stat">
            <div className="dp-stat-n">{profile.stats.experience}</div>
            <div className="dp-stat-l">Experience</div>
          </div>
        </div>
      </div>

      {/* ── PERSONAL INFO ── */}
      <div className="dp-card">
        <div className="dp-sec-title">
          Personal information
          <button className="dp-sec-edit"><FiEdit2 size={12} /> Edit</button>
        </div>
        {[
          { icon: <FiMail />,       label: "Email",       val: profile.email },
          { icon: <FiPhone />,      label: "Phone",       val: profile.phone },
          { icon: <FiMapPin />,     label: "Location",    val: profile.location },
          { icon: <FiGlobe />,      label: "Languages",   val: profile.languages },
          { icon: <FiDollarSign />, label: "Session fee", val: profile.fee },
        ].map(({ icon, label, val }) => (
          <div className="dp-info-row" key={label}>
            <span className="dp-info-icon">{icon}</span>
            <span className="dp-info-label">{label}</span>
            <span className="dp-info-val">{val}</span>
          </div>
        ))}
      </div>

      {/* ── ABOUT ── */}
      <div className="dp-card">
        <div className="dp-sec-title">
          About
          <button className="dp-sec-edit"><FiEdit2 size={12} /> Edit</button>
        </div>
        <p className="dp-about-text">{profile.about}</p>
      </div>

      {/* ── SPECIALIZATIONS ── */}
      <div className="dp-card">
        <div className="dp-sec-title">
          Specializations
          <button className="dp-sec-edit"><FiPlus size={12} /> Add</button>
        </div>
        <div className="dp-tags">
          {profile.specializations.map((s) => (
            <span className="dp-tag" key={s}>{s}</span>
          ))}
        </div>
      </div>

      {/* ── AVAILABILITY ── */}
      <div className="dp-card">
        <div className="dp-sec-title">
          Weekly availability
          <button className="dp-sec-edit"><FiEdit2 size={12} /> Edit</button>
        </div>
        <div className="dp-avail-grid">
          {profile.availability.map(({ day, time, off }) => (
            <div className={`dp-day-box${off ? " off" : ""}`} key={day}>
              <div className="dp-day-name">{day}</div>
              <div className="dp-day-time">{time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CERTIFICATIONS ── */}
      <div className="dp-card">
        <div className="dp-sec-title">
          Certifications
          <button className="dp-sec-edit"><FiPlus size={12} /> Add</button>
        </div>
        {profile.certifications.map(({ name, org }) => (
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
        <div className="dp-sec-title">Patient reviews</div>
        {profile.reviews.map(({ initials, name, time, stars, text }) => (
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
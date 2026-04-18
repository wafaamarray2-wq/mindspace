import { useParams, useNavigate } from "react-router-dom";
import "./DoctorProfile.css";
import { useContext } from "react";
import { TherapistContext } from "../Therapists/TherapistContext";
import { FaCircleCheck } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { RiShieldCheckFill } from "react-icons/ri";
import { RiVideoOnLine } from "react-icons/ri";
export default function DoctorProfile() {
  const { therapists } = useContext(TherapistContext);

  const { id } = useParams();
  const navigate = useNavigate();

  const doctor = therapists.find((d) => d.id == id);

  if (!doctor) return <h2>Doctor Not Found</h2>;

  return (
    <div className="doctor-profile">
      <div className="container">
        <div className="doctor-card">
          <img src={doctor.image} alt="doctor" className="doctor-img" />

          <div className="doctor-info">
            <h2>{doctor.name}</h2>
            <p className="special">{doctor.specialization}</p>

            <div className="meta">
              <span>⭐ {doctor.rating}</span>
              <span>{doctor.experience}</span>
            </div>

            <button
              className="book-btn"
              onClick={() => navigate(`/booking/${doctor.id}`)}
            >
              احجز جلسة
            </button>
          </div>
        </div>

        <div className="about-card">
          <h3>عن الدكتور</h3>
          <p>{doctor.about}</p>
        </div>

        <div className="stats">
          <div className="stat-box one">
            <h2>متاح الان</h2>
            <span>
              <FaCircleCheck />
            </span>
          </div>
          <div className="stat-box">
            <h2> {doctor.rating}⭐</h2>
            <p>التقييم</p>
          </div>
          <div className="stat-box">
            <h2>+200</h2>
            <p>مريض معالج</p>
          </div>
          <div className="stat-box">
            <h2>+7</h2>
            <p>سنوات خبره</p>
          </div>
        </div>

        <div className="specials-card">
          <h3>التخصصات </h3>
          <div className="boxs">
            <div className="box">
              <h2>القلق</h2>
            </div>
            <div className="box">
              <h2>الاكتئاب</h2>
            </div>
            <div className="box">
              <h2>الضغط النفسي</h2>
            </div>
            <div className="box">
              <h2>التوتر</h2>
            </div>
          </div>
        </div>
        <div className="why">
              <h3>لماذا تختار العلاج معي؟ </h3>
              <div className="boxes">
                <div className="box">
                <span><FaHeart style={{color:" #E53935"}}/></span>
                <p>دعم ومتابعه مستمره</p>
                </div>
                <div className="box">
                <span><RiShieldCheckFill style={{color:" #2E7D32"}}/></span>
                <p>  خصوصية تامة وسرية</p>
                </div>
                <div className="box">
                <span><RiVideoOnLine style={{color:" #1565C0"}}/></span>
                <p>جلسات اون لاين مرحه</p>
                </div>
              </div>
        </div>
    <button  
              className="book-btn2"
              onClick={() => navigate(`/booking/${doctor.id}`)}
            >
              احجز جلستك الان
            </button>

      </div>
    </div>
  );
}

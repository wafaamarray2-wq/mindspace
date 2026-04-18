import React, { useContext } from "react";
import "./thera.css";
import { CiSearch } from "react-icons/ci";
import Empty from "../images/photo_2026-03-08_01-28-32.jpg";
import { TherapistContext } from "./TherapistContext";
import { useNavigate } from "react-router-dom";

function Therapists() {
  const navigate = useNavigate();
  const { therapists } = useContext(TherapistContext);

  return (
    <div className="thera">
      <div className="container">
        <h1>الاخصائيون النفسيون</h1>
        <p>اختر المعالج المناسب لبدء رحلتك نحو الدعم النفسي</p>

        <div className="inp">
          <span><CiSearch /></span>
          <input type="text" placeholder="ابحث عن معالج..." />
        </div>

        {therapists.length === 0 ? (
          <div className="empty">
            <img src={Empty} alt="" />
            <h2>لا يوجد معالجون متاحون حاليا</h2>
            <p>كن اول من ينضم الي منصتنا</p>
            <button>تسجيل كمعالج</button>
          </div>
        ) : (
          <div className="display-doc">
            {therapists.map((doctor, index) => (
              <div className="details" key={index}>
                <img src={doctor.image} alt="doctor" />
                <h3>{doctor.name}</h3>
                <p className="par">{doctor.specialization}</p>
                <p>{doctor.experience}</p>

                <button onClick={() => navigate(`/doctor/${doctor.id}`)}>
                  عرض الملف
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Therapists;

import React, { useState } from "react";
import "./thera.css";
import { CiSearch } from "react-icons/ci";
import Empty from "..//images/photo_2026-03-08_01-28-32.jpg";
import Doct from "..//images/photo_2026-03-04_02-40-53.jpg";
function Therapists() {
  const [therapists, setTherapists] = useState([
    {
      name: "د.احمد علي",
      specialization: "علاج القلق",
      experience: "خبره 7 سنوات",
      image: Doct,
    },
    {
      name: "د.احمد علي",
      specialization: "علاج القلق",
      experience: "خبره 7 سنوات",
      image: Doct,
    },
    {
      name: "د.احمد علي",
      specialization: "علاج القلق",
      experience: "خبره 7 سنوات",
      image: Doct,
    },

  ]);
  return (
    <div className="thera">
      <div className="container">
        <h1>الاخصائيون النفسيون</h1>
        <p>اختر المعالج المناسب لبدء رحلتك نحو الدعم النفسي</p>
        <div className="inp">
          <span>
            <CiSearch />
          </span>
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
          {therapists.map((doctor,index)=>(
            <div className="details" key={index}>
              <img src={doctor.image} alt="doctor" />
              <h3>{doctor.name}</h3>
              <p className="par">{doctor.specialization}</p>
              <p>{doctor.experience}</p>
              <button>عرض الملف</button>
            </div>
          ))}
         </div>
        )}
      </div>
    </div>
  );
}

export default Therapists;

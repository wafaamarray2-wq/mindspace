import React, { useEffect, useState } from "react";
import "./thera.css";
import { CiSearch } from "react-icons/ci";
import Empty from "../images/photo_2026-03-08_01-28-32.jpg";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "https://mind-space-ov3r.onrender.com";

function getUserIdFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.id || null;
  } catch {
    return null;
  }
}

function authHeader() {
  const token = localStorage.getItem("token");
  return { Authorization: `dash ${token}` };
}

console.log("TOKEN:", localStorage.getItem("token"));
console.log("ROLE:", localStorage.getItem("role"));

function Therapists() {
  const navigate = useNavigate();

  const [therapists, setTherapists] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getTherapists = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/get-therapists`, {
          headers: authHeader(),
        });

        console.log(res.data);

        setTherapists(res.data?.therapists || res.data?.data || res.data);
      } catch (error) {
        console.log(error);
      }
    };

    getTherapists();
  }, []);

  return (
    <div className="thera">
      <div className="container">
        <h1>الاخصائيون النفسيون</h1>
        <p>اختر المعالج المناسب لبدء رحلتك نحو الدعم النفسي</p>

        <div className="inp">
          <span>
            <CiSearch />
          </span>

        <input
  type="text"
  placeholder="ابحث عن معالج..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
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
            {therapists
  .filter((doctor) => {
    const name = doctor.userName?.toLowerCase() || "";
    const spec = doctor.specialty?.toLowerCase() || "";
    const value = search.toLowerCase();

    return name.includes(value) || spec.includes(value);
  })
  .map((doctor, index) => (
              <div className="details" key={doctor._id || index}>
                <img src={doctor.pfp?.secure_url || Empty} alt="doctor" />

                <h3> Dr. {doctor.userName}</h3>

                <p className="par">اخصائي نفسي</p>

                <p>خبره {doctor.experience} سنوات</p>

                <button
                  onClick={() =>
                    navigate(`/doctor/${doctor._id}`, {
                      state: doctor,
                    })
                  }
                >
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

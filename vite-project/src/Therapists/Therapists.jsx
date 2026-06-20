import React, { useEffect, useState } from "react";
import "./thera.css";
import { CiSearch } from "react-icons/ci";
import Empty from "../images/photo_2026-03-08_01-28-32.jpg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLang } from "../i18n/LanguageContext";

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

function getInitials(name) {
  if (!name) return "د";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function Therapists() {
  const { t } = useLang();
  const navigate = useNavigate();
  const [therapists, setTherapists] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getTherapists = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/get-therapists`, {
          headers: authHeader(),
        });
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
        <h1>{t("therapistsTitle")}</h1>
        <p>{t("therapistsSubtitle")}</p>

        <div className="inp">
          <span>
            <CiSearch />
          </span>
          <input
            type="text"
            placeholder={t("searchTherapist")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {therapists.length === 0 ? (
          <div className="empty">
            <img src={Empty} alt="" />
            <h2>{t("noTherapists")}</h2>
            <p>{t("beFirstTherapist")}</p>
            <Link to="/login">
              <button>{t("registerAsTherapist")}</button>
            </Link>
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
                  {doctor.pfp?.secure_url ? (
                    <img src={doctor.pfp.secure_url} alt="doctor" />
                  ) : (
                    <div className="avatar-initials">
                      {getInitials(doctor.userName)}
                    </div>
                  )}
                  <h3>Dr. {doctor.userName}</h3>
                  <p className="par">{t("psychologist")}</p>
                  <p>
                    {t("experiencePrefix") ? `${t("experiencePrefix")} ` : ""}
                    {doctor.experience || 0}
                    {` ${t("experienceSuffix")}`}
                  </p>
                  <button
                    onClick={() =>
                      navigate(`/doctor/${doctor._id}`, { state: doctor })
                    }
                  >
                    {t("viewProfile")}
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

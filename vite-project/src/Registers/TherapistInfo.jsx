import React, { useState } from "react";
import "./reg.css";
import { MdAttachMoney } from "react-icons/md";
import { MdWorkHistory } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function TherapistInfo() {
  const [sessionFee, setSessionFee] = useState("");
  const [experience, setExperience] = useState("");
  const navigate = useNavigate();

  const handleSessionFee = (e) => {
    setSessionFee(e.target.value);
  };

  const handleExperience = (e) => {
    setExperience(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sessionFee || !experience) {
      return alert("برجاء استكمال جميع البيانات المطلوبة قبل المتابعة");
    }

    if (Number(sessionFee) <= 0) {
      return alert("برجاء إدخال سعر سيشن صحيح");
    }

    const data = {
      sessionFee: Number(sessionFee),
      experience: Number(experience),
    };

    // try {
    //   const token = localStorage.getItem("token");
    //   const res = await axios.post(
    //     "https://mind-space-ov3r.onrender.com/therapist/info",
    //     data,
    //     {
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //       },
    //     }
    //   );

    //   console.log(res.data);
    //   alert("تم حفظ البيانات بنجاح");
    //   navigate("/doctor-dashboard");
    // } catch (err) {
    //   console.log(err.response?.data || err.message);
    //   alert(
    //     err.response?.data?.message ||
    //       "حدث خطأ أثناء حفظ البيانات، برجاء المحاولة لاحقًا"
    //   );
    // }
  };

  return (
    <div className="register">
      <div className="content">
        <div className="text">
          <h1>أكمل ملفك الشخصي كمعالج!</h1>
          <p>أدخل بياناتك المهنية لتبدأ رحلتك مع مرضاك</p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2>بيانات المعالج</h2>

          <div className="inp">
            <span className="icon">
              <MdAttachMoney />
            </span>
            <input
              type="number"
              placeholder="سعر السيشن (بالجنيه)"
              className="rad"
              value={sessionFee}
              onChange={handleSessionFee}
              min="1"
            />
          </div>

          <div className="inp">
            <span className="icon">
              <MdWorkHistory />
            </span>
            <select value={experience} onChange={handleExperience}>
              <option value="">سنوات الخبرة</option>
              {[...Array(40)].map((_, i) => {
                const year = i + 1;
                return (
                  <option key={year} value={year}>
                    {year} {year === 1 ? "سنة" : "سنوات"}
                  </option>
                );
              })}
            </select>
          </div>

          <button type="submit">حفظ البيانات</button>
        </form>
      </div>
    </div>
  );
}

export default TherapistInfo;

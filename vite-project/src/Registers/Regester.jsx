import React, { useState } from "react";
import "./reg.css";
import { MdEmail } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { FaPhoneFlip } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdAttachMoney } from "react-icons/md";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { IoMdCalendar } from "react-icons/io";
import { CgGenderMale } from "react-icons/cg";
import { MdWorkHistory } from "react-icons/md";
import Doct from "..//images/photo_2026-03-04_02-40-53.jpg";
import Sic from "..//images/photo_2026-03-04_02-40-47.jpg";
import axios from "axios";
import DoctorDashbord from "../Dashbords/doctorDashbord";
import PatientDashbord from "../Dashbords/PatientDashbord";
// import TherapistInfo from "./TherapistInfo";
function Regester() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [email, setemail] = useState("");
  const [password, setBssword] = useState("");
  const [confirmBassword, setConfirmBassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [sessionFee, setSessionFee] = useState("");
    const [experience, setExperience] = useState("");
    const [cv, setCv] = useState(null);
  const navigate = useNavigate();
  const handleName = (e) => {
    setName(e.target.value);
  };
  const handleNumber = (e) => {
    setNumber(e.target.value);
  };
  const hanldeEmail = (e) => {
    setemail(e.target.value);
  };
  const handleBassword = (e) => {
    setBssword(e.target.value);
  };
  const handleConfirm = (e) => {
    setConfirmBassword(e.target.value);
  };
  const handelRole = (e) => {
    setRole(e.target.value);
  };
  const handelGender = (e) => {
    setGender(e.target.value);
  };
  const handelAge = (e) => {
    setAge(e.target.value);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !name ||
    !number ||
    !email ||
    !password ||
    !confirmBassword ||
    !role ||
    !age ||
    !gender
  ) {
    return alert("برجاء استكمال جميع البيانات المطلوبة قبل المتابعة");
  }

  if (password !== confirmBassword) {
    return alert("كلمة المرور وتأكيدها غير متطابقين");
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return alert("برجاء إدخال بريد إلكتروني صحيح");
  }

  if (Number(age) <= 0) {
    return alert("برجاء إدخال عمر صحيح");
  }

  const allowedRoles = ["user", "admin", "therapist", "guest"];

  if (!allowedRoles.includes(role)) {
    return alert("الدور المختار غير صحيح");
  }

  // const data = {
  //   userName: name.trim(),
  //   email: email.trim(),
  //   password,
  //  phoneNumber :number,
  //   cPassword: confirmBassword,
  //   role,
  //   age: Number(age),
  //   gender,
  // };
const formData = new FormData();

formData.append("userName", name);
formData.append("email", email);
formData.append("password", password);
formData.append("phoneNumber", number);
formData.append("cPassword", confirmBassword);
formData.append("role", role);
formData.append("age", age);
formData.append("gender", gender);

if (role === "therapist") {
  formData.append("sessionFee", sessionFee);
  formData.append("experience", experience);
  formData.append("cv", cv);
  formData.append("specialty", "therapist");
}

  // ✅ مهم: therapist لازم specialty من القيم المسموحة
  if (role === "therapist") {
    formData.specialty = "therapist"; 
    // ممكن تغيريها لأي قيمة من:
    // "life coach", "relationship coach", "career coach", "therapist", "performance and skill coach"
  }

  try {
   const res = await axios.post(
  "https://mind-space-ov3r.onrender.com/auth/sign-up",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);

    console.log(res.data);

    alert("تم إنشاء الحساب بنجاح");

 if (role === "therapist") {

  
  navigate("/login");
} else {
  navigate("/login");
}
  } catch (err) {
    console.log(err.response?.data || err.message);

    alert(
      err.response?.data?.message ||
      "حدث خطأ أثناء إنشاء الحساب، برجاء المحاولة لاحقًا"
    );
  }
};

  return (
    <div className="register">
      <div className="content">
        <div className="text">
          <h1>ابدأ رحلتك نحو الدعم النفسي والتوازن!</h1>
          <p>خطوتك الأولى نحو راحة البال والدعم النفسي</p>
        </div>

        <form onSubmit={handleSubmit}>
          <h2>إنشاء حساب جديد</h2>

          <div className="reg-role">
            <p>:اختر نوع الحساب</p>
            <div className="cards">
             <div className={`card ${role === "therapist" ? "selected" : ""}`}>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="therapist"
                    onChange={handelRole}
                  />

                  <div className="imge">
                    <img src={Doct} alt="" />
                  </div>
                  <div className="tex"> دكتور </div>
                </label>
              </div>
              <div className={`card ${role === "user" ? "selected" : ""}`}>
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                   value="user"
                    onChange={handelRole}
                  />
                  <div className="imge">
                    <img src={Sic} alt="" />
                  </div>
                  <div className="tex"> مريض</div>
                </label>
              </div>
  
            </div>
          </div>
          <div className="inp">
            <span className="icon">
              <IoMdPerson />
            </span>
            <input
              type="text"
              placeholder=" الاسم"
              className="rad"
              value={name}
              onChange={handleName}
            />
          </div>
          <div className="inp">
            <span className="icon">
              <FaPhoneFlip />
            </span>
            <input
              type="number"
              placeholder=" رقم الهاتف"
              className="rad"
              value={number}
              onChange={handleNumber}
            />
          </div>

          <div className="inp">
            <span className="icon">
              <MdEmail />
            </span>
            <input
              type="email"
              placeholder=" البريد الالكتروني"
              className="rad"
              value={email}
              onChange={hanldeEmail}
            />
          </div>

          <div className="inp">
            <span className="icon">
              <RiLockPasswordFill />
            </span>
            <input
              type="password"
              placeholder=" كلمة المرور"
              className="rad"
              value={password}
              onChange={handleBassword}
            />
          </div>
          <div className="inp">
            <span className="icon">
              <RiLockPasswordFill />
            </span>
            <input
              type="password"
              placeholder="  تأكيد كلمة المرور"
              className="rad"
              value={confirmBassword}
              onChange={handleConfirm}
            />
          </div>

            {role === "therapist" && (
  <div className="therapist-extra">
    
    <div className="inp">
      <span className="icon">
             <MdAttachMoney />
            </span>
      <input
        type="number"
        placeholder="سعر الجلسة"
        value={sessionFee}
        onChange={(e) => setSessionFee(e.target.value)}
      />
    </div>

    <div className="inp">
  <span className="icon">
    <MdWorkHistory />
  </span>

  <select
    value={experience}
    onChange={(e) => setExperience(e.target.value)}
  >
    <option value="">سنوات الخبرة</option>

    {Array.from({ length: 40 }, (_, i) => {
      const year = i + 1;
      return (
        <option key={year} value={year}>
          {year}
        </option>
      );
    })}
  </select>
</div>

    <div className="inp">
      <input
        type="file"
        onChange={(e) => setCv(e.target.files[0])}
      />
    </div>

  </div>
)}

          <div className="ag-gn">
            <div className="inp">
              <span className="icons">
                <CgGenderMale />
              </span>

              <select onChange={handelGender}>
                <option value="">الجنس</option>
                <option value="male">ذكر</option>
                <option value="female">انثي</option>
              </select>
            </div>{" "}
            <div className="inp">
              <span className="icons">
                <IoMdCalendar />
              </span>
              <select value={age} onChange={handelAge}>
                <option value="">اختر السن </option>
                {[...Array(46)].map((_, i) => {
                  const currentAge = i + 15;
                  return (
                    <option key={currentAge} value={currentAge}>
                      {currentAge}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <button type="submit">إنشاء الحساب</button>
          <div className="cont">
            <Link to="/login">سجل الدخول</Link>
            <h5>لديك حساب ؟ </h5>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Regester;

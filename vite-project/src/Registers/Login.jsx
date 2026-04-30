import React from "react";
import "./reg.css";
import { MdEmail } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { RiLockPasswordFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { IoMdCalendar } from "react-icons/io";
import { CgGenderMale } from "react-icons/cg";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Doct from "..//images/photo_2026-03-04_02-40-53.jpg";
import Sic from "..//images/photo_2026-03-04_02-40-47.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return alert("من فضلك أدخل البريد الإلكتروني وكلمة المرور");
    }

    try {
      const res = await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/login",
        {
          email,
          password,
        }
      );

      console.log(res.data);

      // ============================
      // 🔥 التعديل المهم هنا فقط
      // ============================

      // لو محتاج تفعيل
      if (res.data?.message === "please activate your account") {
        alert("لازم تفعيل الحساب الأول");

        navigate("/verify-otp", {
          state: { email }
        });

        return;
      }

      // ✅ التوكن الصح من الباك
      const token = res.data?.data?.accessToken;
      const role = res.data?.data?.role || res.data?.role; 
      // (احتياط لو الباك رجعه في مكان تاني)

      if (!token) {
        return alert("حدث خطأ في استرجاع التوكن");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role || "user");

      alert("تم تسجيل الدخول بنجاح");

      if (role === "therapist") {
        navigate("/doctor-dashboard");
      } else {
        navigate("/patient-dashboard");
      }

    } catch (err) {
      console.log(err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
        "فشل تسجيل الدخول"
      );
    }
  };

  return (
    <div>
      <div className="register">
        <div className="content">
          <div className="text">
            <h1>ابدأ رحلتك نحو الدعم النفسي والتوازن!</h1>
            <p>خطوتك الأولى نحو راحة البال والدعم النفسي</p>
          </div>

          <form className="frm" onSubmit={handleLogin}>
            <h2> تسجيل الدخول</h2>

            <div className="inp">
              <span className="icon">
                <MdEmail />
              </span>
              <input
                type="email"
                placeholder=" البريد الالكتروني"
                className="rad"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit">تسجيل الدخول</button>

            <div className="cnt-lg">
              <Link to="/register">انشاء حساب</Link>
              <h5>ليس لديك حساب؟ </h5>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
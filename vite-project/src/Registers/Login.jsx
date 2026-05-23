import React from "react";
import "./reg.css";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("من فضلك أدخل البريد الإلكتروني وكلمة المرور");
      return;
    }

    try {
      setLoading(true);

      const loginRes = await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/login",
        { email, password }
      );

      console.log("Login Response:", loginRes.data);

      const message = loginRes.data?.message;

      // ✅ لو الأكونت مش متفعل — بعت OTP تلقائياً ووجّه لصفحة التفعيل
      if (
        message === "please activate your account" ||
        message === "account not activated" ||
        message === "Please verify your email"
      ) {
        toast.warn("يجب تفعيل الحساب أولاً، جاري إرسال كود التفعيل...");

        try {
          await axios.post(
            "https://mind-space-ov3r.onrender.com/auth/send-otp",
            { email }
          );
          toast.success("تم إرسال كود التفعيل على بريدك الإلكتروني");
        } catch (otpErr) {
          console.log("OTP send error:", otpErr.response?.data || otpErr.message);
          toast.error("حدث خطأ في إرسال الكود");
        }

        navigate("/verify-otp", { state: { email } });
        return;
      }

      const token = loginRes.data?.data?.accessToken;

      if (!token) {
        toast.error("حدث خطأ في استرجاع التوكن");
        return;
      }

      localStorage.setItem("token", token);
      console.log("✅ Token saved:", token);

      toast.success("جاري جلب بيانات الملف الشخصي...");

      try {
        const profileRes = await axios.get(
          "https://mind-space-ov3r.onrender.com/user/profile",
          {
            headers: {
              Authorization: `dash ${token}`,
            },
          }
        );

        console.log("Profile Response:", profileRes.data);

        const userData = profileRes.data;
        const userRole = userData?.data.role;
        const userName = userData?.data.userName;

        if (userRole) {
          localStorage.setItem("role", userRole);
          localStorage.setItem("userName", userName);
          console.log("✅ User Role:", userRole);
          console.log("✅ User Name:", userName);
        }

        toast.success("تم تسجيل الدخول بنجاح");

        if (userRole === "therapist") {
          navigate("/doctor-dashboard");
        } else if (userRole === "user") {
          navigate("/patient-dashboard");
        } else {
          navigate("/");
        }
      } catch (profileErr) {
        console.log("❌ Error fetching profile:", profileErr);
        toast.error("خطأ في جلب البيانات الشخصية");
        navigate("/");
      }
    } catch (err) {
      console.log("❌ Login Error:", err.response?.data || err.message);

      const errMessage = err.response?.data?.message;

      // ✅ لو السيرفر رجّع الـ error في الـ catch مش في الـ success response
      if (
        errMessage === "please activate your account" ||
        errMessage === "account not activated" ||
        errMessage === "Please verify your email"
      ) {
        toast.warn("يجب تفعيل الحساب أولاً، جاري إرسال كود التفعيل...");

        try {
          await axios.post(
            "https://mind-space-ov3r.onrender.com/auth/send-otp",
            { email }
          );
          toast.success("تم إرسال كود التفعيل على بريدك الإلكتروني");
        } catch (otpErr) {
          console.log("OTP send error:", otpErr.response?.data || otpErr.message);
        }

        navigate("/Verify", { state: { email } });
        return;
      }

      toast.error(errMessage || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
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
            <h2>تسجيل الدخول</h2>

            <div className="inp">
              <span className="icon">
                <MdEmail />
              </span>
              <input
                type="email"
                placeholder="البريد الالكتروني"
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
                placeholder="كلمة المرور"
                className="rad"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "جاري التحميل..." : "تسجيل الدخول"}
            </button>

            <div className="forget-pass">
              <Link to="/forget-password">هل نسيت كلمة المرور؟</Link>
            </div>

            <div className="cnt-lg">
              <Link to="/register">انشاء حساب</Link>
              <h5>ليس لديك حساب؟</h5>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
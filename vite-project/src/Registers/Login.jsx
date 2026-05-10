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

      // Step 1: تسجيل الدخول
      const loginRes = await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/login",
        {
          email,
          password,
        },
      );

      console.log("Login Response:", loginRes.data);

      if (loginRes.data?.message === "please activate your account") {
        toast.error("يجب تفعيل الحساب أولاً");
        navigate("/verify-otp", { state: { email } });
        return;
      }

      const token = loginRes.data?.data?.accessToken;
      // const userId = loginRes.data?.data?.id; // ✅ احصل على الـ ID

      if (!token) {
        toast.error("حدث خطأ في استرجاع التوكن");
        return;
      }

      // ✅ احفظ الـ token
      localStorage.setItem("token", token);
      console.log("✅ Token saved:", token);

      toast.success("جاري جلب بيانات الملف الشخصي...");

      // Step 2: جلب الـ profile باستخدام POST
      try {
        const profileRes = await axios.get(
          "https://mind-space-ov3r.onrender.com/user/profile",

          {
            headers: {
              Authorization: `dash ${token}`,
            },
          },
        );

        console.log("Profile Response:", profileRes.data);

        const userData =  profileRes.data;

        console.log("User Data:", userData);

        // ✅ استخرج الـ role من الـ response
        const userRole = userData?.data.role;
        const userName = userData?.data.userName;

        if (userRole) {
          localStorage.setItem("role", userRole);
          localStorage.setItem("userName", userName);
          console.log("✅ User Role:", userRole);
          console.log("✅ User Name:", userName);
        }

        toast.success("تم تسجيل الدخول بنجاح");

        // Step 3: التوجيه حسب الـ role
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

        // Fallback: إذا فشل جلب الـ profile، وجّه حسب افتراض
        navigate("/");
      }
    } catch (err) {
      console.log("❌ Login Error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "فشل تسجيل الدخول");
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

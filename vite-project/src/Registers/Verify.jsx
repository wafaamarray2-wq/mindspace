import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./reg.css";
import { MdEmail } from "react-icons/md";

function Verify() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleResend = async () => {
    try {
      await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/send-otp",
        { email }
      );
      alert("تم إرسال كود جديد على بريدك الإلكتروني");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("حدث خطأ أثناء إرسال الكود");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp) {
      return alert("من فضلك أدخل الكود");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/forget-password-verify-otp",
        {
          email: email,
          otp: otp,
        }
      );

      console.log(res.data);

      alert("تم تفعيل الحساب بنجاح");

      navigate("/login");

    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("الكود غير صحيح أو انتهت صلاحيته");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="content">
        <div className="text">
          <h1>تفعيل الحساب</h1>
          <p>أدخل الكود المرسل إلى: {email}</p>
        </div>

        <form onSubmit={handleVerify}>
          <h2>تأكيد البريد الإلكتروني</h2>

          <div className="inp">
            <span className="icon">
              <MdEmail />
            </span>
            <input
              type="text"
              placeholder="أدخل كود التفعيل"
              className="rad"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "جاري التحقق..." : "تأكيد"}
          </button>

          <div className="cont">
            <span
              onClick={handleResend}
              style={{ cursor: "pointer", color: "#2a9d7c", fontWeight: "600", fontSize: "0.88rem" }}
            >
              إعادة إرسال الكود
            </span>
            <h5>لم تستلم الكود؟</h5>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Verify;
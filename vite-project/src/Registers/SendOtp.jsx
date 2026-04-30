import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function SendOtp() {
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleSendOtp = async () => {
    setLoading(true);

    try {
      await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/send-otp",
        {
          email: email,
        }
      );

      alert("تم إرسال كود التفعيل على الإيميل");

      // نروح لصفحة إدخال OTP
      navigate("/verify-otp", { state: { email } });

    } catch (err) {
      console.log(err.response?.data || err.message);

      alert("فشل إرسال الكود");
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>تفعيل الحساب</h2>

      <p>اضغط لإرسال كود التفعيل إلى: {email}</p>

      <button onClick={handleSendOtp} disabled={loading}>
        {loading ? "جاري الإرسال..." : "إرسال الكود"}
      </button>
    </div>
  );
}

export default SendOtp;
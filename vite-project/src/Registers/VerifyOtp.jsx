import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyOtp() {
  const [otp, setOtp] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp) {
      return alert("من فضلك أدخل الكود");
    }

    try {
      const res = await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/enable-2fa",
        {
          otp: otp,
        }
      );

      console.log(res.data);

      alert("تم تفعيل الحساب بنجاح");

      // بعد التفعيل نروح للـ login
      navigate("/login");

    } catch (err) {
      console.log(err.response?.data || err.message);

      alert("الكود غير صحيح أو انتهت صلاحيته");
    }
  };

  return (
    <div>
      <h2>تفعيل الحساب</h2>

      <p>أدخل الكود المرسل إلى: {email}</p>

      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="أدخل OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <button type="submit">تأكيد</button>
      </form>
    </div>
  );
}

export default VerifyOtp;
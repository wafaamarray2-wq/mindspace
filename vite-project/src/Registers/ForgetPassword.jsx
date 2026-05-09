import { useState } from "react";
import axios from "axios";
import "./reg.css"; // نفس ستايلك عادي

export default function ForgetPassword() {
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [cNewPassword, setCNewPassword] = useState("");

  // 1️⃣ send otp
  const sendOtp = async (e) => {
    e.preventDefault();

    try {
      await axios.post("https://mind-space-ov3r.onrender.com/auth/send-otp", {
        email,
      });

      alert("تم إرسال الكود على الإيميل");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "حصل خطأ");
    }
  };

  // 2️⃣ verify otp
  const verifyOtp = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/forget-password-verify-otp",
        {
          email,
          otp,
        }
      );

      alert("تم التحقق من الكود");
      setStep(3);
    } catch (err) {
      alert(err.response?.data?.message || "كود غير صحيح");
    }
  };

  // 3️⃣ reset password
  const resetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== cNewPassword) {
      return alert("كلمة المرور غير متطابقة");
    }

    try {
      await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/forget-password",
        {
          email,
          newPassword,
          cNewPassword,
        }
      );

      alert("تم تغيير كلمة المرور بنجاح");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setCNewPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "حصل خطأ");
    }
  };

  return (
    <div className="register">
      <div className="content">
        <form className="frm">

          <h2>استعادة كلمة المرور</h2>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                type="email"
                placeholder="الإيميل"
                className="rad"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button onClick={sendOtp}>إرسال الكود</button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                type="text"
                placeholder="الكود"
                className="rad"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button onClick={verifyOtp}>تأكيد الكود</button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input
                type="password"
                placeholder="كلمة المرور الجديدة"
                className="rad"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                className="rad"
                value={cNewPassword}
                onChange={(e) => setCNewPassword(e.target.value)}
              />

              <button onClick={resetPassword}>تغيير كلمة المرور</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
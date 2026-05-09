import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LogOut() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "https://mind-space-ov3r.onrender.com/auth/logout",
        {
          flag: "logoutFromAllDevices"
        },
        {
          headers: {
            Authorization: `dash ${token}`
          }
        }
      );

      // بعد نجاح الـ API
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      navigate("/login");

    } catch (err) {
      console.log(err.response?.data || err.message);

      // حتى لو فشل، نسجّل خروج محلي
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      navigate("/login");
    }
  };

  return (
    <button onClick={handleLogout}>
      تسجيل الخروج
    </button>
  );
}
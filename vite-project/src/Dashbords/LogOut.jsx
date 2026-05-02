import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function LogOut() {
  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {
      axios.post(
        "https://mind-space-ov3r.onrender.com/auth/logout",
        { flag: "logoutFromAllDevices" },
        {
          headers: {
            Authorization: `dash ${token}`
          }
        }
      ).catch(() => {});
    }

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/login");

  }, []);

  return <h2>جاري تسجيل الخروج...</h2>;
}

export default LogOut;
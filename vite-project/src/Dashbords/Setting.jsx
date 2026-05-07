import { useEffect, useState } from "react";
import axios from "axios";
import "./settings.css";

export default function Settings() {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ===== GET USER (بس للعرض مش للـ input) =====
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get(
          "https://mind-space-ov3r.onrender.com/user/profile",
          {
            headers: {
              Authorization: `dash ${token}`,
            },
          }
        );

        // ❗ مهم: مش بنحطها في الفورم عشان يفضل فاضي زي ما طلبتي
        console.log("Current user:", res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    getUser();
  }, []);

  // ===== HANDLE CHANGE =====
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ===== UPDATE USER =====
  const handleSave = async () => {
    try {
      setLoading(true);

      await axios.put(
        "https://mind-space-ov3r.onrender.com/user/update-user",
        {
          userName: form.userName,
          email: form.email,
          password: form.password,
        },
        {
          headers: {
            Authorization: `dash ${token}`,
          },
        }
      );

      alert("Profile updated successfully ✅");

      // (اختياري) تمسحي الفورم بعد الحفظ
      setForm({
        userName: "",
        email: "",
        password: "",
      });
    } catch (err) {
      console.log(err);
      alert("Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="layout">

        <div className="content-set">

          <h1>Account Settings</h1>

          <div className="grid">

            {/* NAME */}
            <div className="box-set">
              <label>Name</label>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
                placeholder="Enter new name"
              />
            </div>

            {/* EMAIL */}
            <div className="box-set">
              <label>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter new email"
              />
            </div>

            {/* PASSWORD */}
            <div className="box full">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
              />
            </div>

          </div>

          {/* SAVE BUTTON */}
          <button
            className="set-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

        </div>

      </div>
    </div>
  );
}
import { useState } from "react";
import "./settings.css";

export default function SettingPatients() {
  const [form, setForm] = useState({
    name: "Ali Patient",
    email: "patient@mail.com",
    password: "",
    newPassword: "",
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleSave = () => {
    alert("Profile updated successfully ✅");
  };

  return (
    <div className="page">

      <div className="layout">

        {/* LEFT SIDE */}
        <div className="side">

          <img
            src={image || "https://via.placeholder.com/120"}
            className="avatar"
            alt="profile"
          />

          <h2>{form.name}</h2>
          <p>Patient Account</p>

          <label className="upload">
            Change Photo
            <input
              type="file"
              hidden
              onChange={handleImageChange}
            />
          </label>

        </div>

        {/* RIGHT SIDE */}
        <div className="content-set">

          <h1>Patient Settings</h1>

          <div className="grid">

            <div className="box-set">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="box-set">
              <label>Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="box full">
              <label>Current Password</label>
              <input type="password" />
            </div>

            <div className="box full">
              <label>New Password</label>
              <input type="password" />
            </div>

          </div>

          <button className="set-btn" onClick={handleSave}>
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}

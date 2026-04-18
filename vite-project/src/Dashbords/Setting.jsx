import { useState } from "react";
import "./settings.css";

export default function Settings() {
  const [form, setForm] = useState({
    name: "Dr. Ahmed",
    email: "doctor@mail.com",
    password: "",
    newPassword: "",
  });

  const [image, setImage] = useState(null);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    alert("Changes Saved ✅");
  };

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setImage(URL.createObjectURL(file));
  }
};
  return (
    <div className="settings-container">
      <h2>Settings</h2>

      {/* Profile Info */}
      <div className="image-section">
  <img
    src={image || "https://via.placeholder.com/100"}
    alt="profile"
    className="profile-img"
  />

  <input type="file" onChange={handleImageChange} />
</div>
      <div className="card">
        <h3>Profile Info</h3>

        <label>Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      {/* Change Password */}
      <div className="card">
        <h3>Change Password</h3>

        <label>Current Password</label>
        <input
          type="password"
          name="password"
          onChange={handleChange}
        />

        <label>New Password</label>
        <input
          type="password"
          name="newPassword"
          onChange={handleChange}
        />
      </div>

      {/* Actions */}
      <button className="save-btn" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
}

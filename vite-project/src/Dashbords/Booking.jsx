import { useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Book from "../images/book.avif";
import "./Booking.css";
import { useLang } from "../i18n/LanguageContext";

export default function Booking() {
  const { t } = useLang();
  const { id } = useParams();
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2027-01-01");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const times = ["10:00", "11:00", "12:00", "02:00", "04:00"];

  const handleConfirmBooking = async () => {
    if (!selectedDate) {
      toast.warning(t("selectDateWarning"));
      return;
    }
    if (!selectedTime) {
      toast.warning(t("selectTimeWarning"));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const therapistId = id || "69d4df0bc42edaef1d9433e3";
      const sessionTime = `${selectedDate} ${selectedTime}`;

      const response = await axios.post(
        "https://mind-space-ov3r.onrender.com/session/request",
        { therapistId, sessionTime },
        { headers: { Authorization: `dash ${token}` } }
      );

      toast.success(t("bookingSuccess"));
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t("bookingError");
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-container">
      <div className="container">
        <h2 className="title">{t("bookSession")}</h2>

        <div className="book-details">
          <div className="image">
            <img src={Book} alt="Booking" />
          </div>

          <h2>{t("selectDateTime")}</h2>

          <div className="form" style={{ maxWidth: "500px", margin: "0 auto 20px" }}>
            <div className="input-group">
              <span className="icon">📅</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <span className="icon">👤</span>
              <input
                type="text"
                placeholder={t("fullName")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <span className="icon">📞</span>
              <input
                type="number"
                placeholder={t("phoneNumber")}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="times-grid">
            {times.map((time) => (
              <button
                key={time}
                className={`time-btn ${selectedTime === time ? "active" : ""}`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>

          <hr className="divider" />

          <button
            className="confirm-btn"
            onClick={handleConfirmBooking}
            disabled={loading}
          >
            {loading ? t("confirming") : t("confirmBooking")}
          </button>
        </div>
      </div>
    </div>
  );
}
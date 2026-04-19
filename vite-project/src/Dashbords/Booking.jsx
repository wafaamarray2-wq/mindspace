import { useParams } from "react-router-dom";
import { useState } from "react";
import Book  from '..//images/book.avif'
import "./Booking.css";


export default function Booking() {
  const { id } = useParams();
  const [selectedTime, setSelectedTime] = useState(null);

  const times = ["10:00", "11:00", "12:00", "02:00", "04:00"];

  return (
    <div className="booking-container">
        <div className="container">

      
      <h2 className="title">حجز جلسة</h2>

     <div className="book-details">
        <div className="image">
           <img src={Book} alt="" />  
        </div>
    
    
      <h2>:اختر الموعد المناسب</h2>
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

      <div className="form">
  <div className="input-group">
    <span className="icon">👤</span>
    <input type="text" placeholder="الاسم بالكامل" />
  </div>

  <div className="input-group">
    <span className="icon">📞</span>
    <input type="number" placeholder="رقم الهاتف" />
  </div>
</div>
       <button
        className="confirm-btn"
        onClick={() => alert(`تم حجز ${selectedTime}`)}
      >
        تأكيد الحجز
      </button>
     </div>

     

     
    </div> 
     </div>
  );
}
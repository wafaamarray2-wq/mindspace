import React from "react";
import './foot.css'
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* القسم 1: شعار + نبذة */}
        <div className="footer-col">
          <h2 className="footer-logo">Mind Space</h2>
          <p>منصة لدعمك النفسي وتقديم الاستشارات للطلاب بسهولة وأمان.</p>
        </div>

        {/* القسم 2: روابط سريعة */}
        <div className="footer-col">
          <h3>روابط سريعة</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/therapists">Therapists</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Register</a></li>
          </ul>
        </div>

        {/* القسم 3: تواصل */}
        <div className="footer-col">
          <h3>تواصل معنا</h3>
          <ul className="socials">
            <li><a href="#">فيسبوك</a></li>
            <li><a href="#">تويتر</a></li>
            <li><a href="#">إنستجرام</a></li>
          </ul>
        </div>
      </div>

      {/* السطر السفلي */}
      <div className="footer-bottom">
        © 2026 Mind Space | جميع الحقوق محفوظة
      </div>
    </footer>
  );
}

export default Footer;
import React from "react";
import './foot.css'

function Footer() {
  return (
    <footer className="footer">

      {/* ── Decorative top wave ── */}
      <div className="footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,0 L0,0 Z" fill="#f2f8f5" />
        </svg>
      </div>

      <div className="footer-container">

        {/* القسم 1: شعار + نبذة */}
        <div className="footer-col footer-col--brand">
          <h2 className="footer-logo">
            <span className="footer-logo__dot">✦</span>
            Mind Space
          </h2>
          <p>منصة لدعمك النفسي وتقديم الاستشارات للطلاب بسهولة وأمان.</p>

          {/* Trust badges */}
          <div className="footer-trust">
            <span className="footer-trust__badge">🔒 آمن وسري</span>
            <span className="footer-trust__badge">✅ معتمد</span>
          </div>
        </div>

        {/* القسم 2: روابط سريعة */}
        <div className="footer-col">
          <h3>
            <span className="footer-col__bar" aria-hidden="true" />
            روابط سريعة
          </h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/therapists">Therapists</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Register</a></li>
          </ul>
        </div>

        {/* القسم 3: تواصل */}
        <div className="footer-col">
          <h3>
            <span className="footer-col__bar" aria-hidden="true" />
            تواصل معنا
          </h3>
          <ul className="socials">
            <li>
              <a href="#">
                <span className="social-icon" aria-hidden="true">f</span>
                فيسبوك
              </a>
            </li>
            <li>
              <a href="#">
                <span className="social-icon" aria-hidden="true">𝕏</span>
                تويتر
              </a>
            </li>
            <li>
              <a href="#">
                <span className="social-icon" aria-hidden="true">◈</span>
                إنستجرام
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* ── Divider ── */}
      <div className="footer-divider" aria-hidden="true" />

      {/* السطر السفلي */}
      <div className="footer-bottom">
        <span>© 2026 Mind Space</span>
        <span className="footer-bottom__sep" aria-hidden="true">·</span>
        <span>جميع الحقوق محفوظة</span>
      </div>

    </footer>
  );
}

export default Footer;
import React from 'react'
import Hero from '../images//photo_2026-03-01_01-42-02.jpg'
import './hero.css'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const native = useNavigate()

  return (
    <div className='hero-sec'>

      {/* ── Decorative background blobs ── */}
      <div className="hero-blob hero-blob--1" aria-hidden="true" />
      <div className="hero-blob hero-blob--2" aria-hidden="true" />
      <div className="hero-blob hero-blob--3" aria-hidden="true" />

      <div className="contain">

        {/* ── RIGHT: Image column ── */}
        <div className="image">
          {/* Glow ring behind the photo */}
          <div className="image-glow" aria-hidden="true" />
          <img src={Hero} alt="صورة الدعم النفسي" className='hero-img' />

          {/* Floating badge — top-left of image */}
          <div className="hero-badge hero-badge--top">
            <span className="hero-badge__icon">✦</span>
            <span>دعم نفسي</span>
          </div>

          {/* Floating badge — bottom-right of image */}
          <div className="hero-badge hero-badge--bottom">
            <span className="hero-badge__icon">🎓</span>
            <span>طلاب الجامعة</span>
          </div>
        </div>

        {/* ── LEFT: Content column ── */}
        <div className="hero-content">

          {/* Eyebrow label */}
          <div className="hero-eyebrow">
            <span className="hero-eyebrow__dot" />
            مساحة آمنة · دعم نفسي
          </div>

          <div className="text">
            <h1>
              مساحتك الآمنة
              <span className="hero-h1-accent"> لدعمك النفسي</span>
            </h1>
            <p>
              نساعدك تتخطى الضغط الدراسي وتلاقي الدعم اللي تستحقه
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="btn">
            <Stack spacing={2} direction="row">
              <Button
                className='btn1'
                variant="contained"
                sx={{ background: '#3b7d7f' }}
                onClick={() => native("/register")}
              >
                احجز الان
              </Button>
              <Button
                className='btn2'
                variant="outlined"
                sx={{ color: '#3b7d7f' }}
               onClick={() => native("/test")}
              >
                ابدا الاختبار
              </Button>
            </Stack>
          </div>

          {/* Social proof strip */}
          <div className="hero-proof">
            <div className="hero-proof__avatars" aria-hidden="true">
              <span>😊</span><span>🙂</span><span>😌</span><span>🤗</span>
            </div>
            <p className="hero-proof__text">
              +٢٠٠٠ طالب استفادوا من الخدمة
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default HeroSection
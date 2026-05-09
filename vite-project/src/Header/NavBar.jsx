import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link, useLocation } from "react-router-dom";
import Logo from "../images/logo.png";
import './nav.css'

function Navbar() {
  // ── scroll shadow state (UI only) ──
  const [scrolled, setScrolled] = useState(false);
  // ── mobile menu toggle ──
  const [menuOpen, setMenuOpen] = useState(false);
  // ── active route highlight ──
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const navLinks = [
    { label: "Home",        to: "/"           },
    { label: "Therapists",  to: "/therapists" },
    { label: "Login",       to: "/login"      },
    { label: "Register",    to: "/register"   },
  ];

  return (
    <AppBar
      position="sticky"
      className={`nav-br${scrolled ? " nav-br--scrolled" : ""}`}
      sx={{ background: "transparent", boxShadow: "none" }}
    >
      <Toolbar className="nav-toolbar">

        {/* ── BRAND ── */}
        <Typography variant="h6" component="div" className="logo-m">
          <div className="logo-img-wrap">
            <img src={Logo} alt="MindSpace logo" className="logo-img" />
          </div>
          <h5>Mind Space</h5>
        </Typography>

        {/* ── DESKTOP LINKS ── */}
        <nav className="nav-links">
          {navLinks.map(({ label, to }) => (
            <Button
              key={to}
              className={`nav-link-btn${location.pathname === to ? " nav-link-btn--active" : ""}`}
              component={Link}
              to={to}
              sx={{ color: "#e6f4f1" }}
            >
              {label}
              {/* active underline dot */}
              {location.pathname === to && (
                <span className="nav-active-dot" aria-hidden="true" />
              )}
            </Button>
          ))}
        </nav>

        {/* ── MOBILE HAMBURGER ── */}
        <button
          className={`nav-hamburger${menuOpen ? " nav-hamburger--open" : ""}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>
      </Toolbar>

      {/* ── MOBILE DRAWER ── */}
      <div className={`nav-mobile-menu${menuOpen ? " nav-mobile-menu--open" : ""}`}>
        {navLinks.map(({ label, to }) => (
          <Button
            key={to}
            className={`nav-mobile-link${location.pathname === to ? " nav-mobile-link--active" : ""}`}
            component={Link}
            to={to}
            sx={{ color: "#e6f4f1" }}
            fullWidth
          >
            {label}
          </Button>
        ))}
      </div>
    </AppBar>
  );
}

export default Navbar;
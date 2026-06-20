import { Navigate } from "react-router-dom";
import Navbar from "../Header/NavBar";
import HeroSection from "./HeroSection";
import Footer from "../Footer/Footer";


export default function HomeRoute() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (token && role === "therapist") {
    return <Navigate to="/doctor-dashboard" replace />;
  }
  if (token && role === "patient") {
    return <Navigate to="/patient-dashboard" replace />;
  }

  return (
    <>
      <Navbar />
      <HeroSection />
      <Footer />
    </>
  );
}
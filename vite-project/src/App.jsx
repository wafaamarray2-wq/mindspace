import "./App.css";
import Navbar from "./Header/NavBar";
import HeroSection from "./Home/HeroSection";
import Footer from "./Footer/Footer";
import { Routes, Route } from "react-router-dom"; // ✅ بدون Router هنا
import Therapists from "./Therapists/Therapists";
import Regester from "./Registers/Regester";
import Login from "./Registers/Login";
import DoctorDashbord from "./Dashbords/doctorDashbord";
import PatientDashbord from "./Dashbords/PatientDashbord";

function App() {
  return (
      <Routes>
        <Route path="/" element={<><Navbar /><HeroSection /><Footer /></>} />
        <Route path="/therapists" element={<><Navbar /><Therapists /><Footer /></>} />
        <Route path="/register" element={<><Navbar /><Regester /><Footer /></>} />
        <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
        <Route path="/doctor-dashboard" element={<DoctorDashbord />} />
        <Route path="/patient-dashboard" element={<PatientDashbord />} />
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
  );
}

export default App;
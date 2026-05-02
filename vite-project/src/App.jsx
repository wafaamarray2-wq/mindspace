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
import Patients from "./Dashbords/Patients";
import DashbordContent from "./Dashbords/DashbordContent";
import Messages from "./Dashbords/Messages";
import Sessions from "./Dashbords/Sessions";
import Setting from "./Dashbords/Setting";
import LogOut from "./Dashbords/LogOut";
import PatientProfile from "./Dashbords/PatientProfile";
import SessionDetails from "./Dashbords/SessionDetails";
import DoctorProfile from "./Dashbords/DoctorProfile";
import Booking from "./Dashbords/Booking";
import PatientHome from "./Dashbords/PatientHome";
import MessagePatient from "./Dashbords/MessagePatient";
import SettingPatients from "./Dashbords/SettingPatients";
 import VerifyOtp from "./Registers/VerifyOtp";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <HeroSection />
            <Footer />
          </>
        }
      />
      <Route
        path="/therapists"
        element={
          <>
            <Navbar />
            <Therapists />
            <Footer />
          </>
        }
      />
      <Route
        path="/register"
        element={
          <>
            <Navbar />
            <Regester />
            <Footer />
          </>
        }
      />
      <Route
        path="/login"
        element={
          <>
            <Navbar />
            <Login />
            <Footer />
          </>
        }
      />
      <Route path="/doctor-dashboard" element={<DoctorDashbord />}>
        <Route index element={<DashbordContent />} /> {/* صفحة الرئيسية */}
        <Route path="dash" element={<DashbordContent />} />
        <Route path="patients" element={<Patients />} />
        <Route path="message" element={<Messages />} />
        <Route path="session" element={<Sessions />} />
        <Route path="setting" element={<Setting />} />
        <Route path="logOut" element={<LogOut />} />
      </Route>


      <Route path="/patient-dashboard" element={<PatientDashbord />} >

     <Route index element={<PatientHome />} />
        <Route path="message" element={<MessagePatient />} />
        <Route path="setting" element={<SettingPatients />} />
      <Route path="logOut" element={<LogOut />} />
      </Route> 
      <Route path="/PatientHome" element={<PatientHome />} />
      <Route path="/patient/:id" element={<PatientProfile />} />
      <Route path="/session/:id" element={<SessionDetails />} />
      <Route path="/doctor/:id" element={<DoctorProfile />} />
     
      <Route path="/booking/:id" element={<Booking />} />

      <Route path="/doctor" element={<Therapists />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
   
      <Route path="*" element={<h1>Page Not Found</h1>} />
    </Routes>
  );
}

export default App;

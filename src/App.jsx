import "./App.css";
import Navbar from "./Header/NavBar";
import HeroSection from "./Home/HeroSection";
import Footer from "./Footer/Footer";
import { Routes, Route } from "react-router-dom";
import Therapists from "./Therapists/Therapists";
import Regester from "./Registers/Regester";
import Login from "./Registers/Login";
import DoctorDashbord from "./Dashbords/doctorDashbord";
import PatientDashbord from "./Dashbords/PatientDashbord";
import DashboardHeader from "./Dashbords/DashbordHeader";
function App() {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <>
              {" "}
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
   
        <Route path="/doctor-dashboard" element={
          <>
               <DashboardHeader/>
                <DoctorDashbord />
          </>
         
          } />
        <Route path="/patient-dashboard" element={
          <>
           <DashboardHeader/>
           <PatientDashbord />
          </>
          
          } />
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;

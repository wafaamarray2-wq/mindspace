import React from "react";
import "./doc.css";
import Doct from "..//images/photo_2026-03-04_02-40-53.jpg";
import { IoPerson } from "react-icons/io5";
import { IoHome } from "react-icons/io5";
import { MdEventNote } from "react-icons/md";
import { MdSettings } from "react-icons/md";
import { BiMessageSquareDots } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { FaHome } from "react-icons/fa";
import { Link,Outlet } from "react-router-dom";
import { BiSolidStar } from "react-icons/bi";



function DoctorDashbord() {
  return (
    <div className="dashbord">
      <div className="dash-content">
        <div className="sidebar">
          <div className="head">
            <div className="image">
              <img src={Doct} alt="" />

            </div>
            
            <h3>Dr. Ahmed</h3>
            <p>physology</p>
          </div>

          <ul>

            
   <li className="link">
  <Link to="/" className="link-content">
    <span>
      <IoHome />
    </span>
    <h5>Home</h5>
  </Link>
</li>
            <li>
                <Link to='dash'>
                
                   <span>
                <IoHome />
              </span>
              <h5>Dashbord</h5>
                </Link>
              {" "}
           
            </li>

            <li>
              <Link to='patients'>
              
                  <span>
                <IoPerson />
              </span>
              <h5>Patients</h5>
          
              
              </Link>
              {" "}
            </li>
            <li>

                 <Link to='message'>
                 
                    <span>
                <BiMessageSquareDots />
              </span>
              <h5>Messages</h5>
                 </Link>
              {" "}
           
            </li>

            <li>
                 <Link to='session'>
                 
                      <span>
                <MdEventNote />
              </span>
              <h5>Sessions</h5>
                 </Link>
              {" "}
         
            </li>

            <li>

                 <Link to='setting'>
                  <span>
                <MdSettings />
              </span>
              <h5>Settings</h5>
                 </Link>
              {" "}
             
            </li>
            <li className="log-out">

                 <Link to='logOut'>
                   <span>
                <MdLogout />
              </span>
              <h5>Log Out</h5>
                 </Link>
              {" "}
            
            </li>
          </ul>
        </div>

        <div className="details">


         <Outlet />
      
    </div>
        </div>
      </div>
   
  );
}

export default DoctorDashbord;

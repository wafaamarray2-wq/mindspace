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
import { Link } from "react-router-dom";
import { BiSolidStar } from "react-icons/bi";


const data = [
  { name: "Ali", condition: "Stable", status: "Active" },
  { name: "Mohamed", condition: "Critical", status: "Done" },
  { name: "Sara", condition: "Recovering", status: "Active" },
];
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
              {" "}
              <span>
                <IoHome />
              </span>
              <h5>Dashbord</h5>
            </li>

            <li>
              {" "}
              <span>
                <IoPerson />
              </span>
              <h5>Patients</h5>
            </li>
            <li>
              {" "}
              <span>
                <BiMessageSquareDots />
              </span>
              <h5>Messages</h5>
            </li>

            <li>
              {" "}
              <span>
                <MdEventNote />
              </span>
              <h5>Sessions</h5>
            </li>

            <li>
              {" "}
              <span>
                <MdSettings />
              </span>
              <h5>Settings</h5>
            </li>
            <li className="log-out">
              {" "}
              <span>
                <MdLogout />
              </span>
              <h5>Log Out</h5>
            </li>
          </ul>
        </div>

        <div className="details">
          <div className="boxes">



            <div className="box">
              <p>Total Patients</p>
              <div className="number">
                 <span>50</span>
              </div>
             
            </div>
            <div className="box">
              <p>Sessions</p>
             <div className="number">
                 <span>120</span>
              </div>
            </div>
            <div className="box">
              <p>Rating</p>
             
              <div className="number">
                 <span>4.5 <BiSolidStar /></span>
              </div>
            </div>
          </div>

           <div className="table-container">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Condition</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.condition}</td>
              <td className={item.status === "Active" ? "status-active" : "status-inactive"}>
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashbord;

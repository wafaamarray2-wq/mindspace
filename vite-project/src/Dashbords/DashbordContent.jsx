// DashbordContent.js
import React from "react";
import { BiSolidStar } from "react-icons/bi";
import './doc.css'
const data = [
  { name: "Ali", condition: "Stable", status: "Active" },
  { name: "Mohamed", condition: "Critical", status: "Done" },
  { name: "Sara", condition: "Recovering", status: "Active" },
];

function DashbordContent() {
  return (
    <div>
      {/* Boxes */}
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

      {/* Patients Table */}
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
  );
}

export default DashbordContent;

import React from 'react'
import './patients.css'
import Sic from "..//images/photo_2026-03-04_02-40-47.jpg";
function Patients() {
  return (
    <div className='patients'>
      <h1>Patients</h1>
      <div className="boxes">
        <div className="box">
            <div className="image">
                <img src={Sic} alt=""  style={{width:"80px"}}/>
            </div>
            <div className="content">
                <h2>Ali</h2>
                <p> <strong>Condition:</strong> Stable  </p>
                <p> <strong> Status:</strong> Active        </p>
                <button >View Profile</button>
            </div>
        </div>
        <div className="box">
            <div className="image">
                <img src={Sic} alt=""  style={{width:"80px"}}/>
            </div>
            <div className="content">
                <h2>Ali</h2>
                <p> <strong>Condition:</strong> Stable  </p>
                <p> <strong> Status:</strong> Active        </p>
                <button >View Profile</button>
            </div>
        </div>
        <div className="box">
            <div className="image">
                <img src={Sic} alt=""  style={{width:"80px"}}/>
            </div>
            <div className="content">
                <h2>Ali</h2>
                <p> <strong>Condition:</strong> Stable  </p>
                <p> <strong> Status:</strong> Active        </p>
                <button >View Profile</button>
            </div>
        </div>
        <div className="box">
            <div className="image">
                <img src={Sic} alt=""  style={{width:"80px"}}/>
            </div>
            <div className="content">
                <h2>Ali</h2>
                <p> <strong>Condition:</strong> Stable  </p>
                <p> <strong> Status:</strong> Active        </p>
                <button >View Profile</button>
            </div>
        </div>
        <div className="box">
            <div className="image">
                <img src={Sic} alt=""  style={{width:"80px"}}/>
            </div>
            <div className="content">
                <h2>Ali</h2>
                <p> <strong>Condition:</strong> Stable  </p>
                <p> <strong> Status:</strong> Active        </p>
                <button >View Profile</button>
            </div>
        </div>
        <div className="box">
            <div className="image">
                <img src={Sic} alt=""  style={{width:"80px"}}/>
            </div>
            <div className="content">
                <h2>Ali</h2>
                <p> <strong>Condition:</strong> Stable  </p>
                <p> <strong> Status:</strong> Active        </p>
                <button >View Profile</button>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Patients

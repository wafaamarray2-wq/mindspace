import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import Logo from '../images/photo_2026-03-01_01-42-02 (2).jpg'
import './nav.css'
function Navbar() {
  return (
    <AppBar position="static" sx={{background:'#2f6f73'}} className="nav-br" >
      <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
        
        <Typography variant="h6" component="div" className="logo-m">
            <img src= {Logo}alt="" className="logo-img"/>
            <h5>  Mind Space</h5>
        
        </Typography>

        {/* اليمين: الروابط */}
        <div>
          <Button sx={{color:'#e6f4f1'}} component={Link} to="/">Home</Button>
          <Button sx={{color:'#e6f4f1'}} component={Link} to="/therapists">Therapists</Button>
          <Button sx={{color:'#e6f4f1'}} component={Link} to="/login">Login</Button>
          <Button sx={{color:'#e6f4f1'}} component={Link} to="/register">Register</Button>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
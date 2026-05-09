import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { TherapistProvider } from "./Therapists/TherapistContext";
import { UserProvider } from './UserContext.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TherapistProvider>
          <UserProvider>
        <App />
        <ToastContainer position="top-right" autoClose={2000} />
        </UserProvider>
      </TherapistProvider>
    </BrowserRouter>
  </StrictMode>
);
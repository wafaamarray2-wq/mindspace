import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { TherapistProvider } from "./Therapists/TherapistContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TherapistProvider>
        <App />
      </TherapistProvider>
    </BrowserRouter>
  </StrictMode>
);
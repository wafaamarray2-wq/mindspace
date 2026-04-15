import React from 'react'
import Hero from '../images/photo_2026-03-01_01-42-02.jpg'
import './hero.css'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
function HeroSection() {
  const native=useNavigate()
  return (
    <div className='hero-sec'>
     <div className="contain">
        <div className="image">
            <img src={Hero} alt="" className='hero-img' />
        </div>
        <div className="hero-content">
            <div className="text">
            <h1>مساحتك الآمنة لدعمك النفسي</h1>
            <p>نساعدك تتخطى الضغط الدراسي وتلاقي الدعم اللي تستحقه</p>
            </div>
             <div className="btn">
           <Stack spacing={2} direction="row">
 
      <Button className='btn1' variant="contained" sx={{background:'#3b7d7f'}} onClick={()=>native("/register")}>احجز الان</Button>
<Button
  className='btn2'
  variant="outlined"
  sx={{color:'#3b7d7f'}}
  onClick={() => window.location.href = "/test.html"}
>
  ابدا الاختبار
</Button>   </Stack>
      </div>
             
           
          
        
      </div>
     
     </div>
      
    </div>
  )
}

export default HeroSection

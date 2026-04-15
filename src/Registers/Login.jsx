import React from 'react'
import './reg.css'
import { MdEmail } from "react-icons/md";
import { IoMdPerson } from "react-icons/io";
import { RiLockPasswordFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { IoMdCalendar } from "react-icons/io"
import { CgGenderMale } from "react-icons/cg";
import Doct from '..//images/photo_2026-03-04_02-40-53.jpg'
import Sic from '..//images/photo_2026-03-04_02-40-47.jpg'
function Login() {
  return (
    <div>
       <div className='register'>
     <div className="content">
        <div className="text">
        <h1>ابدأ رحلتك نحو الدعم النفسي والتوازن!</h1>
        <p>خطوتك الأولى نحو راحة البال والدعم النفسي</p>
        </div>
      
        <form className='frm'>  
            <h2>  تسجيل الدخول</h2>

   

            <div className="inp">
                <span className="icon"><MdEmail /></span>
            <input type="email"  placeholder=' البريد الالكتروني' className='rad'/>    
            </div>

            <div className="inp">
                <span className="icon"><RiLockPasswordFill /></span>
            <input type="password"  placeholder=' كلمة المرور' className='rad'/>    
            </div>
      
        

           


            <button type='submit'>تسجيل الدخول</button>
            <div className=" cnt-lg">
                <Link to="/register">انشاء حساب</Link>
                <h5>ليس لديك حساب؟ </h5>
                
            </div>
        </form>
     </div>
    </div>
    </div>
  )
}

export default Login

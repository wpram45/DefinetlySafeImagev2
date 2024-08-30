import React from 'react'
import  "./styles/headerStyle.css"
export default function Header() {
  return (

    <div style={{marginTop:"40px",display:"flex",width:"100%",flexDirection:"column"}}>
    <img src="/logo2.svg" alt="DFINITY logo" />
    <h4 className='headerText'>
    "Definitely Safe Image Project" is associated with Şerif Geyik.
    </h4>
    </div>

  )
}

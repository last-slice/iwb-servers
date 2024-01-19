import React, { useRef, useState } from "react";
import { Container, Button, Row, Col, Table } from 'react-bootstrap'; // Import Bootstrap components

import glbpng from "../img/3dfile.png";
import imagepng from "../img/2dfile.png";
import audiopng from "../img/audio.png";
import bg from "../img/popupwide.png";
import {useNavigate} from "react-router-dom"

function AssetType({onClick}) {
  // const navigate = useNavigate();

  const colCentered ={
    display:"inline-block",
    float:'none',
    textAlign:'center',
  }

    const centerDivStyle = {
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize:'100% 100%',
        height:'25vh',
        width:'50%',
        textAlign:'center',
        verticalAlign:'middle',
        paddingTop:"3.5em"
      };

      
  return (
    <div className="ui dcl center" style={{backgroundColor:'black', top:"4em"}}>
    <div  style={centerDivStyle}>
    <div style={colCentered}>
      <img src={glbpng} onClick={()=>{onClick('3D')}} width={'75%'}/>
      </div>

      <div style={colCentered}>
      <img src={audiopng} onClick={()=>{onClick('Audio')}} width={'75%'}/>
      </div>

      <div style={colCentered}>
      <img src={imagepng} width={'75%'}/>
      </div>
    </div>
    </div>
  );
}

export default AssetType;

import React, { useRef, useState } from "react";
import { Container, Button, Row, Col, Table } from 'react-bootstrap'; // Import Bootstrap components

import glbpng from "../img/3dfile.png";
import imagepng from "../img/2dfile.png";
import audiopng from "../img/audio.png";
import bg from "../img/popupwide.png";
import {useNavigate} from "react-router-dom"

function AssetType({onClick}) {
  // const navigate = useNavigate(); 

    const centerDivStyle = {
        display: 'flex',
        justifyContent:'center',
        alignItems:'center',
        height: '100vh',
        backgroundColor:'black',
        backgroundImage: `url(${bg})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize:'100vw 100vh'
      };

      const data = [
        { id: 1, name: 'John', age: 25 },
        { id: 2, name: 'Alice', age: 30 },
        { id: 3, name: 'Bob', age: 22 },
        { id: 4, name: 'Eve', age: 28 },
        { id: 5, name: 'Charlie', age: 35 },
      ];

      
  return (
        <div style={centerDivStyle} >
      <img src={glbpng} onClick={()=>{onClick('3D')}} width={'20%'}/>
      <img src={audiopng} onClick={()=>{onClick('Audio')}} width={'20%'}/>
      <img src={imagepng} width={'20%'}/>
      </div>
  );
}

export default AssetType;

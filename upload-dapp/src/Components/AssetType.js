import React, { useRef, useState } from "react";
import { Container, Button, Row, Col, Table } from 'react-bootstrap'; // Import Bootstrap components

import uploadbg from "../img/uploadbg.png";
import {useNavigate} from "react-router-dom"

function AssetType({onClick}) {
  // const navigate = useNavigate(); 

    const centerDivStyle = {
        display: 'flex',
        justifyContent:'center',
        alignItems:'center',
        height: '100vh',
        backgroundColor:"black"
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
      <img src={uploadbg} onClick={()=>{onClick('3D')}} width={'20%'}/>
      <img src={uploadbg} onClick={()=>{onClick('Audio')}} width={'20%'}/>
      <img src={uploadbg} width={'20%'}/>
      </div>
  );
}

export default AssetType;

import React, { useRef, useState, useEffect } from "react";
import { Container, Button, Row, Col } from 'react-bootstrap'; // Import Bootstrap components
import GLBViewer from './GLBViewer'
import FileInput from './FileInput'
import background from '../img/columnbg.png'
import Form from 'react-bootstrap/Form';
import axios from 'axios'
import ProgressBar from 'react-bootstrap/ProgressBar';
import ReactAudioPlayer from 'react-audio-player';

import { DEBUG } from "../App";

const NFTStorageAuth = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDlCNTIyZDczN0UyOEMwOEFmNzhiQzM2Njk5QzVhMmM2ZDI4NDFBRmYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5NzI0MDY4MjY4OCwibmFtZSI6IklXQiBVUGxvYWRlciJ9.7nIofYjxMC6-y5RkNI6IYIOrxRritSH-NKGCz8KuMX4"

const styles = [
  "Choose a Style",
  "Cyberpunk",
  "Dunes & Caves",
  "Steampunk",
  "Western",
  "Fantasy",
  "Pirates",
  "Sci-Fi & Space",
  "House/Modern",
  "Weather/Environment",
  "Gallery/Venue",
  "Asian",
  "Voxels",
  "Ice",
  "Water",
  "Animals & WIldlife",
  "Holiday",
  "User Interface",
  "Building Block",
  "City & Commercial",
  "Old Fashioned",
  "Parks & Recreation",
  "Food"
]

function AudioAssets({handleFileSelect, audioFile, resetLoader,token, sceneKey}) {
    let file = null

    if(audioFile && file === null){
        file = audioFile
    }

  const centerDivStyle = {
    backgroundColor:"black",
    minHeight:'100vh'
  };

  const [uploadProgress, setUploadProgress] = useState(0)
  const [assetState, setAssetState] = useState("configure")
  const closeSuccess = ()=>{
    resetLoader()
    setAssetState('configure')
    window.close();
  }

  const [modelImageFile, setModelImageFile] = useState(null)
  const [modelImageLink, setModelImageLink] = useState('')
  const [modelImage, setModelImage] = useState('')
  const [modelName, setModelName] = useState('')
  const [modelDescription, setModelDescription] = useState('')
  const [style, setSelectedOption] = useState(styles[0]); // Set the initial selected option


  const [imageUploadStatus, setImageUploadStatus] = useState('')
  const [allChecksPassed, setAllChecksPassed] = useState(false)

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    checkFormCompletion()
  };

  const uploadImage = async () =>{
    setImageUploadStatus('uploading')

    var myHeaders = new Headers();
    myHeaders.append("Authorization", NFTStorageAuth);
  
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: modelImageFile
    };
    
    let response = await fetch("https://api.nft.storage/upload", requestOptions)
    let json = await response.json()

    if(json.ok){
      setModelImageLink("https://" + json.value.cid + ".ipfs.dweb.link")
      console.log("https://" + json.value.cid + ".ipfs.dweb.link")
      setImageUploadStatus('uploaded')
      checkFormCompletion(true)
    }
    else{
      console.log('error image upload')
      setImageUploadStatus('')
    }
  }

  const handleImageInput = (e) => {
    const file = e.target.files[0];
    setModelImageFile(file)

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        setModelImage(e.target.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const updateAssetName = (event) =>{
    setModelName(event.target.value)
    checkFormCompletion()
  }

  const updateDescription = (event) =>{
    setModelDescription(event.target.value)
    checkFormCompletion()
  }

  const onUploadProgress = event => {
    const percentCompleted = Math.round((event.loaded * 100) / event.total);
    console.log('onUploadProgress', percentCompleted);
    setUploadProgress(percentCompleted)
};

const checkModelSize = ()=>{
  if(file){
    if(file.size / 1024 / 1024 < 50){
      return true
    }else{
      return false
    }
  }else{
    return false
  }
}

  const checkFormCompletion = (image) =>{
    if(modelDescription!== "" && modelName !== "" && file && checkModelSize()){
      setAllChecksPassed(true)
    }else{
      console.log('not finished')
    }
  }

  const uploadAsset = async()=>{
    setAssetState('uploading')
    const formData = new FormData()
    formData.append('file', file);
    formData.append('name', modelName)
    formData.append('image', 'https://bafkreihxmbloqwqgjljwtq4wzhmo5pclxavyedugdafn2dhuzghgpszuim.ipfs.nftstorage.link/')
    formData.append('polycount', 0);
    formData.append('scale', JSON.stringify({x:1, y:1, z:1}))
    formData.append('type', 'Audio')
    formData.append('description', modelDescription)
    formData.append('style', style)
    formData.append('category', '')

    try {

      console.log('upload data is')
      const result = await axios.post((DEBUG ? "http://localhost:3525" : 'https://deployment.dcl-iwb.co') + "/upload", formData, 
        {headers: {
          'UploadAuth': `Bearer ${token}`,
          'SceneAuth': `Bearer ${sceneKey}`,
        }},
        {onUploadProgress});

        console.log('asset upload result is', result.data); // result is server's response

    } catch(error){
        console.error(error);
        setAssetState("failure")
    } finally {
      setAssetState("success")
        console.log('Upload complete');
        setTimeout(()=>{
                  // resetLoader()
        // setAssetState('configure')
        window.close();
        }, 2000)
    }
  }

  return (
    <div>

{/* upload modals */}
{assetState === "success" ? 
        
        <div className="ui page modals dimmer transition visible active" style={{display: "flex !important"}}>
        <div className="ui small modal transition visible active"><div className="dcl close ">
          <div className="close-icon" onClick={closeSuccess}></div></div>
          <div className="header">Asset Upload Success!</div>
          <div className="content"><p>Your asset will be processed shortly.</p></div></div></div>
    
    :null
  
  }

{assetState === "failure" ? 
        
        <div className="ui page modals dimmer transition visible active" style={{display: "flex !important"}}>
        <div className="ui small modal transition visible active"><div className="dcl close ">
          <div className="close-icon" onClick={closeSuccess}></div></div>
          <div className="header">Asset Upload Failure!</div>
          <div className="content"><p>Your asset did not upload properly.</p></div></div></div>
    
    :null
  
  }

{assetState === "uploading" ? 
        
        <div className="ui page modals dimmer transition visible active" style={{display: "flex !important"}}>
        <div className="ui small modal transition visible active"><div className="dcl close ">
          <div className="close-icon" onClick={closeSuccess}></div></div>
          <div className="header">Asset Upload in Progress..</div>
          <ProgressBar now={uploadProgress} />
          <div className="content"><p>{uploadProgress} %</p></div></div></div>
    
    :null
  
  }

    <div style={centerDivStyle} className="Page-story-container">

      <div className="dcl page">

        <div className="ui container">
      <Row>

<Col md={8} className="d-flex text-center align-items-center">

{file !== null && 

<div style={{marginTop:'5%'}}>
    <ReactAudioPlayer
  src={URL.createObjectURL(file)}
  controls
/>

{/* <audio id="audio-element" src={file}></audio> */}

  <div style={{minHeight:'50%'}}></div>
</div>

 }

 


</Col>

<Col md={4} style={{backgroundImage: `url(${background})`, backgroundRepeat: 'no-repeat', backgroundSize:"100% 100%", height:'100%', padding:'2em', overflow:'auto'}}>
<h1 className="mt-5" style={{textAlign:'center'}}>Audio Asset</h1>


{file === null && 
<Row style={{marginTop:"2em"}}>
  <Col className="align-items-center text-center">
  <FileInput type={"Select Audio File"} onFileSelect={handleFileSelect} />
  </Col>
</Row>
}

<Row style={{marginTop:"2em"}}>

  {/* file button and file name */}
  {file !== null && 
  <Col className="align-items-center text-center">
  <label className="ui button" onClick={resetLoader}>Change file
    </label><br></br>
    <span>{file && file.name}</span>
  </Col>
}

<Col>
  <Form>
  <table className="ui very basic table">
<thead className="">
  <tr className="">
    <th className=""></th>
    </tr>
    </thead>
    <tbody className="">

      {/* asset name */}
      <tr >
        <td className="closed" style={{padding:'1em'}}>
      <div className="ui sub header"><label>Asset Name</label></div>
      <div className="ui input" style={{width:'100%'}}><input type="text" value={modelName} onChange={updateAssetName}/></div>
          </td>
      </tr>

       {/* asset description */}
      <tr >
        <td className="closed" style={{padding:'1em'}}>
      <div className="ui sub header"><label>Asset Description</label></div>
      <div className="ui input" style={{width:'100%'}}><input type="text" value={modelDescription} onChange={updateDescription}/></div>
          </td>
      </tr>

      {/* asset style */}
             <tr >
        <td className="closed" style={{padding:'1em'}}>
      <div className="ui sub header"><label>Asset Style</label></div>
      <div className="" style={{width:'100%'}}>
        <select value={style} onChange={handleOptionChange}>
        {styles.map((style, i)=>(
              <option className="ui dropdown menu item" key={i} value={style}>{style}</option>
            ))}
            </select>
       </div>
          </td>
      </tr>

      {/* asset category */}
      {/* <tr >
        <td className="closed" style={{padding:'1em'}}>
      <div className="ui sub header"><label>Asset Category</label></div>
      <div className="ui input" style={{width:'100%'}}><input type="text" value=""/></div>
          </td>
      </tr> */}

        {allChecksPassed &&
      <tr>
        <td  className="align-items-center text-center">
        <label className="ui button large primary block lg" onClick={uploadAsset}>Upload Asset
          </label>
        </td>
      </tr>
      }
        </tbody>
      </table>
    </Form>
    </Col>

</Row>
</Col>


      </Row>
        </div>
      </div>
      </div>


  </div>

  );
}

export default AudioAssets;



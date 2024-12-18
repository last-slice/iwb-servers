import React, { useRef, useState, useEffect } from "react";
import { Container, Button, Row, Col } from 'react-bootstrap'; // Import Bootstrap components
import GLBViewer from './GLBViewer'
import FileInput from './FileInput'
import background from '../img/columnbg.png'
import Form from 'react-bootstrap/Form';
import axios from 'axios'
import ProgressBar from 'react-bootstrap/ProgressBar';
import { DEBUG } from "../App";

const pinataBearer = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlMjc2ZTk4Zi1iMjU2LTQyZWEtYTE5MC1jOTM3MTllZGZkYmMiLCJlbWFpbCI6Imxhc3RyYXVtQGxhc3RzbGljZS5vcmciLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZjFmYzJiOTEyODk4NDM5YTZmZWMiLCJzY29wZWRLZXlTZWNyZXQiOiJhNTgzMmUwODQ1NmQwZTAxNmE1MzVjNmIyYWNlNGMzYmZkNmYwODg5OTEzZWE3MGY5MmM2MWY2ZGVmOTg5MjU3IiwiZXhwIjoxNzUyMjc4MTc5fQ.VljjHh3h-p57SgAm2Md_AH4ETez4a4-c8ufnU7g2vRI"
// const pinataSDK = require('@pinata/sdk');


// const NFTStorageAuth = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDlCNTIyZDczN0UyOEMwOEFmNzhiQzM2Njk5QzVhMmM2ZDI4NDFBRmYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY5NzI0MDY4MjY4OCwibmFtZSI6IklXQiBVUGxvYWRlciJ9.7nIofYjxMC6-y5RkNI6IYIOrxRritSH-NKGCz8KuMX4"

function ThreeDAssets({handleFileSelect, glbFile, resetLoader,token, sceneKey, size}) {
  const model = glbFile

  const centerDivStyle = {
    backgroundColor:"black"
  };

  const [uploadProgress, setUploadProgress] = useState(0)
  const [assetState, setAssetState] = useState("configure")
  const closeSuccess = ()=>{
    resetLoader()
    setAssetState('configure')
    window.close();
  }

  
  const [polygonCount, setPolygonCount] = useState(0)
  const [modelSize, setSize] = useState(0)
  const [modelImageFile, setModelImageFile] = useState(null)
  const [modelImageLink, setModelImageLink] = useState(DEBUG ? "iamge" : '')
  const [modelImage, setModelImage] = useState('')
  const [modelName, setModelName] = useState('')
  const [modelDescription, setModelDescription] = useState('')
  const [scale, setScale] = useState({x:0, y:0, z:0})
  const [animations, setAnimations] = useState([])

  const [imageUploadStatus, setImageUploadStatus] = useState('')
  const [allChecksPassed, setAllChecksPassed] = useState(false)

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

  const [style, setSelectedOption] = useState(styles[0]); // Set the initial selected option

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
    checkFormCompletion()
  };

  const uploadImage = async () =>{
    setImageUploadStatus('uploading')

    // var myHeaders = new Headers();
    // myHeaders.append("Authorization", NFTStorageAuth);
  
    // var requestOptions = {
    //   method: 'POST',
    //   headers: myHeaders,
    //   body: modelImageFile
    // };
    
    // let response = await fetch("https://api.nft.storage/upload", requestOptions)
    // let json = await response.json()

    // if(json.ok){
    //   setModelImageLink("https://" + json.value.cid + ".ipfs.dweb.link")
    //   console.log("https://" + json.value.cid + ".ipfs.dweb.link")
    //   setImageUploadStatus('uploaded')
    //   checkFormCompletion(true)
    // }
    // else{
    //   console.log('error image upload')
    //   setImageUploadStatus('')
    // }

    if(DEBUG){
      setModelImageLink("test image")
      checkFormCompletion(true)
      setImageUploadStatus('uploaded')
    }
    else{
      try {
        const formData = new FormData();
        formData.append("file", modelImageFile);
    
        const pinataMetadata = JSON.stringify({
          name: modelName + modelImageFile.type,
        });
        formData.append("pinataMetadata", pinataMetadata);
    
        const pinataOptions = JSON.stringify({
          cidVersion: 0,
        });
        formData.append("pinataOptions", pinataOptions);
    
        const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${pinataBearer}`,
          },
          body: formData,
        });
        const resData = await res.json();
        console.log(resData);
        if(resData && resData.IpfsHash){
          // console.log("wait over")
          console.log("https://lsnft.mypinata.cloud/ipfs/" + resData.IpfsHash)
          setModelImageLink("https://lsnft.mypinata.cloud/ipfs/" + resData.IpfsHash)
          checkFormCompletion(true)
          setImageUploadStatus('uploaded')
        }else{
          setImageUploadStatus('')
        }
      } catch (error) {
        console.log(error);
        setImageUploadStatus('')
      }
    }

   

    // try{

    //   const options = {
    //     pinataMetadata: {
    //         name: modelName + modelImageFile.type
    //     },
    //     pinataOptions: {
    //         cidVersion: 1
    //     }
    //   };
  
    //   // const stream = fse.createReadStream(directory + file);
    //   const res = await pinata.pinFileToIPFS(modelImageFile, options)
    //   // console.log('res is', res)
    //   if(res && res.IpfsHash){
    //     // console.log("wait over")
    //     console.log("https://lsnft.mypinata.cloud/ipfs/" + res.IpfsHash)
    //     setModelImageLink("https://lsnft.mypinata.cloud/ipfs/" + res.IpfsHash)
    //     checkFormCompletion(true)
    //   }else{
    //     setImageUploadStatus('')
    //   }
    // }
    // catch(e){
    //   console.log('error pinning image', e)
    //   setImageUploadStatus('')
    // }

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


  const updateModelInfo = (info) =>{
    setPolygonCount(info.polygonCount)
    setScale(info.scale)

    let animations = []
    info.animations.forEach((animation)=>{
      animations.push({name:animation.name, duration: parseFloat(animation.duration.toFixed(2))})
    })
    setAnimations(animations)
  }

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
  if(model){
    if(model.size / 1024 / 1024 < 50){
      return true
    }else{
      return false
    }
  }else{
    return false
  }
}

  const checkFormCompletion = (image) =>{
    // if(DEBUG){
    //   setAllChecksPassed(true)
    //   return
    // }

    if(style !== styles[0] && modelDescription!== "" && modelName !== "" && (image || modelImageLink) !== "" && model && checkModelSize()){
      setAllChecksPassed(true)
    }else{
      console.log('not finished')
    }
  }

  const uploadAsset = async()=>{
    setAssetState('uploading')
    const formData = new FormData()
    formData.append('file', model);
    formData.append('name', modelName)
    formData.append('image', modelImageLink)
    formData.append('polycount', polygonCount);
    formData.append('scale', JSON.stringify(scale))
    formData.append('type', '3D')
    formData.append('description', modelDescription)
    formData.append('style', style)
    formData.append('category', '')
    
    if(animations.length > 0){
      formData.append('anims', JSON.stringify(animations))
    }


    console.log('animations is', animations)

    try {

      console.log('upload token is', token)
      const result = await axios.post((DEBUG ? "http://localhost:3525" : 'https://deployment.dcl-iwb.co') + "/upload", formData, 

        // const result = await axios.post('https://dcl-iwb.co/dcl/deployment/upload', formData, 
        {headers: {
          'UploadAuth': `Bearer ${token}`,
          'SceneAuth': `Bearer ${sceneKey}`,
        }},
        {onUploadProgress});

        console.log('asset upload result is', result.data); // result is server's response

        setAssetState("success")
        console.log('Upload complete');
        setTimeout(()=>{
                  // resetLoader()
        // setAssetState('configure')
        window.close();
        }, 2000)

    } catch(error){
        console.error(error);
        setAssetState("failure")
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

        <div className="ui container text-center align-items-center">
          <Row>
            <Col>
            <h1 style={{color:"#ffffff"}}>Custom Assets</h1></Col>
          </Row>

            <Row>
            <Col>
            <h3 style={{color:"#ffffff"}}>Space Used: {((size/100) * 100).toFixed(2)}%</h3>
            <h3 style={{color:"#ffffff"}}>{size} MB out of 100MB</h3>
            </Col>
          </Row>

      <Row>

<Col md={8} className="d-flex text-center align-items-center">

{glbFile !== null && 

<div style={{marginTop:'5%'}}>
  <GLBViewer glbFile={glbFile} cb={updateModelInfo}/>

  <div style={{minHeight:'20vh'}}></div>
</div>

 }

 


</Col>

<Col md={4} style={{backgroundImage: `url(${background})`, backgroundRepeat: 'no-repeat', backgroundSize:"100% 100%", height:'100%', padding:'2em', overflow:'auto'}}>
<h1 className="mt-5" style={{textAlign:'center'}}>3D Asset Options</h1>


{glbFile === null && 
<Row style={{marginTop:"2em"}}>
  <Col className="align-items-center text-center">
  <FileInput type={"Select a 3d file"} onFileSelect={handleFileSelect} />
  </Col>
</Row>
}

<Row style={{marginTop:"2em"}}>

  {/* file button and file name */}
  {glbFile !== null && 
  <Col className="align-items-center text-center">
  <label className="ui button" onClick={resetLoader}>Change file
    </label><br></br>
    <span>{glbFile && glbFile.name}</span>
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

       {/* asset image */}
       <tr >
        <td className="closed" style={{padding:'1em'}}>
      <div className="ui sub header"><label>Asset Image</label></div>
      <div className="ui input align-items-center text-center" style={{width:'100%'}} >
        
      {imageUploadStatus !== "uploading" && imageUploadStatus !== "uploaded" &&
      <label className="ui button">{modelImage !== "" ?  "Change Image" : "Select Image"}
      <input type="file" style={{display:'none'}} onChange={handleImageInput}/>
      </label>
      }
        
        </div>

        {imageUploadStatus !== "uploading" &&
      <div><br></br><img src={modelImage} width={'80%'}/></div>
         }

      {modelImageFile !== "" && imageUploadStatus === "" &&
      <div><br></br><label className="ui button large primary block lg" onClick={uploadImage}>Upload Thumbnail
          </label>
      </div>
      }

      {imageUploadStatus === "uploading" &&
      <div><br></br>Uploading...<br></br><span className="ui massive active loader" style={{position:'relative'}}/>
      </div>
      }

          </td>
      </tr>












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

export default ThreeDAssets;



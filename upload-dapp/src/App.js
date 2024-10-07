import {React, useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

import AssetType from './Components/AssetType'
import ThreeDAssets from './Components/3DAssets'
import AudioAssets from './Components/AudioAssets'
import { startTransition } from 'react';
import logo from './img/logo.png'
import axios from 'axios'

export const DEBUG = false

function App() {
  const [selectedAssetType, setSelectedAssetType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [assetUploadToken, setUploadToken] = useState(null)
  const [totalUGCSize, setTotalUGCSize] = useState(50000)

  const [user, setUser] = useState('');
  const [sceneKey, setKey] = useState('');
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Get the full URL
    const url = window.location.href;

    // Split the URL by '/' to extract the user and key values
    const urlParts = url.split('/');
    console.log('urlparts', urlParts)
    
    if (urlParts.length === 6) {
      console.log('we have correct parts')
      // Extract the dynamic values
      const value1 = urlParts[4];
      const value2 = urlParts[5];

      setUser(value1)
      setKey(value2)

      console.log(value1, value2)

      async function validateSceneToken(){
        try{
          const result = await axios.post((DEBUG ? "http://localhost:3525" : 'https://deployment.dcl-iwb.co') + '/scene/verify', { user:value1, admin:DEBUG ? "014cc3aa-abe4-404d-bc3c-fe6e56859efb" : undefined},
          {headers: {
            'Authorization': `Bearer ${value2}`,
          }},
          );
          
          if(result.data.valid){
            console.log('we ahv valid token', result.data)
            setUploadToken(result.data.token)
            setTotalUGCSize((result.data.size / (1024 ** 2)).toFixed(2))
            setConnected(true)
          }else{
            console.log('error getting upload token')
            setError(true)
          }
        }
        catch(e){
          console.log('error reacyhing server', error)
          setError(true)
        }
      }

      validateSceneToken()


    }else{
      console.log('show error')
    }


  }, []);

  const handleAssetOptionClick = (type) =>{
    console.log('clicked div', type)
        startTransition(() => {
      setSelectedAssetType(type)
    });

    // const clientRect = e.currentTarget.getBoundingClientRect();
    // if ((e.pageX - clientRect.left) < clientRect.width / 2)
    // console.log('Clicked left half');
    // else
    // console.log('Clicked right half');
    // startTransition(() => {
    //   setSelectedAssetType('3D')
    // });

    }

  // Callback function to receive the selected file from FileInput
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    console.log('file is', file)
  };

   // Callback function to receive the selected file from FileInput
   const resetLoader = (file) => {
    setSelectedAssetType(null)
    setSelectedFile(null)
  };


  return (

    <div>

          <div style={{backgroundColor:'#d7d7d7'}}>
            <img src={logo} width={300} onClick={resetLoader}></img>
        </div>

        {
          !connected &&
          error &&
          <div className="ui dcl center" style={{backgroundColor:'black', color:'white', top:"4em"}}>Connection Error. Please close this tab and try again.
            </div>
        }

        {
          !connected &&
          !error &&
          <div className="ui dcl center" style={{backgroundColor:'black', color:'white', top:"4em"}}>LOADING...
            </div>
        }


      {selectedAssetType === null && 
      connected &&
       <AssetType onClick={handleAssetOptionClick}/>}


      {selectedAssetType === '3D' && 
      connected &&
      <ThreeDAssets sceneKey={sceneKey} size={totalUGCSize} token={assetUploadToken} handleFileSelect={handleFileSelect} glbFile={selectedFile} resetLoader={resetLoader}/>
      }

      {selectedAssetType === 'Audio' && 
      connected &&
      <AudioAssets sceneKey={sceneKey} size={totalUGCSize} token={assetUploadToken} handleFileSelect={handleFileSelect} audioFile={selectedFile} resetLoader={resetLoader}/>
      }

    </div>


  );
}

export default App;

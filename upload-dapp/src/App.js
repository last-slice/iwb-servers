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

  const [user, setUser] = useState('');
  const [sceneKey, setKey] = useState('');

  useEffect(() => {
    // Get the full URL
    const url = window.location.href;

    // Split the URL by '/' to extract the user and key values
    const urlParts = url.split('/');
    console.log('urlparts', urlParts)
    
    if (urlParts.length === 6) {
      // Extract the dynamic values
      const value1 = urlParts[4];
      const value2 = urlParts[5];

      setUser(value1)
      setKey(value2)

      console.log(value1, value2)

      async function validateSceneToken(){
        const result = await axios.post((DEBUG ? "http://localhost:3525" : 'https://dcl-iwb.co/dcl/deployment') + '/scene/verify', { user:value1},
        {headers: {
          'Authorization': `Bearer ${value2}`,
        }},
        );
        
        if(result.data.valid){
          console.log('we ahv valid token', result.data.token)
          setUploadToken(result.data.token)
        }else{
          console.log('error getting upload token')
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


      {selectedAssetType === null &&  <AssetType onClick={handleAssetOptionClick}/>}


      {selectedAssetType === '3D' && 
      <ThreeDAssets sceneKey={sceneKey} token={assetUploadToken} handleFileSelect={handleFileSelect} glbFile={selectedFile} resetLoader={resetLoader}/>
      }

      {selectedAssetType === 'Audio' && 
      <AudioAssets sceneKey={sceneKey} token={assetUploadToken} handleFileSelect={handleFileSelect} audioFile={selectedFile} resetLoader={resetLoader}/>
      }

    </div>


  );
}

export default App;

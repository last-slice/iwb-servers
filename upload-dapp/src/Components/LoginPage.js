import {React, useEffect, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

import { startTransition } from 'react';
import axios from 'axios'


function LoginPage(){
      const [selectedAssetType, setSelectedAssetType] = useState(null);
      const [selectedFile, setSelectedFile] = useState(null);
      const [assetUploadToken, setUploadToken] = useState(null)
      const [totalUGCSize, setTotalUGCSize] = useState(50000)
    
      const [user, setUser] = useState('');
      const [sceneKey, setKey] = useState('');
      const [connected, setConnected] = useState(false)
      const [error, setError] = useState(false)
    
      useEffect(() => {
      })
      return(
        <div>
            </div>
      )
}


export default LoginPage;

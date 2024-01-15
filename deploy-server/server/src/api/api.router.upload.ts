import express, { Request, Response } from "express";
import fs from 'fs';
import { authenticateToken, handleAssetSigning, postNewAssetData } from "./api.service";
import { postPendingAsset } from "../upload";

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req:any, file:any, cb:any) {
        let dest =  (process.env.NODE_ENV === "Development" ? process.env.DEV_UPLOAD_DIRECTORY : process.env.PROD_UPLOAD_DIRECTORY) + req.user
        
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        } 
        cb(null, dest);
    },
    filename: function (req:any, file:any, cb:any) {
      cb(null, uuidv4() + getType(req.pending.type));
    },
  });

  function getType(type:string){
    console.log('file type is', type)
    switch(type){
      case '3D':
        return ".glb"

      case 'Audio':
        return ".mp3"
    }
  }

const upload = multer({ storage: storage });

export function uploadRouter(router:any){
  router.post("/uploader/sign", (req: any, res: any) => {
    console.log('validate scene jwt and return uploader jwt')
    handleAssetSigning(req, res)
  });
  
  router.post('/upload', authenticateToken, upload.single('file'), async (req:any, res:any) => {
      try {
        console.log('upload asset complete!, pinging toolset server with configuration')
        await postNewAssetData(req, res)
      } catch (error) {
        console.error('Error uploading file and saving form data:', error);
        res.status(200).json({valid:false, error: 'Internal Server Error' });
      }
  });
}

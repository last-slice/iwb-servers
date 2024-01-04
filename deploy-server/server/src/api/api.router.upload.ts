import express, { Request, Response } from "express";
import { authenticateToken, handleAssetSigning, postNewAssetData } from "./api.service";

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req:any, file:any, cb:any) {
        cb(null, '../../../iwb-assets');
    },
    filename: function (req:any, file:any, cb:any) {
      cb(null, uuidv4() + ".glb");
    },
  });

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

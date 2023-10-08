import express, { Request, Response } from "express";
import { buckets } from "../deploy/buckets";
import { authenticateToken, handleAssetSigning, handleIWBDeploy, handleSceneDeploy, handleSceneSigning, postNewAssetData, validateSceneToken } from "./api.service";

export const router = express.Router();
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

router.get("/scene/sign/:user", (req: any, res: any) => {
  console.log('get jwt token for asset upload session')
  handleSceneSigning(req, res)
});

router.post("/scene/verify", async (req: any, res: any) => {
  console.log('validate scene jwt and return iwb jwt')
  await validateSceneToken(req, res)
});

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

router.get("/buckets/:bucket", async function(req: express.Request, res: express.Response) {
    res.status(200).json({result: "success", bucket: buckets.get(req.params.bucket as string)})
})

router.get("/status/", async function(req: express.Request, res: express.Response) {
    res.status(200).json({result: "success", bucket: buckets.get(req.params.bucket as string)})
})

router.post("/deploy", async function(req: express.Request, res: express.Response) {
  handleSceneDeploy(req,res)
})

router.post("/iwb-deploy", async function(req: express.Request, res: express.Response) {
  handleIWBDeploy(req,res)
})
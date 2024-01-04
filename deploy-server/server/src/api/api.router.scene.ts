import express, { Request, Response } from "express";
import { handleSceneSigning, validateSceneToken } from "./api.service";
import { initDownload } from "../download/scripts";

export function sceneRouter(router:any){
  router.get("/scene/sign/:user", (req: any, res: any) => {
      console.log('get jwt token for asset upload session')
      handleSceneSigning(req, res)
    });
    
  router.post("/scene/verify", async (req: any, res: any) => {
    console.log('validate scene jwt and return iwb jwt')
    await validateSceneToken(req, res)
  });

  router.post("/scene/download", (req: any, res: any) => {
    console.log('trying to download scene', req.body)
    initDownload(req, res)
  });
}
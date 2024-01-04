import express, { Request, Response } from "express";
import { handleIWBDeploy, handleWorldDeploy } from "./api.service";

export function deployRouter(router:any){
    router.post("/world-deploy", async function(req: express.Request, res: express.Response) {
        handleWorldDeploy(req,res)
      })
      
      router.post("/iwb-deploy/:force", async function(req: express.Request, res: express.Response) {
        handleIWBDeploy(req,res, req.params.force === "true" ? true : false)
      })
      
}
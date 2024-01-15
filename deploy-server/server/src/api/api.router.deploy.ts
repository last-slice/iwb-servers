import express, { Request, Response } from "express";
import { forceCopyAssets, handleIWBDeploy, handleWorldDeploy } from "./api.service";
import { handleGenesisCityDeployment, pingCatalyst } from "../deploy/gc-deployment";

export function deployRouter(router:any){
    router.post("/gc-deploy", async function(req: express.Request, res: express.Response) {
      handleGenesisCityDeployment(req,res)
    })

    router.post("/gc-deploy/two", async function(req: express.Request, res: express.Response) {
      pingCatalyst(req,res)
    })

    router.post("/world-deploy", async function(req: express.Request, res: express.Response) {
        handleWorldDeploy(req,res)
      })
      
      router.post("/iwb-deploy/:force", async function(req: express.Request, res: express.Response) {
        handleIWBDeploy(req,res, req.params.force === "true" ? true : false)
      })

      router.post("/assets/force", async function(req: express.Request, res: express.Response) {
        forceCopyAssets(req,res)
      })
      
}
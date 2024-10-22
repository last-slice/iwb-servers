import express, { Request, Response } from "express";
import { forceCopyAssets, handleDCLWorldDeploy, handleIWBDeploy, handleWorldDeploy } from "./api.service";
import { pingCatalyst } from "../deploy/gc-deployment";
import { cancelPendingDeployment, handleDeploymentRequest, validateDeployment } from "../deploy/index"

export function deployRouter(router:any){
  router.post("/scene/deployment/cancel", async function(req: express.Request, res: express.Response) {
    cancelPendingDeployment(req, res)
  })

  router.post("/scene/deployment/verify", async function(req: express.Request, res: express.Response) {
    validateDeployment(req, res)
  })

  router.post("/scene/deployment/signature", async function(req: express.Request, res: express.Response) {
    console.log("ping catalyst body is", req.body)
    pingCatalyst(req,res)
  })

    router.post("/scene/deploy", async function(req: express.Request, res: express.Response) {
      handleDeploymentRequest(req, res)
    })

    router.post("/world-deploy", async function(req: express.Request, res: express.Response) {
        handleWorldDeploy(req,res)
      })

      router.post("/dcl-world-deploy", async function(req: express.Request, res: express.Response) {
        handleDCLWorldDeploy(req,res)
      })
      
      router.post("/iwb-deploy/:force", async function(req: express.Request, res: express.Response) {
        handleIWBDeploy(req,res, req.params.force === "true" ? true : false)
      })

      router.post("/assets/force", async function(req: express.Request, res: express.Response) {
        forceCopyAssets(req,res)
      })
}
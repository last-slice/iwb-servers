import express, { Request, Response } from "express";
import { returnBuckets, returnQueue, returnStatus } from "./api.service";
import { checkDeploymentQueue } from "../deploy/scene-deployment";

export function statusRouter(router:any){
    router.get("/status", async function(req: express.Request, res: express.Response) {
        returnStatus(res)
      })
      
      router.get("/buckets/", async function(req: express.Request, res: express.Response) {
        returnBuckets(res)
      })
      
      router.get("/queue", async function(req: express.Request, res: express.Response) {
        returnQueue(res)
      })
      
      router.get("/queue/knudge", async function(req: express.Request, res: express.Response) {
        checkDeploymentQueue()
        res.status(200).json({result: "success"})
      })
}
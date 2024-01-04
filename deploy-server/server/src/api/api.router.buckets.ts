import express, { Request, Response } from "express";
import { buckets } from "../deploy/buckets";
import { handleBucketEnable, handleBucketReset } from "./api.service";

export function bucketsRouter(router:any){
    router.get("/buckets/:bucket", async function(req: express.Request, res: express.Response) {
        res.status(200).json({result: "success", bucket: buckets.get(req.params.bucket as string)})
    })
    
    router.get("/buckets/reset/:bucket/:auth", async function(req: express.Request, res: express.Response) {
      handleBucketReset(req, res)
    })
    
    router.get("/buckets/:bucket/:enabled/:auth", async function(req: express.Request, res: express.Response) {
      handleBucketEnable(req, res)
    })
}
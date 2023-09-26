import express, { Request, Response } from "express";
import { addDeployment } from "../deploy/scene-deployment";
import { buckets } from "../deploy/buckets";
import { deployIWB } from "../deploy/iwb-deployment";
export const router = express.Router();

router.get("/buckets/:bucket", async function(req: express.Request, res: express.Response) {
    res.status(200).json({result: "success", bucket: buckets.get(req.params.bucket as string)})
})

router.post("/deploy", async function(req: express.Request, res: express.Response) {
    console.log("deploy api received")
    if(!req.body){
        res.status(200).json({result: "failure", msg:"invalid api call"})
        return
    }

    if(!req.body.auth){
        res.status(200).json({result: "failure", msg:"invalid auth"})
        return
    }

    //more error checking for scene data

    console.log("")
    console.log("/////////////////////////////////////////////////////////////////////")
    console.log("new deployment pending")
    console.log(JSON.stringify(req.body))
    console.log("/////////////////////////////////////////////////////////////////////")
    console.log("")
  
    addDeployment(req.body.scene)
    res.status(200).json({result: "success", msg:"deployment added to queue"})
})

router.post("/iwb-deploy", async function(req: express.Request, res: express.Response) {
    console.log("deploy iwb api received")
    if(!req.body){
        res.status(200).json({result: "failure", msg:"invalid api call"})
        return
    }

    if(!req.body.auth){
        res.status(200).json({result: "failure", msg:"invalid auth"})
        return
    }

    //more error checking for scene data

    deployIWB()

    console.log("need to deploy iwb to world")
    res.status(200).json({result: "success", msg:"deploying new iwb to world"})
})
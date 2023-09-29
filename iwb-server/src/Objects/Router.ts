import express, { Request, Response } from "express";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import path from "path";
import { handleGithook, initIWBDeploy } from "./Githooks";
import { itemManager } from "../app.config";
import { gitDeploymentBranch, gitIWBServerDeploymentBranch } from "../iwb-server";

export const router = express.Router();

router.get("/catalog/refresh", (req:any, res:any) => {
    console.log('refresh cached items on server')
    //to do
    //add admin verification
    
    itemManager.getServerItems()
    res.status(200).send({valid:true, msg:"refreshing server items"})
});

router.get("/hello_world", (req:any, res:any) => {
    console.log('hello world server')
    res.send("It's time to kick ass and chew bubblegum!");
});

//github webhooks
router.post("/githook/deploy/server", (req, res) => {
    console.log('githook api request to deploy iwb server')
    handleGithook(req)
    res.send("It's time to kick ass and chew bubblegum!");
});

router.post("/githook", (req, res) => {
    console.log('githook api request')
    handleGithook(req)
    res.send("It's time to kick ass and chew bubblegum!");
});

router.use('/colyseus', monitor())

if (process.env.NODE_ENV !== "production") {
    router.use("/playground", playground);
}

router.get('/:user/:key', (req, res) => {
    console.log('load asset creator page')
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});
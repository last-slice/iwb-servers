import express, { Request, Response } from "express";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import path from "path";
import { handleGithook, initIWBDeploy } from "./Githooks";

export const router = express.Router();

router.get("/hello_world", (req:any, res:any) => {
    console.log('hello world server')
    res.send("It's time to kick ass and chew bubblegum!");
});

router.use('/colyseus', monitor())

router.get('/:user/:key', (req, res) => {
    console.log('load asset creator page')
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});


  router.get("/hello_world", (req, res) => {
    console.log('hello world server')
    res.send("It's time to kick ass and chew bubblegum!");
});

router.post("/githook", (req, res) => {
    console.log('githook api request')
    handleGithook(req)
    res.send("It's time to kick ass and chew bubblegum!");
});

if (process.env.NODE_ENV !== "production") {
    router.use("/playground", playground);
}

router.use("/colyseus", monitor());

///test api to be remove
router.get("/test-deploy", (req, res) => {
    console.log('test deploy api request')
    initIWBDeploy()
    res.send("It's time to kick ass and chew bubblegum!");
});
import express, {Request} from "express";
import {monitor} from "@colyseus/monitor";
import {playground} from "@colyseus/playground";
import path from "path";
import {handleGithook} from "./Githooks";
import {itemManager} from "../app.config";
import * as jwt from "jsonwebtoken";
import * as dcl from "decentraland-crypto-middleware";
import { sign } from "crypto";
import { handleAssetUploaderSigning, handleNewAssetData } from "./Service";

export const router = express.Router();

router.post(
    '/login',
    dcl.express({}),
    (req: Request & dcl.DecentralandSignatureData, res: any) => {
        const address: string = req.auth
        const metadata: Record<string, any> = req.authMetadata

        console.log('user info', address, metadata)

        //Create and sign jwt
        let token;
        try {
            token = jwt.sign(
                {
                    userId: address,
                    realm: metadata.realm.serverName,
                    origin: metadata.origin
                },
                process.env.SERVER_SECRET,
                {expiresIn: "6h"}
            );
        } catch (err) {
            console.log(err);
            const error = new Error("Error! Something went wrong.");
            return res.status(500).json({message: error.message});
        }

        res
            .status(200)
            .json({
                success: true,
                data: {
                    userId: address,
                    token: token,
                },
            });
    }
)

router.post("/uploader/sign", (req: any, res: any) => {
    console.log('get jwt token for asset upload session')
    handleAssetUploaderSigning(req, res)
});

router.post("/asset/uploaded", async (req: any, res: any) => {
    console.log('receive new asset data')
    handleNewAssetData(req, res)
});

router.get("/catalog/refresh", (req: any, res: any) => {
    console.log('refresh cached items on server')
    //to do
    //add admin verification

    itemManager.getServerItems()
    res.status(200).send({valid: true, msg: "refreshing server items"})
});

router.get("/hello_world", (req: any, res: any) => {
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




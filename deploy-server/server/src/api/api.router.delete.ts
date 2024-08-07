import express, { Request, Response } from "express";
import * as fs from 'fs';
import { status } from "../config/config";

export function deleteRouter(router:any){
    router.get("/ugc/delete/:user/:id/:type/:auth", async function(req: express.Request, res: express.Response) {
        console.log("attempting to remove ugc asset", req.params)
        try{
            if(!req.params.user || !req.params.id || !req.params.type || !req.params.auth){
                throw new Error("invalid parameters")
            }

            if(req.params.auth !== process.env.IWB_DEPLOYMENT_AUTH){
                throw new Error("invalid auth")
            }

            let path = "" + req.params.user + "/" + req.params.id
            switch(req.params.type){
                case '3D':
                    path += ".glb"
                    break;
    
                case 'Audio':
                    path += ".mp3"
                    break;
            }

            console.log('path to delete is', path)

            fs.unlinkSync("" + (status.DEBUG ? process.env.DEV_DOWNLOAD_UGC_DIRECTORY : process.env.PROD_DOWNLOAD_UGC_DIRECTORY) + path);
            res.status(200).json({valid:true})
        }
        catch(e:any){
            console.log("error deleting ugc assets", e.message)
            res.status(200).json({valid:false})
        }
    })
}
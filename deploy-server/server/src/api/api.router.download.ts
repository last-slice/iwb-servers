import express, { Request, Response } from "express";
import * as fs from 'fs';
import { deleteUserDownload, findUserDownload, getDownloadQueue, handleSceneDownload } from "../download";
import { temporaryDirectory } from "../download/scripts";
import path from "path";

export function downloadRouter(router:any){
    router.get("/download/delete/:user/:id", async function(req: express.Request, res: express.Response) {
        try{
            await deleteUserDownload(req.params.user, req.params.id)
            res.status(200).json({result: "success"})
        }
        catch(e){
            console.log("error deleting download")
            res.status(200).json({result: "failure"})
        }
    })

    router.get("/download/queue", async function(req: express.Request, res: express.Response) {
        try{
            res.status(200).json({result: "success", queue: getDownloadQueue()})
        }
        catch(e){
            console.log("error getting download queue")
            res.status(200).json({result: "failure"})
        }
    })

    router.get("/download/:user/:id", async function(req: express.Request, res: express.Response) {
        try{
            if(!req.params.user || !req.params.id){
                throw new Error("invalid parameters")
            }

            let download = findUserDownload(req.params.user, req.params.id)
            console.log('downalod from queue is', download)
            console.log('req params area', req.params)
            if(download && download.id === req.params.user + "-" + req.params.id){
                let filepath = temporaryDirectory + download.id + ".zip"
                let filename = "scene.zip"
                
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.setHeader('Content-Type', 'text/plain');
    
                const fileStream = fs.createReadStream(filepath);
                fileStream.pipe(res);
            }else{
                throw new Error("invalid file")
            }
        }
        catch(e:any){
            console.log('error trying to download file', e.message)
            res.status(200).json({result: "failure"})
        }
    })

  router.post("/scene/download", (req: any, res: any) => {
    // console.log('trying to download scene', req.body)
    res.status(200).send({valid: true})
    handleSceneDownload(req, res)
  });

  router.get("/warehouse/asset/:userId/:assetId/", async (req: any, res: any) => {
    console.log('trying to download warehouse asset', req.params.assetId)
    if(!req.params.assetId || !req.params.userId){
        res.status(400).send({valid:false})
        return
    }

    try{
        const directory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_ASSET_DIRECTORY : process.env.PROD_DOWNLOAD_ASSET_DIRECTORY
        console.log('directory is', directory)
        const imagePath = path.join(directory, req.params.assetId)
        console.log('asset path is', imagePath)

        if(req.params.userId !== "view"){
            res.setHeader("Content-Disposition", `attachment; filename="${req.params.userId}"`);
            //  pushPlayfabEvent(
            // SERVER_MESSAGE_TYPES.DOWNLOAD_IWB_ASSET, 
            // PLAYFAB_DATA_ACCOUNT, 
            // [{assetId:req.params.assetId}]
            // )
        }
        res.sendFile(imagePath);
    }
    catch(e){
        console.log("error getting warehouse asset for download", e)
        res.status(400).send({valid: false})
    }
});
}
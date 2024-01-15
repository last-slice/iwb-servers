import express, { Request, Response } from "express";
import * as fs from 'fs';
import { deleteUserDownload, findUserDownload, getDownloadQueue } from "../download";
import { initDownload, temporaryDirectory } from "../download/scripts";

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

    router.get("/download/:user/:sceneid/:id", async function(req: express.Request, res: express.Response) {
        try{
            if(!req.params.user || !req.params.id || !req.params.sceneid){
                throw new Error("invalid parameters")
            }

            let download = findUserDownload(req.params.user, req.params.sceneid)
            console.log('downalod from queue is', download)
            console.log('req params area', req.params)
            if(download && download.user === req.params.user && download.id === req.params.id && download.sceneId === req.params.sceneid){
                let filepath = temporaryDirectory + download.user +  "-" + download.sceneId + ".zip"
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
    console.log('trying to download scene', req.body)
    initDownload(req, res)
  });
}
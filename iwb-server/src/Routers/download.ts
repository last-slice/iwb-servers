import path from "path";
import { iwbManager } from "../app.config";
import { DEBUG } from "../utils/config";
import { SERVER_MESSAGE_TYPES } from "../utils/types";
import { PLAYFAB_DATA_ACCOUNT, pushPlayfabEvent } from "../utils/Playfab";

export function downloadRouter(router:any){
    router.post("/download/ready", async (req: any, res: any) => {
        console.log('scene download ready', req.body)
        try{
            iwbManager.sendUserMessage(req.body.user, SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD, {link: (DEBUG ? "http://localhost:3525/" : "https://deployment.dcl-iwb.co/") + "download/" + req.body.user + "/" + req.body.sceneId + "/" + req.body.id})
            res.status(200).send({valid: true})
        }
        catch(e){
            console.log("error sending download ready message", e)
            res.status(200).send({valid: false})
        }
    });

    router.get("/warehouse/asset/:user/:assetId", async (req: any, res: any) => {
        console.log('trying to download warehouse asset', req.params.assetId)
        if(!req.params.assetId || !req.params.userId){
            res.status(400).send({valid:false})
            return
        }

        try{
            const directory = process.env.NODE_ENV === "Development" ? process.env.DEV_DOWNLOAD_IWB_DIRECTORY : process.env.PROD_DOWNLOAD_IWB_DIRECTORY
            const imagePath = path.join(directory, req.params.assetId)
            res.sendFile(imagePath);
            pushPlayfabEvent(
                SERVER_MESSAGE_TYPES.DOWNLOAD_IWB_ASSET, 
                PLAYFAB_DATA_ACCOUNT, 
                [{user: req.params.userId, assetId:req.params.assetId}]
            )
        }
        catch(e){
            console.log("error getting warehouse asset for download", e)
            res.status(400).send({valid: false})
        }
    });

}
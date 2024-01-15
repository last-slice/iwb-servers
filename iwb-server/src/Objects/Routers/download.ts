import { iwbManager } from "../../app.config";
import { DEBUG } from "../../utils/config";
import { SERVER_MESSAGE_TYPES } from "../../utils/types";


export function downloadRouter(router:any){
    router.post("/download/ready", async (req: any, res: any) => {
        console.log('scene download ready', req.body)
        try{
            iwbManager.sendUserMessage(req.body.user, SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD, {link: (DEBUG ? "http://localhost:3525/" : "https://dcl-iwb.co/dcl/deployment/") + "download/" + req.body.user + "/" + req.body.sceneId + "/" + req.body.id})
            res.status(200).send({valid: true})
        }
        catch(e){
            console.log("error sending download ready message", e)
            res.status(200).send({valid: false})
        }
    });
}
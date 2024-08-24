
import { questManager } from "../app.config";

export function questsRouter(router:any){  
    router.get('/api/quests/all/:auth', (req:any, res:any) => {
        console.log('attempting to get all quests')
        if(!req.params.auth || req.params.auth !== process.env.IWB_DEPLOYMENT_AUTH){
            console.log('unauthorized access, spammer?')
            return
        }
        res.status(200).send({valid:true, quests:questManager.quests});
    });
}
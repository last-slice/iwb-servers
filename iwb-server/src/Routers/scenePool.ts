import { SCENE_POOL_CACHE_KEY } from "../Objects/IWBManager";
import { getCache } from "../utils/cache";
import { handleAngzaarScenePoolDeploy } from "../Objects/Service";

export function scenePoolRouter(router:any){
    router.post("/scene-pools", (req:any, res:any) => {
        console.log('scene pools api', req.body, req.header('IWB-Auth'))
        if(!req.body || !req.header('IWB-Auth') || req.header('IWB-Auth') !== process.env.IWB_UPLOAD_AUTH_KEY){
            console.log('invalid parameters')
            return res.status(200).send({valid:false, message:"Invalid parameters"})
        }

        let scenePool = getCache(SCENE_POOL_CACHE_KEY)
        switch(req.body.action){
            case 'get':
                switch(req.body.type){
                    case 'all':
                        console.log('getting all scenes in scene pool')
                        return res.status(200).send({valid:true, scenes:scenePool})

                    case 'size':
                        if(!req.body.size){
                            return res.status(200).send({valid:false, message:"Scene size not provided"})
                        }
                        console.log('getting scene size in scene pool', req.body.size)
                        return res.status(200).send({valid:true, scenes:scenePool.filter((scenes:any)=> scenes.pcls.length === req.body.size)})

                    default:
                        return res.status(200).send({valid:false, message:"No scene pool action type provided"})
                }

            case 'angzaar-deploy':
                console.log('attempting to deploy scene pool to angzaar location')
                handleAngzaarScenePoolDeploy(req, res)
                break;

            default:
                return res.status(200).send({valid:false, message:'No scene pool action provided.'})
        }
    });
}
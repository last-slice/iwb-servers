import { itemManager, iwbManager } from "../../app.config";
import { updateCatalogAssets, updateIWBVersion } from "../Service";


export function iwbRouter(router:any){
    router.post("/lobby/create", async (req: any, res: any) => {
        console.log('creating lobby for world', req.body.world)
        try{
            iwbManager.createRealmLobby(req.body.world, false)
            return res.status(200).json({valid:true});
        }
        catch(e){
            return res.status(200).json({valid:false});
        }
    });

    router.post("/update/catalog", async (req: any, res: any) => {
        console.log('receive ping to update iwb catalog')
        updateCatalogAssets(req, res)
    });
    
    router.get("/update/version", async (req: any, res: any) => {
        console.log('receive ping to update iwb version')
        updateIWBVersion(req, res)
    });
    
    router.post("/update/version/manual", async (req: any, res: any) => {
        console.log('receive ping to update iwb version')
        updateIWBVersion(req, res, true)
    });


    router.get("/catalog/refresh", (req: any, res: any) => {
        console.log('refresh cached items on server')
        //to do
        //add admin verification

        itemManager.getServerItems()
        res.status(200).send({valid: true, msg: "refreshing server items"})
    });
}
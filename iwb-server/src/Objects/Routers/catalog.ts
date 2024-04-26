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

    router.post("/catalog/backup", async (req: any, res: any) => {
        console.log('receive ping to update backup catalog')
        try{
            await itemManager.backupCatalog()
            return res.status(200).json({valid:true});
        }
        catch(e){
            return res.status(200).json({valid:false});
        }
    });

    router.get("/catalog/refresh", (req: any, res: any) => {
        console.log('refresh cached items on server')
        //to do
        //add admin verification

        itemManager.getServerItems()
        res.status(200).send({valid: true, msg: "refreshing server items"})
    });

    router.get("/refresh/config", (req: any, res: any) => {
        console.log('refresh cached config on server')
        iwbManager.getServerConfigurations()
        res.status(200).send({valid: true, msg: "refreshing server config"})
    });

    router.get("/refresh/config/:keys", (req: any, res: any) => {
        console.log('refresh cached worlds config on server')
        iwbManager.getServerConfigurations(undefined,  req.params.keys ? req.params.keys.contains("|") ? req.params.keys.split("|") : [req.params.keys] : [])
        res.status(200).send({valid: true, msg: "refreshing worlds config"})
    });

    router.get("/update/assets/:world", async (req: any, res: any) => {
        console.log('receive ping to update world assets')
        let user = 
        iwbManager.updateRealmPendingAssets(iwbManager.findWorldOwner(req.params.world), req.params.world)
        res.status(200).send({valid: true, msg: "refreshing world assets"})
    });
    
}
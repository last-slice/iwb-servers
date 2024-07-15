import * as jwt from "jsonwebtoken";
import { itemManager, iwbManager } from "../app.config";
import { DEBUG } from "../utils/config";
import { Player } from "./Player";
import { IWBRoom } from "../rooms/IWBRoom";
import { SERVER_MESSAGE_TYPES } from "../utils/types";

export function handleAssetUploaderSigning(req:any, res:any){
    if(req.body.user && req.header('Authorization') && req.header('AssetAuth')){
        const assetAuth = req.header('AssetAuth').replace('Bearer ', '').trim();
        const sceneToken = req.header('Authorization').replace('Bearer ', '').trim();

        if (!sceneToken || !assetAuth){
            console.log('scene or asset token invalid')
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }

        if (assetAuth !== process.env.IWB_UPLOAD_AUTH_KEY) {
            console.log('asset auth invalid')
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }

        let token;
            token = jwt.sign(
                {
                    user: req.body.user,
                    auth: assetAuth,
                    key: sceneToken
                },
                process.env.SERVER_SECRET,
                {expiresIn: "6h"}
            )

            console.log('asset upload token is', token)
        res.status(200).send({valid: true, token: token})
    }else{
        res.status(200).send({valid: false, token: false})
    }
}

export function handleNewAssetData(req:any, res:any){
    if(DEBUG){
        res.status(200).send({valid: true})
        itemManager.saveNewAsset(req.body.user, req.body)
    }
    else{
        if(req.body.user && req.header('Authorization') && req.header('AssetAuth')){
            const assetAuth = req.header('AssetAuth').replace('Bearer ', '').trim();
            const sceneToken = req.header('Authorization').replace('Bearer ', '').trim();
    
            if (!sceneToken || !assetAuth) {
                console.log('no scene or asset token')
                return res.status(200).json({valid:false, message: 'Unauthorized' });
            }
    
            if (assetAuth !== process.env.IWB_UPLOAD_AUTH_KEY) {
                console.log('invalid asset auth key')
                return res.status(200).json({valid:false, message: 'Unauthorized' });
            }
        
            jwt.verify(sceneToken, process.env.SERVER_SECRET, (err:any, user:any) => {
                if (err) {
                    console.log('error validating scene upload token for user', req.body.user)
                    return res.status(200).json({valid:false, message: 'Invalid token' });
                }
                console.log('new asset signature verified, need to store data in playfab')
    
                res.status(200).send({valid: true})
                itemManager.saveNewAsset(req.body.user, req.body)
            });
        }else{
            console.log('invalue body and user')
            res.status(200).send({valid: false, token: false})
        }
    }
}

export function authenticateToken(req:any, res:any, next:any) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, process.env.SERVER_SECRET, (err:any, user:any) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        console.log('user is', user)
        req.user = user;
        next();
    });
}

export function updateIWBVersion(req:any, res:any, manual?:boolean){
    if(req.header('AssetAuth')){
        const assetAuth = req.header('AssetAuth').replace('Bearer ', '').trim();

        if (!assetAuth) {
            console.log('no scene or asset token')
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }

        if (assetAuth !== process.env.IWB_UPLOAD_AUTH_KEY) {
            console.log('invalid asset auth key')
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }
        iwbManager.incrementVersion(manual ? req.body.updates : undefined)

        if(manual){} else{
            itemManager.notifyUsersDeploymentReady()
        }

        iwbManager.rooms.forEach((room:IWBRoom)=>{
            room.broadcast(SERVER_MESSAGE_TYPES.IWB_VERSION_UPDATE, {updates:req.body.updates, version: iwbManager.version})
        })

        res.status(200).send({valid: true})
    }else{
        res.status(200).send({valid: false, token: false})
    }
}

export async function updateCatalogAssets(req:any, res:any){
    if(req.body.assets && req.header('Authorization')){
        const authtoken = req.header('Authorization').replace('Bearer ', '').trim();

        if (!authtoken) {
            console.log('no scene or asset token')
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }

        if (authtoken !== process.env.IWB_UPLOAD_AUTH_KEY) {
            console.log('invalid asset auth key')
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }

        res.status(200).send({valid: true})
        await itemManager.saveNewCatalogAssets(req.body.assets)

    }else{
        res.status(200).send({valid: false, token: false})
    }
}

export function handleWorldDeployment(req:any, res:any){
    if (req.body.auth !== process.env.IWB_UPLOAD_AUTH_KEY) {
        console.log('invalid asset auth key')
        return res.status(200).json({valid:false, message: 'Unauthorized' });
    }else{
        res.status(200).send({valid: true})
        iwbManager.saveNewWorld(req.body.world)
    }
}

export function handlBulkWorldsDeployments(req:any, res:any){
    if (req.params.auth !== process.env.IWB_UPLOAD_AUTH_KEY) {
        console.log('invalid asset auth key')
        return res.status(200).json({valid:false, message: 'Unauthorized' });
    }else{
        res.status(200).send({valid: true})
        iwbManager.updateAllWorlds()
    }
}

export function handleSceneDeploymentReady(req:any, res:any){
    if(DEBUG){
        res.status(200).send({valid: true})
        iwbManager.sceneReady(req.body)
    }else{
        if (!req.header("Authorization") || req.header("Authorization") !== process.env.IWB_DEPLOYMENT_AUTH || !req.body) {
            console.log('invalid auth key')
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }else{
            res.status(200).send({valid: true})
            iwbManager.sceneReady(req.body)
        }
    }
}

export function handleDeploymentFinished(req:any, res:any){
    res.status(200).send({valid: true})
    
    let player:Player = iwbManager.findUser(req.body.user)
    if(player){
        if(req.body.valid){
            player.sendPlayerMessage(req.body.type, {world:req.body.world, name:req.body.name, valid:req.body.valid, dest:req.body.dest})
        }else{
            player.sendPlayerMessage(req.body.type, {valid:req.body.valid})
        }
    }
}
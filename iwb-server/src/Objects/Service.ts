import * as jwt from "jsonwebtoken";
import { itemManager, iwbManager } from "../app.config";

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
        res.status(200).send({valid: false, token: false})
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
        req.user = user; // Store the user information in the request object
        next(); // Continue to the next middleware or route
    });
}

export function updateIWBVersion(req:any, res:any){
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
        iwbManager.incrementVersion()

        //need to iterate over all new items and find their owners and if they're in world, notify them to refresh browser
        itemManager.notifyUsersDeploymentReady()

        res.status(200).send({valid: true})
    }else{
        res.status(200).send({valid: false, token: false})
    }
}
import Axios from "axios";
import { deployIWB } from "../deploy/iwb-deployment";
import { addDeployment } from "../deploy/scene-deployment";
const jwt = require("jsonwebtoken");

export function handleSceneDeploy(req:any, res:any){
    console.log("deploy api received")
    if(!req.body){
        res.status(200).json({result: "failure", msg:"invalid api call"})
        return
    }

    if(!req.body.auth){
        res.status(200).json({result: "failure", msg:"invalid auth"})
        return
    }

    //more error checking for scene data

    console.log("")
    console.log("/////////////////////////////////////////////////////////////////////")
    console.log("new deployment pending")
    console.log(JSON.stringify(req.body))
    console.log("/////////////////////////////////////////////////////////////////////")
    console.log("")
  
    addDeployment(req.body.scene)
    res.status(200).json({result: "success", msg:"deployment added to queue"})
}

export function handleIWBDeploy(req:any, res:any){
    console.log("deploy iwb api received")
    if(!req.body){
        res.status(200).json({result: "failure", msg:"invalid api call"})
        return
    }

    if(!req.body.auth){
        res.status(200).json({result: "failure", msg:"invalid auth"})
        return
    }

    //more error checking for scene data

    deployIWB()

    console.log("need to deploy iwb to world")
    res.status(200).json({result: "success", msg:"deploying new iwb to world"})
}

export function handleAssetSigning(req:any, res:any){
    if(req.body.user && req.header('Authorization')){
        const sceneToken = req.header('Authorization').replace('Bearer ', '').trim();

        if (!sceneToken) {
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }
    
        jwt.verify(sceneToken, process.env.SERVER_SECRET, (err:any, user:any) => {
            if (err) {
                console.log('error validating scene upload token for user', req.body.user)
                return res.status(200).json({valid:false, message: 'Invalid token' });
            }

            let token;
            token = jwt.sign(
                {
                    userId: user,
                    key: sceneToken
                },
                process.env.SERVER_SECRET,
                {expiresIn: "6h"}
            )
            res.status(200).send({valid: true, token: token})

        });
    }else{
        res.status(200).send({valid: false, token: false})
    }
}

export function handleSceneSigning(req:any, res:any){
    if(req.params.user){
        let token;
            token = jwt.sign(
                {
                    userId: req.params.user
                },
                process.env.SERVER_SECRET,
                {expiresIn: "6h"}
            )
        res.status(200).send({valid: true, token: token})
    }else{
        res.status(200).send({valid: true, token: false})
    }
}

export function authenticateToken(req:any, res:any, next:any) {
    if(req.header('SceneAuth')){
        const token = req.header('SceneAuth').replace('Bearer ', '').trim();
        const uploadAuth = req.header('UploadAuth').replace('Bearer ', '').trim();

        if (!token) {
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }

        jwt.verify(token, process.env.SERVER_SECRET, (err:any, info:any) => {
            if (err) {
                return res.status(200).json({valid:false, message: 'Invalid token' });
            }
            console.log('asset upload token verified')
            req.user = info.userId;
            req.key = uploadAuth
            next();
        });
    }else{
        return res.status(200).json({valid:false, message: 'Invalid Authorization' });
    }
}

export function validateSceneToken(req:any, res:any){
    if(req.body.user && req.header('Authorization')){
        const sceneToken = req.header('Authorization').replace('Bearer ', '').trim();
        if (!sceneToken) {
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }
    
        jwt.verify(sceneToken, process.env.SERVER_SECRET, async(err:any, user:any) => {
            if (err) {
                console.log('error validating scene upload token for user', req.body.user)
                return res.status(200).json({valid:false, message: 'Invalid token' });
            }

            try{
                const result = await Axios.post(process.env.IWB_UPLOAD_AUTH_PATH, { user:req.body.user},
                {headers: {                      
                    'Authorization': `Bearer ${sceneToken}`,
                    'AssetAuth': `Bearer ${process.env.IWB_UPLOAD_AUTH_KEY}`,
                }},
                );
                console.log('result is', result.data)
                if(result.data.valid){
                    res.status(200).send({valid: true, token: result.data.token})
                }else{
                    res.status(200).send({valid: false})
                }
            }
            catch(e:any){
                console.log('error posting to iwb server', e.message)
            }

        });
    }else{
        console.log("Invalid Authorization for asset uploader")
        res.status(200).send({valid: false, token: false})
    }
}

export async function postNewAssetData(req:any, res:any){
    const {name, polycount, image} = req.body

    let assetData:any = {
        name:name,
        polycount:polycount,
        image:image,
        file: req.file.filename.split('.')[0],
        user: req.user
    }

    console.log('need to send asset data to iwb server ', assetData)

    const result = await Axios.post('http://localhost:2751/asset/uploaded', assetData,
        {headers: {                      
            'Authorization': `Bearer ${req.key}`,
            'AssetAuth': `Bearer ${process.env.IWB_UPLOAD_AUTH_KEY}`,
        }},
        );
        console.log('result is', result.data)
        if(result.data.valid){
            res.status(200).send({valid: true, token: result.data.token})
        }else{
            res.status(200).send({valid: false})
        }
}
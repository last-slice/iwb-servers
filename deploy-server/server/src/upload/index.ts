import Axios from "axios";

export async function postPendingAsset(req:any, res:any, next:any) {
    console.log('pending asset body is', req.pendingData)
    const {name, type} = req.pendingData

    let assetData:any = {
        n:name,
        ty:type,
        user: req.user
    }

    console.log('pending asset data to send to wib server', assetData)

    const result = await Axios.post('http://localhost:2751/asset/pending', assetData,
    {headers: {                      
        'Authorization': `Bearer ${req.key}`,
        'AssetAuth': `Bearer ${process.env.IWB_UPLOAD_AUTH_KEY}`,
    }},
    );
    if(result.data.valid){
        console.log('pending asset successfully pinged on iwb server')
        next();
    }else{
        console.log('new asset not pinged on iwb server')
        res.status(200).send({valid: false})
    }
}
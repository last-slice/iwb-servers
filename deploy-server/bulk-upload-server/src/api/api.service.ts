
import { handleBuilderAssets, handleBulkUpload, modifyBuilderAssets } from "../upload/bulk-upload";

export async function bulkUpload(req:any, res:any, builder?:boolean, skip?:boolean){
    if(req.body.data && req.header('Authorization')){
        const uploadToken = req.header('Authorization').replace('Bearer ', '').trim();
        if (!uploadToken || uploadToken !== process.env.UPLOAD_AUTH) {
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }
        if(builder){
            await modifyBuilderAssets()
        }else{
            await handleBulkUpload(req.body, skip)
        }

        res.status(200).send({valid: true})
        
    }else{
        console.log("Invalid Authorization for asset uploader")
        res.status(200).send({valid: false})
    }
}

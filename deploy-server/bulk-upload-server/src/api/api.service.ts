
import { handleBulkUpload } from "../upload/bulk-upload";

export async function bulkUpload(req:any, res:any){
    if(req.body.data && req.header('Authorization')){
        const uploadToken = req.header('Authorization').replace('Bearer ', '').trim();
        if (!uploadToken || uploadToken !== process.env.UPLOAD_AUTH) {
            return res.status(200).json({valid:false, message: 'Unauthorized' });
        }
        res.status(200).send({valid: true})

        await handleBulkUpload(req.body.data, res)
    }else{
        console.log("Invalid Authorization for asset uploader")
        res.status(200).send({valid: false})
    }
}

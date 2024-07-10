import { handleAssetUploaderSigning, handleNewAssetData } from "../Objects/Service";

export function uploadRouter(router:any){
    router.post("/uploader/sign", (req: any, res: any) => {
        console.log('get jwt token for asset upload session')
        handleAssetUploaderSigning(req, res)
    });
    
    router.post("/asset/uploaded", async (req: any, res: any) => {
        console.log('receive new asset data')
        handleNewAssetData(req, res)
    });
}
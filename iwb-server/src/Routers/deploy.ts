import { handlBulkWorldsDeployments, handleWorldDeployment, handleSceneDeploymentReady, handleDeploymentFinished, handleAdminDeployRequest } from "../Objects/Service";

export function deployRouter(router:any){
    router.post("/deployment/worlds/bulk/:auth", async (req: any, res: any) => {
        console.log('received bulk deployment request', req.body)
        handlBulkWorldsDeployments(req, res)
    });

    router.post("/deployment/worlds/admin/:user/:world/:auth", async (req: any, res: any) => {
        console.log('received admin deployment request', req.body)
        handleAdminDeployRequest(req, res)
    });

    router.post("/deployment/success", async (req: any, res: any) => {
        console.log('received world deployment success', req.body)
        handleWorldDeployment(req, res)
    });

    router.post("/scene/deployment/ready", async (req: any, res: any) => {
        console.log('received deployment ready from server', req.body)
        handleSceneDeploymentReady(req, res)
    });

    router.post("/scene/deployment/finished", async (req: any, res: any) => {
        console.log('received deployment finished from server', req.body)
        handleDeploymentFinished(req, res)
    });
}
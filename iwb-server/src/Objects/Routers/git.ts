import { handleGithook } from "../Githooks";

export function gitRouter(router:any){
    //github webhooks
    router.post("/githook/deploy/server", (req:any, res:any) => {
        console.log('githook api request to deploy iwb server')
        handleGithook(req)
        res.send("It's time to kick ass and chew bubblegum!");
    });

    router.post("/githook", (req:any, res:any) => {
        console.log('githook api request')
        handleGithook(req)
        res.send("It's time to kick ass and chew bubblegum!");
    });
}
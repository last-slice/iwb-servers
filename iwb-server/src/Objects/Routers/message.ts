import { iwbManager } from "../../app.config";

export function messageRouter(router:any){
    router.post("/all/message", async (req: any, res: any) => {
        console.log('send message to all users')
        iwbManager.sendAllMessage(req.body)
        res.send("It's time to kick ass and chew bubblegum!");
    });

    router.post("/user/message", async (req: any, res: any) => {
        console.log('send message to user')
        iwbManager.attemptUserMessage(req, res)
    });
}
import { iwbManager } from "../../app.config";

export function messageRouter(router:any){
    router.post("/all/message/:auth", async (req: any, res: any) => {
        console.log('send message to all users')
        iwbManager.sendAllMessage(req.body)
        res.send("It's time to kick ass and chew bubblegum!");
    });

    router.post("/user/message/:auth", async (req: any, res: any) => {
        console.log('send message to user')
        iwbManager.attemptUserMessage(req, res)
    });

    router.get("/feedback/get/:auth", async (req: any, res: any) => {
        console.log('getting user feedback')
        res.status(200).send({valid: true, feedback:iwbManager.feedback})
    });

    router.get("/feedback/clear/:auth", async (req: any, res: any) => {
        console.log('clearing user feedback')
        iwbManager.clearFeedback(req, res)
    });

    router.get("/tutorials/get/:auth", async (req: any, res: any) => {
        console.log('getting tutorials')
        res.status(200).send({valid: true, tutorials:iwbManager.tutorials})
    });

    router.post("/tutorials/add/:auth", async (req: any, res: any) => {
        console.log('adding tutorial')
        iwbManager.addTutorial(req, res)
    });

    router.get("/tutorials/clear/:auth/:index", async (req: any, res: any) => {
        console.log('delete tutorial', req.params.index)
        iwbManager.clearTutorial(req, res)
    });
}
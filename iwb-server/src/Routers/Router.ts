import express, {Request} from "express";
import { catalogRouter } from "./catalog";
import { colyseusRouter } from "./colyseus";
import { deployRouter } from "./deploy";
import { downloadRouter } from "./download";
import { gitRouter } from "./git";
import { loginRouter } from "./login";
import { messageRouter } from "./message";
import { pagesRouter } from "./pages";
import { uploadRouter } from "./upload";
import { questsRouter } from "./quests";

export const router = express.Router();

router.get("/hello_world", (req: any, res: any) => {
    console.log('hello world server')
    res.send("It's time to kick ass and chew bubblegum!");
});

loginRouter(router)
catalogRouter(router)
deployRouter(router)
downloadRouter(router)
uploadRouter(router)
messageRouter(router)
colyseusRouter(router)
pagesRouter(router)
gitRouter(router)
questsRouter(router)
// customRouters(router)




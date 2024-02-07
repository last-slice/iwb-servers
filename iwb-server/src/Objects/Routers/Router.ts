import express, {Request} from "express";
import { uploadRouter } from "./upload";
import { iwbRouter } from "./catalog";
import { colyseusRouter } from "./colyseus";
import { deployRouter } from "./deploy";
import { messageRouter } from "./message";
import { gitRouter } from "./git";
import { loginRouter } from "./login";
import { pagesRouter } from "./pages";
import { downloadRouter } from "./download";
import { customRouters } from "./custom";

export const router = express.Router();

router.get("/hello_world", (req: any, res: any) => {
    console.log('hello world server')
    res.send("It's time to kick ass and chew bubblegum!");
});

loginRouter(router)
iwbRouter(router)
deployRouter(router)
downloadRouter(router)
uploadRouter(router)
messageRouter(router)
colyseusRouter(router)
pagesRouter(router)
gitRouter(router)
customRouters(router)





import express, { Request, Response } from "express";
import { bucketsRouter } from "./api.router.buckets";
import { statusRouter } from "./api.router.status";
import { sceneRouter } from "./api.router.scene";
import { uploadRouter } from "./api.router.upload";
import { deployRouter } from "./api.router.deploy";
import { downloadRouter } from "./api.router.download";
import { pagesRouter } from "./api.router.pages";
import { deleteRouter } from "./api.router.delete";

export const router = express.Router();

bucketsRouter(router)
statusRouter(router)
sceneRouter(router)
uploadRouter(router)
deployRouter(router)
downloadRouter(router)
pagesRouter(router)
deleteRouter(router)

router.get("/hello-world", async function(req: express.Request, res: express.Response) {
  console.log('hello world')
  res.status(200).json({result: "hello world"})
})
import express, { Request, Response } from "express";
import { bulkUpload } from "./api.service";

export const router = express.Router();

router.post("/bulk-upload", async function(req: express.Request, res: express.Response) {
  bulkUpload(req,res)
})

router.get("/hello-world", async function(req: express.Request, res: express.Response) {
  res.status(200).json({result: "success"})
})
import express, { Request, Response } from "express";
import { bulkUpload } from "./api.service";
import { pullGithub } from "../upload/bulk-upload";

export const router = express.Router();

router.post("/bulk-upload/", async function(req: express.Request, res: express.Response) {
  bulkUpload(req,res)
})

router.post("/bulk-upload/skip", async function(req: express.Request, res: express.Response) {
  bulkUpload(req,res, undefined, true)
})

router.post("/bulk-upload-builder/git", async function(req: express.Request, res: express.Response) {
  pullGithub()
  res.status(200).send({valid: true})
})

router.post("/bulk-upload-builder", async function(req: express.Request, res: express.Response) {
  bulkUpload(req,res, true)
})

router.get("/hello-world", async function(req: express.Request, res: express.Response) {
  res.status(200).json({result: "success"})
})
import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import requestIp from "request-ip";
import * as dotenv from "dotenv";
import 'dotenv/config'
import { router } from "./api/api.router";

dotenv.config({ path: '../.env', });

const devServerPort = process.env.DEV_SERVER_PORT
const prodServerPort = process.env.PROD_SERVER_PORT 
const nodeEnv = process.env.NODE_ENV
const deployAuth = process.env.DEPLOY_AUTH
const queueTimer = 30000 ///30 seconds to check deployment queue
export const deployKey = process.env.DEPLOY_KEY

const app = express();
app.set("port", nodeEnv === 'production' ? prodServerPort : devServerPort);
app.use(requestIp.mw());

app.use((req:any, res:any, next:any) => {
  const clientIp = requestIp.getClientIp(req);
  next();
});


app.use(bodyParser.json());
app.use(cors({ origin: true}))
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/dcl/deployment", router);
export default app;


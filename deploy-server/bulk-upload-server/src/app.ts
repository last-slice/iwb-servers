import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import requestIp from "request-ip";
import * as dotenv from "dotenv";
import 'dotenv/config'
import { router } from "./api/api.router";

dotenv.config({ path: '../.env', });
 
const deployAuth = process.env.DEPLOY_AUTH
const queueTimer = 30000 ///30 seconds to check deployment queue

const app = express();
// const sse = require('sse-express');

app.set("port", process.env.NODE_ENV === 'production' ? process.env.PROD_SERVER_PORT  : process.env.DEV_SERVER_PORT);
app.use(requestIp.mw());

app.use((req:any, res:any, next:any) => {
  const clientIp = requestIp.getClientIp(req);
  next();
});


// app.use(sse());
app.use(bodyParser.json());
app.use(cors({ origin: true}))
app.use(bodyParser.urlencoded({ limit:'10mb', extended: true, parameterLimit: 50000 }));

app.use("/", router);
export default app;


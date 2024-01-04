import express from "express";
import cors from 'cors'
import bodyParser from "body-parser";
import requestIp from "request-ip";
import { router } from "./api/api.router";


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
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", router);
export default app;


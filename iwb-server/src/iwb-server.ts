
import { listen } from "@colyseus/tools";
import app from "./app.config";

require('dotenv').config({path: "../.env"});

export const deploymentEndpoint = process.env.DEPLOYMENT_ENDPOINT

const port = parseInt(process.env.NODE_ENV === 'production' ? process.env.PROD_SERVER_PORT : process.env.DEV_SERVER_PORT);
listen(app, port);
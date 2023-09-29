
import { listen } from "@colyseus/tools";
import app from "./app.config";

require('dotenv').config({path: "../.env"});

export const playFabTitleId = process.env.PLAYFAB_ID;
export const playFabSecretKey = process.env.PLAYFAB_KEY;
export const githookSecreyKey = process.env.GITHOOK_SECRET
export const gitDeploymentBranch = process.env.GIT_DEPLOYMENT_BRANCH
export const gitIWBServerDeploymentBranch = process.env.GIT_SERVER_DEPLOYMENT_BRANCH
export const deploymentEndpoint = process.env.DEPLOYMENT_ENDPOINT
export const deploymentAuth = process.env.DEPLOYMENT_AUTH

const port = parseInt(process.env.NODE_ENV === 'production' ? process.env.PROD_SERVER_PORT : process.env.DEV_SERVER_PORT);
listen(app, port);
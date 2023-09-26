/**
 * IMPORTANT:
 * ---------
 * Do not manually edit this file if you'd like to host your server on Colyseus Cloud
 *
 * If you're self-hosting (without Colyseus Cloud), you can manually
 * instantiate a Colyseus Server as documented here:
 *
 * See: https://docs.colyseus.io/server/api/#constructor-options
 */
import { listen } from "@colyseus/tools";

// Import Colyseus config
import app from "./app.config";

require('dotenv').config({path: "../.env"});

export const playFabTitleId = process.env.PLAYFAB_ID;
export const playFabSecretKey = process.env.PLAYFAB_KEY;
export const githookSecreyKey = process.env.GITHOOK_SECRET

const port = parseInt(process.env.NODE_ENV === 'production' ? process.env.PROD_SERVER_PORT : process.env.DEV_SERVER_PORT);

listen(app, port);

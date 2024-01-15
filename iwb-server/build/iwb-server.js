"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploymentEndpoint = void 0;
const tools_1 = require("@colyseus/tools");
const app_config_1 = __importDefault(require("./app.config"));
require('dotenv').config({ path: "../.env" });
exports.deploymentEndpoint = process.env.DEPLOYMENT_ENDPOINT;
const port = parseInt(process.env.NODE_ENV === 'production' ? process.env.PROD_SERVER_PORT : process.env.DEV_SERVER_PORT);
(0, tools_1.listen)(app_config_1.default, port);

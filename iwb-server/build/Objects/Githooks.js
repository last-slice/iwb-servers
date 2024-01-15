"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGithook = void 0;
const crypto_1 = __importDefault(require("crypto"));
const functions_1 = require("../utils/functions");
function handleGithook(req) {
    const payload = JSON.stringify(req.body);
    const signature = req.header('x-hub-signature-256') || '';
    console.log(req.body.ref);
    if (verifySignature(payload, signature, process.env.GITHOOK_SECRET)) {
        switch (req.body.ref) {
            case "refs/heads/" + process.env.GIT_DEPLOYMENT_BRANCH:
                console.log('githook detected push to deploy branch, init world redeploy');
                (0, functions_1.initIWBDeploy)();
                break;
            case "refs/heads/" + process.env.GIT_SERVER_DEPLOYMENT_BRANCH:
                console.log("attempting to redeploy iwb-server");
                (0, functions_1.initDeployServerDeploy)();
                break;
        }
    }
    else {
        console.log('failed git signature for', req.body.ref);
    }
}
exports.handleGithook = handleGithook;
function verifySignature(payload, signature, secret) {
    const expectedSignature = `sha256=${crypto_1.default
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')}`;
    return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

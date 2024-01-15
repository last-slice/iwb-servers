"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadRouter = void 0;
const app_config_1 = require("../../app.config");
const config_1 = require("../../utils/config");
const types_1 = require("../../utils/types");
function downloadRouter(router) {
    router.post("/download/ready", async (req, res) => {
        console.log('scene download ready', req.body);
        try {
            app_config_1.iwbManager.sendUserMessage(req.body.user, types_1.SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD, { link: (config_1.DEBUG ? "http://localhost:3525/" : "https://dcl-iwb.co/dcl/deployment/") + "download/" + req.body.user + "/" + req.body.sceneId + "/" + req.body.id });
            res.status(200).send({ valid: true });
        }
        catch (e) {
            console.log("error sending download ready message", e);
            res.status(200).send({ valid: false });
        }
    });
}
exports.downloadRouter = downloadRouter;

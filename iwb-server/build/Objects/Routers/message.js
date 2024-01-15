"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRouter = void 0;
const app_config_1 = require("../../app.config");
function messageRouter(router) {
    router.post("/all/message", async (req, res) => {
        console.log('send message to all users');
        app_config_1.iwbManager.sendAllMessage(req.body);
        res.send("It's time to kick ass and chew bubblegum!");
    });
    router.post("/user/message", async (req, res) => {
        console.log('send message to user');
        app_config_1.iwbManager.attemptUserMessage(req, res);
    });
}
exports.messageRouter = messageRouter;

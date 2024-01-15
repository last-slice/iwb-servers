"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitRouter = void 0;
const Githooks_1 = require("../Githooks");
function gitRouter(router) {
    //github webhooks
    router.post("/githook/deploy/server", (req, res) => {
        console.log('githook api request to deploy iwb server');
        (0, Githooks_1.handleGithook)(req);
        res.send("It's time to kick ass and chew bubblegum!");
    });
    router.post("/githook", (req, res) => {
        console.log('githook api request');
        (0, Githooks_1.handleGithook)(req);
        res.send("It's time to kick ass and chew bubblegum!");
    });
}
exports.gitRouter = gitRouter;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployRouter = void 0;
const Service_1 = require("../Service");
function deployRouter(router) {
    router.post("/deployment/worlds/bulk/:auth", async (req, res) => {
        console.log('received bulk deployment request', req.body);
        (0, Service_1.handlBulkWorldsDeployments)(req, res);
    });
    router.post("/deployment/success", async (req, res) => {
        console.log('received world deployment success', req.body);
        (0, Service_1.handleWorldDeployment)(req, res);
    });
}
exports.deployRouter = deployRouter;

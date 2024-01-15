"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRouter = void 0;
const Service_1 = require("../Service");
function uploadRouter(router) {
    router.post("/uploader/sign", (req, res) => {
        console.log('get jwt token for asset upload session');
        (0, Service_1.handleAssetUploaderSigning)(req, res);
    });
    router.post("/asset/uploaded", async (req, res) => {
        console.log('receive new asset data');
        (0, Service_1.handleNewAssetData)(req, res);
    });
}
exports.uploadRouter = uploadRouter;

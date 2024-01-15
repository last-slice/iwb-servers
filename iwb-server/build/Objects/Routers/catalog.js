"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iwbRouter = void 0;
const app_config_1 = require("../../app.config");
const Service_1 = require("../Service");
function iwbRouter(router) {
    router.post("/lobby/create", async (req, res) => {
        console.log('creating lobby for world', req.body.world);
        try {
            app_config_1.iwbManager.createRealmLobby(req.body.world, false);
            return res.status(200).json({ valid: true });
        }
        catch (e) {
            return res.status(200).json({ valid: false });
        }
    });
    router.post("/update/catalog", async (req, res) => {
        console.log('receive ping to update iwb catalog');
        (0, Service_1.updateCatalogAssets)(req, res);
    });
    router.get("/update/version", async (req, res) => {
        console.log('receive ping to update iwb version');
        (0, Service_1.updateIWBVersion)(req, res);
    });
    router.post("/update/version/manual", async (req, res) => {
        console.log('receive ping to update iwb version');
        (0, Service_1.updateIWBVersion)(req, res, true);
    });
    router.post("/catalog/backup", async (req, res) => {
        console.log('receive ping to update backup catalog');
        try {
            await app_config_1.itemManager.backupCatalog();
            return res.status(200).json({ valid: true });
        }
        catch (e) {
            return res.status(200).json({ valid: false });
        }
    });
    router.get("/catalog/refresh", (req, res) => {
        console.log('refresh cached items on server');
        //to do
        //add admin verification
        app_config_1.itemManager.getServerItems();
        res.status(200).send({ valid: true, msg: "refreshing server items" });
    });
}
exports.iwbRouter = iwbRouter;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemManager = void 0;
const app_config_1 = require("../app.config");
const Playfab_1 = require("../utils/Playfab");
const types_1 = require("../utils/types");
class ItemManager {
    constructor() {
        this.items = new Map();
        this.newItemsToDeploy = [];
        // this.getServerItems(true)
    }
    async initServerItems() {
        try {
            let metadata = await (0, Playfab_1.fetchPlayfabMetadata)(Playfab_1.PLAYFAB_DATA_ACCOUNT);
            let catalogData = await (0, Playfab_1.fetchPlayfabFile)(metadata, "catalog.json");
            catalogData.forEach((item) => {
                if (!this.items.has(item.id)) {
                    this.items.set(item.id, item);
                }
            });
            console.log('catalog size is', this.items.size);
        }
        catch (e) {
            console.log('error fetching data account');
        }
    }
    async getServerItems(init) {
        try {
            let response = await await (0, Playfab_1.getTitleData)({ Keys: ["Builder Items", "Catalog1"] });
            let data = JSON.parse(response.Data['Builder Items']);
            data.forEach((item, i) => {
                if (!this.items.has(item.id)) {
                    this.items.set(item.id, item);
                }
            });
            data = JSON.parse(response.Data["Catalog1"]);
            data.forEach((item, i) => {
                if (!this.items.has(item.id)) {
                    this.items.set(item.id, item);
                }
            });
        }
        catch (e) {
            console.log('error getting server items', e);
        }
    }
    async backupCatalog() {
        let items = [];
        this.items.forEach((item, key) => {
            items.push(item);
        });
        this.uploadFile(Playfab_1.PLAYFAB_DATA_ACCOUNT, 'catalog.json', items);
    }
    async saveNewCatalogAssets(data) {
        console.log('saving new catalog assets', data);
        for (let i = 0; i < data.length; i++) {
            let asset = await this.createNewAsset(data[i]);
            this.newItemsToDeploy.push(asset);
            this.items.set(asset.id, asset);
        }
        await this.backupCatalog();
    }
    async saveNewAsset(user, data) {
        console.log('saving new asset', user, data);
        let asset = await this.createNewAsset(data);
        // this.newItemsToDeploy.push(asset)
        // this.items.set(asset.id, asset)
        let player = app_config_1.iwbManager.findUser(user);
        if (player) {
            console.log('we have player, get their info');
            data.on = "" + player.dclData.displayName;
            player.uploadAsset(asset, true);
        }
        else {
            console.log("player no longer here, need to add to their profile");
            await this.uploadFile(data.o, "catalogs.json", [data]);
        }
    }
    async createNewAsset(data) {
        let asset = {
            id: data.id,
            m: data.m,
            n: data.n,
            im: data.im,
            d: data.d,
            cat: data.cat,
            on: data.on,
            o: data.o,
            isdl: data.isdl,
            ty: data.ty,
            pc: data.pc,
            si: data.fs,
            tag: data.tag,
            bb: data.bb,
            v: app_config_1.iwbManager.worlds.find((w) => w.owner === data.o).cv + 1
        };
        if (data.bb) {
            let size = JSON.parse(data.bb);
            console.log('size is', size);
            asset.bb = { x: parseFloat(size.x.toFixed(2)), y: parseFloat(size.y.toFixed(2)), z: parseFloat(size.z.toFixed(2)) };
        }
        console.log('new asset uploaded is', asset);
        return asset;
    }
    pingUserAssetUploaded(user, data) {
        app_config_1.iwbManager.sendUserMessage(user, types_1.SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, {});
    }
    notifyUsersDeploymentReady() {
        this.newItemsToDeploy.forEach((item) => {
            app_config_1.iwbManager.sendUserMessage(item.o, types_1.SERVER_MESSAGE_TYPES.PLAYER_CATALOG_DEPLOYED, {});
        });
        this.newItemsToDeploy.length = 0;
    }
    async uploadFile(customLogin, filename, file) {
        let user;
        try {
            user = await (0, Playfab_1.playfabLogin)(customLogin);
            let initres = await (0, Playfab_1.initializeUploadPlayerFiles)(user.EntityToken.EntityToken, {
                Entity: { Id: user.EntityToken.Entity.Id, Type: user.EntityToken.Entity.Type },
                FileNames: [filename]
            });
            await (0, Playfab_1.uploadPlayerFiles)(initres.UploadDetails[0].UploadUrl, JSON.stringify(file));
            await (0, Playfab_1.finalizeUploadFiles)(user.EntityToken.EntityToken, {
                Entity: { Id: user.EntityToken.Entity.Id, Type: user.EntityToken.Entity.Type },
                FileNames: [filename],
                ProfileVersion: initres.ProfileVersion,
            });
            console.log('file upload success');
        }
        catch (e) {
            console.log('upload error');
            await (0, Playfab_1.abortFileUploads)(user.EntityToken.EntityToken, {
                Entity: { Id: user.EntityToken.Entity.Id, Type: user.EntityToken.Entity.Type },
                FileNames: [filename],
            });
        }
    }
}
exports.ItemManager = ItemManager;

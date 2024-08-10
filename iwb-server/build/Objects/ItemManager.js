"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemManager = void 0;
const app_config_1 = require("../app.config");
const Playfab_1 = require("../utils/Playfab");
const types_1 = require("../utils/types");
const catalog_json_1 = __importDefault(require("../tests/catalog.json"));
class ItemManager {
    constructor() {
        this.items = new Map();
        this.marketplace = new Map();
        this.newItemsToDeploy = [];
        // this.getServerItems(true)
    }
    async initServerItems() {
        // try{
        //     let metadata = await fetchPlayfabMetadata(PLAYFAB_DATA_ACCOUNT)
        //     let catalogData = await fetchPlayfabFile(metadata, "catalog.json")
        //     catalogData.forEach((item:any)=>{
        //         if(!this.items.has(item.id)){
        //             this.items.set(item.id, item)
        //         }
        //     })
        //     console.log('catalog size is', this.items.size)
        // }
        // catch(e){
        //     console.log('error fetching data account')
        // }
        //for local testing when you need to quickly modify the catalog items
        catalog_json_1.default.forEach((item) => {
            if (!this.items.has(item.id)) {
                this.items.set(item.id, item);
            }
        });
        // marketplace.forEach((item:any)=>{
        //     if(!this.marketplace.has(item.id)){
        //         this.marketplace.set(item.id, item)
        //     }
        // })
        console.log('catalog size is', this.items.size);
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
        let asset = await this.createNewAsset(data, true);
        // let world = iwbManager.worlds.find((w)=> w.owner === user).ens
        // if(!world){
        //     return
        // }//
        let ownerWorldsOnline = app_config_1.iwbManager.rooms.filter(($) => $.owner === user);
        ownerWorldsOnline.forEach((room) => {
            console.log('world is already online, add to cached catalog');
            room.state.realmAssets.set(asset.id, asset);
            room.broadcast(types_1.SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, asset);
            if (room.state.world === data.world) {
                room.state.catalogVersion += 1;
                room.state.realmAssetsChanged = true;
            }
        });
        if (ownerWorldsOnline.length === 0) {
            console.log('world is not found, need to log in and add to catalog');
            let userData = await (0, Playfab_1.playfabLogin)(user);
            let metadata = await (0, Playfab_1.fetchUserMetaData)(userData);
            let json = await (0, Playfab_1.fetchPlayfabFile)(metadata, 'catalogs.json');
            json.version += 1;
            json.items.push(asset);
            await this.uploadFile(data.o, "catalogs.json", json);
        }
        // pushPlayfabEvent(
        //     SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, 
        //     player, 
        //     [{name:data.n, type:data.ty}]
        // )
        // let player:Player = iwbManager.findUser(user)
        // if(player){
        //     console.log('we have player, get their info')
        //     asset.on = "" + player.dclData.name
        //     player.uploadAsset(asset, true)
        //     pushPlayfabEvent(
        //         SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, 
        //         player, 
        //         [{name:data.n, type:data.ty}]
        //     )
        // }else{
        //     asset.on = "" + iwbManager.worlds.find((w)=> w.owner === user).worldName
        //     console.log("player no longer here, need to add to their profile")
        //     let userData = await playfabLogin(user)
        //     let metadata = await fetchUserMetaData(userData)
        //     let catalog = await fetchPlayfabFile(metadata, 'catalogs.json')
        //     asset.pending = true
        //     asset.ugc = true
        //     catalog.push(asset)
        //     await this.uploadFile(data.o, "catalogs.json", catalog)
        //     player.playFabData.PlayFabId,
        //     pushPlayfabEvent(
        //         SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, 
        //         {playfabData:{PlayFabId:userData.PlayFabId}}, 
        //         [{name:data.n, type:data.ty}]
        //     )
        // }
    }
    async createNewAsset(data, ugc) {
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
            sty: data.sty ? data.sty : data.style ? data.style : undefined,
            anim: data.anims ? data.anims : undefined,
            ugc: ugc ? true : undefined,
            pending: true
        };
        let version = ugc ? app_config_1.iwbManager.worlds.find((w) => w.owner === data.o).cv + 1 : app_config_1.iwbManager.version + 1;
        asset.v = version;
        if (data.bb) {
            if (data.ty === "3D") {
                if (typeof data.bb === "string") {
                    data.bb = JSON.parse(data.bb);
                }
                asset.bb = data.bb;
                asset.bb = { x: parseFloat(data.bb.x.toFixed(2)), y: parseFloat(data.bb.z.toFixed(2)), z: parseFloat(data.bb.y.toFixed(2)) };
            }
            else {
                let size = JSON.parse(data.bb);
                asset.bb = { x: parseFloat(size.x.toFixed(2)), y: parseFloat(size.z.toFixed(2)), z: parseFloat(size.y.toFixed(2)) };
            }
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
    getUserCatalog(room) {
        let assets = [];
        room.state.realmAssets.forEach(async (asset) => {
            assets.push(asset);
        });
        return assets;
    }
}
exports.ItemManager = ItemManager;

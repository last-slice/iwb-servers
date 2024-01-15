"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.SelectedAsset = void 0;
const schema_1 = require("@colyseus/schema");
const types_1 = require("../utils/types");
const Playfab_1 = require("../utils/Playfab");
const Scene_1 = require("./Scene");
const colyseus_1 = require("colyseus");
const app_config_1 = require("../app.config");
class SelectedAsset extends schema_1.Schema {
    constructor(info) {
        super();
        this.catalogAsset = false;
        this.componentData = info.componentData;
        this.catalogId = info.catalogId;
        this.assetId = info.assetId;
        this.catalogAsset = info.catalogAsset;
    }
}
exports.SelectedAsset = SelectedAsset;
__decorate([
    (0, schema_1.type)("string")
], SelectedAsset.prototype, "catalogId", void 0);
__decorate([
    (0, schema_1.type)("string")
], SelectedAsset.prototype, "assetId", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], SelectedAsset.prototype, "catalogAsset", void 0);
__decorate([
    (0, schema_1.type)(Scene_1.SceneItem)
], SelectedAsset.prototype, "componentData", void 0);
class Player extends schema_1.Schema {
    constructor(room, client) {
        super();
        this.world = "main";
        this.playtime = 0;
        this.modified = false;
        this.stats = new schema_1.MapSchema();
        this.settings = new Map();
        // assets: Map<string,SceneItem> = new Map()
        this.catalog = new Map();
        this.pendingAssets = [];
        this.room = room;
        this.client = client;
        this.playFabData = client.auth.playfab;
        // console.log('playfab data is', this.playFabData)
        this.dclData = client.userData;
        this.address = client.userData.userId;
        this.name = client.userData.displayName;
        this.mode = types_1.SCENE_MODES.PLAYMODE;
    }
    // setScenes(){
    //   let data = this.playFabData.InfoResultPayload.UserData
    //   console.log('player setting scenes', data)
    //   //hard coded test data
    //   let sceneIds = ["2831","2832","2833"]
    //   ////
    //   if(data.hasOwnProperty("Scenes")){
    //     sceneIds = JSON.parse(data.Scenes.Value)
    //   }
    //   let scenes = sceneManager.scenes.filter((element) => sceneIds.includes(element.id))
    //   console.log('any scenes are a', scenes)
    //   scenes.forEach((scene)=>{
    //     // this.scenes.set(scene.id, scene)
    //   })
    //   if(scenes.length > 0){
    //     console.log('player scenes greater than 0')
    //     this.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_SCENES_CATALOG, {scenes:scenes, user:this.dclData.userId})
    //   }
    // }
    updatePlayMode(mode) {
        this.mode = mode;
    }
    sendPlayerMessage(type, data) {
        // console.log('sending playing message', type,data)
        this.client.send(type, data);
    }
    addSelectedAsset(info) {
        this.selectedAsset = new SelectedAsset(info);
    }
    removeSelectedAsset() {
        this.selectedAsset = null;
    }
    createScene(world, info, parcels) {
        let sceneData = {
            w: world,
            id: "" + (0, colyseus_1.generateId)(5),
            im: info.image ? info.image : "",
            n: info.name,
            d: info.desc,
            o: this.dclData.userId,
            ona: this.dclData.displayName,
            cat: "",
            bps: [],
            bpcl: parcels[0],
            cd: Math.floor(Date.now() / 1000),
            upd: Math.floor(Date.now() / 1000),
            si: 0,
            toc: 0,
            pc: 0,
            pcnt: parcels.length,
            isdl: false,
            e: info.enabled,
            pcls: parcels,
            sp: ["0,0"],
            priv: info.private
        };
        // console.log('creating new scene with data', sceneData)
        let scene = new Scene_1.Scene(sceneData);
        return scene;
    }
    setStats(stats) {
        console.log('player stats are ', stats);
        try {
            if (stats.length == 0) {
                console.log('need to initialize stats');
                // updatePlayerStatistic({
                //   PlayFabId: this.playFabData.PlayFabId,
                //   Statistics:initManager.pDefaultStats
                // })
                //  stats = initManager.pDefaultStats
                //  this.playFabData.InfoResultPayload.PlayerStatistics = initManager.pDefaultStats
            }
            //  initManager.pDefaultStats.forEach((d:any)=>{
            //   // if(stats.filter((stat)=> stat.StatisticName === d.StatisticName).length > 0){
            //      this.stats.set(d.pKey, stats.filter((stat)=> stat.StatisticName === d.StatisticName)[0].Value)
            //   // }
            //  })
        }
        catch (e) {
            console.log('error setting player stats', this.dclData.displayName);
        }
    }
    increaseValueInMap(map, key, incrementAmount) {
        if (map.has(key)) {
            const currentValue = map.get(key);
            const newValue = currentValue + incrementAmount;
            map.set(key, newValue);
        }
        else {
        }
    }
    async uploadAsset(asset, notify) {
        console.log('asset to save is', asset);
        //to do
        //check if already upload and wait before uploading another to the file
        let filename = "catalogs.json";
        let catalog = [];
        asset.on = this.dclData.displayName;
        asset.pending = true;
        asset.ugc = true;
        try {
            let metadata = await (0, Playfab_1.fetchUserMetaData)(this.playFabData);
            if (metadata !== null) {
                catalog = await (0, Playfab_1.fetchPlayfabFile)(metadata, filename);
            }
            catalog.push(asset);
            await app_config_1.itemManager.uploadFile(this.address, "catalogs.json", catalog);
            if (notify) {
                this.sendPlayerMessage(types_1.SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, asset);
            }
        }
        catch (e) {
            console.log('there was an error saving the uploaded asset', e);
        }
    }
    async saveCache() {
        // await this.recordPlayerTime()
        // await this.saveToDB()
    }
    async recordPlayerTime() {
        let now = Math.floor(Date.now() / 1000);
        // this.increaseValueInMap(this.stats, 'pt', now-this.playtime)
        //to do
        //log player play time to playfab
        // initManager.pushEvent({
        //   EventName: 'PLAYTIME',
        //   PlayFabId: this.playFabData.PlayFabId,
        //   Body:{
        //     'type': 'PLAYTIME',
        //     'time': now - this.playtime,
        //     'player':this.dclData.displayName,
        //     'ethaddress':this.dclData.userId
        //   }
        // })
    }
    async saveToDB() {
        console.log('saving player updates to db', this.dclData.userId);
        // let stats:any = []
        // this.stats.forEach((stat,key)=>{
        //   stats.push({StatisticName:initManager.pDefaultStats.filter((stat)=> stat.pKey === key)[0].StatisticName, Value:stat})
        // })
        // try{
        //   // const chunkSize = 10;
        //   // const chunks = [];
        //   // for (let i = 0; i < stats.length; i += chunkSize) {
        //   //   chunks.push(stats.slice(i, i + chunkSize));
        //   // }
        //   // chunks.forEach(async (chunk) => {
        //   //   await updatePlayerStatistic({
        //   //     PlayFabId: this.playFabData.PlayFabId,
        //   //     Statistics: chunk
        //   //   })
        //   // });
        //   let assets:any[] = []
        //   this.assets.forEach((value,key)=>{
        //     assets.push(value)
        //   })
        //   const playerData:any = {
        //     "Settings":JSON.stringify(this.settings),
        //     "Scenes":JSON.stringify(assets)
        //   }
        //   console.log('player data to save is' ,playerData)
        //   await updatePlayerData({
        //     PlayFabId: this.playFabData.PlayFabId,
        //     Data: playerData
        //   })
        // }
        // catch(e){
        //   console.log('saving player info to db error ->', e)
        // }
    }
}
exports.Player = Player;
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "address", void 0);
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)(SelectedAsset)
], Player.prototype, "selectedAsset", void 0);

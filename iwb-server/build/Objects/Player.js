"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.SelectedAsset = exports.PlayerManager = void 0;
const schema_1 = require("@colyseus/schema");
const types_1 = require("../utils/types");
const Playfab_1 = require("../utils/Playfab");
const app_config_1 = require("../app.config");
const axios_1 = __importDefault(require("axios"));
const IWB_1 = require("./IWB");
const Game_1 = require("./Game");
const Transform_1 = require("./Transform");
const Playlist_1 = require("./Playlist");
class PlayerManager {
    constructor() {
        this.players = new Map();
    }
    addPlayerToWorld(player) {
        if (!this.players.has(player.dclData.userId)) {
            this.players.set(player.dclData.userId, player);
        }
    }
    addPlayerToPrivateWorld(player, client, world) {
        player.client = client;
        player.world = world;
        player.sendPlayerMessage(types_1.SERVER_MESSAGE_TYPES.PLAYER_JOINED_USER_WORLD, world);
    }
    removePlayer(user) {
        this.players.delete(user);
    }
    savePlayerCache(player) {
        player.saveCache();
    }
    isInPrivateWorld(player) {
        return this.players.has(player.dclData.userId) && this.players.get(player.dclData.userId).world !== "main";
    }
}
exports.PlayerManager = PlayerManager;
class SelectedAsset extends schema_1.Schema {
    constructor(info) {
        super();
        this.catalogAsset = false;
        this.iwbData = new IWB_1.IWBComponent(info.componentData);
        this.catalogId = info.catalogId;
        this.assetId = info.assetId;
        this.catalogAsset = info.isCatalogSelect;
        this.grabbed = info.grabbed ? info.grabbed : undefined;
        this.ugc = this.iwbData.ugc;
        if (info.childTransform) {
            this.childTransform = new schema_1.MapSchema();
            for (let aid in info.childTransform) {
                this.childTransform.set(aid, info.childTransform[aid]);
            }
        }
    }
}
exports.SelectedAsset = SelectedAsset;
__decorate([
    (0, schema_1.type)("string")
], SelectedAsset.prototype, "sceneId", void 0);
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
    (0, schema_1.type)("string")
], SelectedAsset.prototype, "type", void 0);
__decorate([
    (0, schema_1.type)(IWB_1.IWBComponent)
], SelectedAsset.prototype, "iwbData", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], SelectedAsset.prototype, "grabbed", void 0);
__decorate([
    (0, schema_1.type)("boolean")
], SelectedAsset.prototype, "ugc", void 0);
__decorate([
    (0, schema_1.type)({ map: Transform_1.Vector3 })
], SelectedAsset.prototype, "childTransform", void 0);
class Player extends schema_1.Schema {
    constructor(room, client) {
        super();
        this.gameId = "";
        this.gameStatus = types_1.PLAYER_GAME_STATUSES.NONE;
        this.world = "main";
        this.playtime = 0;
        this.modified = false;
        this.stats = new schema_1.MapSchema();
        this.catalog = new Map();
        this.pendingAssets = [];
        this.pendingDeployment = false;
        this.claimingReward = false;
        this.viewMode = types_1.VIEW_MODES.AVATAR;
        this.scenes = [];
        this.worlds = [];
        this.buildingAllowed = false;
        this.activeSceneId = "";
        this.canBuild = false;
        this.homeWorld = false;
        this.worldPermissions = false;
        this.uploads = [];
        this.landsAvailable = [];
        this.worldsAvailable = [];
        this.gameVariables = {};
        this.room = room;
        this.client = client;
        this.userId = client.userData.userId;
        this.playFabData = client.auth.playfab;
        this.dclData = client.userData;
        this.address = client.userData.userId;
        this.name = client.userData.name;
        this.ip = client.userData.ip;
        this.mode = types_1.SCENE_MODES.PLAYMODE;
        this.startTime = Math.floor(Date.now() / 1000);
        this.setSettings(this.playFabData.InfoResultPayload.UserData);
        // this.loadGameVariables()
    }
    addSelectedAsset(info) {
        console.log('player selected asset', info);
        this.selectedAsset = new SelectedAsset(info);
        this.selectedAsset.sceneId = info.sceneId;
    }
    removeSelectedAsset() {
        this.selectedAsset = null;
    }
    getPlayerData() {
        return this.canBuild;
    }
    sendPlayerMessage(type, data) {
        this.client.send(type, data);
    }
    async uploadAsset(asset, notify) {
        //  console.log('asset to save is', asset)
        //to do
        //check if already upload and wait before uploading another to the file
        let filename = "catalogs.json";
        let catalog = [];
        asset.on = this.dclData.name;
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
        await this.recordPlayerTime();
        await this.saveToDB();
        await this.saveGameData();
    }
    async saveGameData() {
        //   try{
        //     // if(this.gameVariables.length > 0){
        //       console.log('player game variables exists', this.gameVariables)
        //       let initres = await initializeUploadPlayerFiles(this.playFabData.EntityToken.EntityToken,{
        //                   Entity: {Id: this.playFabData.EntityToken.Entity.Id, Type: this.playFabData.EntityToken.Entity.Type},
        //                   FileNames:['gamedata.json']
        //                 })
        //       await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(this.gameVariables))
        //       await finalizeUploadFiles(this.playFabData.EntityToken.EntityToken,
        //           {
        //               Entity: {Id: this.playFabData.EntityToken.Entity.Id, Type: this.playFabData.EntityToken.Entity.Type},
        //               FileNames:['gamedata.json'],
        //               ProfileVersion:initres.ProfileVersion,
        //       })
        //     // }
        //   }
        //   catch(e:any){
        //       console.log('backup file error', e.message)
        //       // if(this.gameVariables.length > 0){
        //         await abortFileUploads(this.playFabData.EntityToken.EntityToken,{
        //           Entity: {Id: this.playFabData.EntityToken.Entity.Id, Type: this.playFabData.EntityToken.Entity.Type},
        //           FileNames:['gamedata.json'],
        //         })
        //       // }
        //   }
    }
    async recordPlayerTime() {
        let now = Math.floor(Date.now() / 1000);
        let time = now - this.startTime;
        (0, Playfab_1.pushPlayfabEvent)(types_1.SERVER_MESSAGE_TYPES.PLAYTIME, this, [{ playtime: time }]);
        // this.increaseValueInMap(this.stats, 'pt', now-this.playtime)
        //to do
        //log player play time to playfab
        // initManager.pushEvent({
        //   EventName: 'PLAYTIME',
        //   PlayFabId: this.playFabData.PlayFabId,
        //   Body:{
        //     'type': 'PLAYTIME',
        //     'time': now - this.playtime,
        //     'player':this.dclData.name,
        //     'ethaddress':this.dclData.userId
        //   }
        // })
    }
    async saveToDB() {
        // console.log('saving player updates to db', this.dclData.userId)
        await this.saveSetttingsDB();
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
    async saveSetttingsDB() {
        //  console.log('saving player settings to db', this.dclData.userId)
        console.log('server settings are ', this.settings);
        this.settings.firstTime = false;
        let res = await (0, Playfab_1.updatePlayerData)({
            PlayFabId: this.playFabData.PlayFabId,
            Data: {
                'Settings': JSON.stringify(this.settings)
            }
        });
        // console.log('update data res is', res)
    }
    updatePlayMode(mode) {
        this.mode = mode;
        if (this.mode === types_1.SCENE_MODES.BUILD_MODE) {
            (0, Playlist_1.garbageCollectPlaylist)(this.room);
        }
    }
    async cancelPendingDeployment() {
        try {
            const result = await axios_1.default.post("https://deployment.dcl-iwb.co/scene/deployment/cancel", { user: this.address, auth: this.pendingDeployment });
            // console.log('validation data', result.data)
        }
        catch (e) {
            console.log('error validating deployment');
        }
    }
    async setSettings(server) {
        // console.log('setting player settings')
        if (!server.hasOwnProperty("Settings")) {
            //  console.log('player doesnt have settings, need to initiliaze')
            this.settings = app_config_1.iwbManager.defaultPlayerSettings;
            await this.saveSetttingsDB();
        }
        else {
            let settings = JSON.parse(server.Settings.Value);
            this.settings = settings;
            if (this.settings.length === 0) {
                console.log('settings are empty, add some');
                this.settings = app_config_1.iwbManager.defaultPlayerSettings;
            }
            //  console.log('player settings are ', this.settings)
        }
    }
    startGame(sceneId, game, status, level) {
        this.gameStatus = status;
        // this.playingGame = true
        // this.gameData = {...game, ...{level:level}, ...{sceneId:sceneId}}
        this.gameId = game.aid;
        // if(!this.gameVariables.hasOwnProperty(game.aid)){
        //   this.gameVariables[game.aid] = {
        //     lastPlayed:Math.floor(Date.now()/1000)
        //   }
        // }else{
        //   this.gameVariables[game.aid].lastPlayed = Math.floor(Date.now()/1000)
        // }
        console.log('player game variables are ', this.gameVariables);
    }
    endGame(room) {
        this.gameStatus = types_1.PLAYER_GAME_STATUSES.NONE;
        // this.playingGame = false
        // console.log('player game data', this.gameData)
        (0, Game_1.updatePlayerGameTime)(room, this);
        // if(this.gameData.type === "MULTIPLAYER"){
        (0, Game_1.removeStalePlayer)(room, this);
        // }
    }
    endGames(room) {
        // if(this.playingGame){
        //   this.endGame(room)
        // }
        if (this.gameStatus !== types_1.PLAYER_GAME_STATUSES.NONE) {
            this.endGame(room);
        }
    }
    inHomeWorld(roomWorld) {
        let world = app_config_1.iwbManager.worlds.find((w) => w.ens === roomWorld);
        if (!world) {
            return false;
        }
        if (world.owner === this.address) {
            return true;
        }
        return false;
    }
}
exports.Player = Player;
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "userId", void 0);
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "address", void 0);
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "gameId", void 0);
__decorate([
    (0, schema_1.type)("string")
], Player.prototype, "gameStatus", void 0);
__decorate([
    (0, schema_1.type)(SelectedAsset)
], Player.prototype, "selectedAsset", void 0);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IWBManager = void 0;
const axios_1 = __importDefault(require("axios"));
const app_config_1 = require("../app.config");
const Playfab_1 = require("../utils/Playfab");
const types_1 = require("../utils/types");
const Scene_1 = require("./Scene");
const colyseus_1 = require("colyseus");
class IWBManager {
    constructor() {
        this.rooms = [];
        this.worldsModified = false;
        this.configModified = false;
        this.backingUp = false;
        this.worlds = [];
        this.pendingSaves = [];
        //server config
        this.version = 0;
        this.versionUpdates = [];
        this.styles = [];
        this.initQueue = [];
        this.realmFileKey = 'scenes.json';
        this.getServerConfigurations();
        this.backupInterval = setInterval(async () => {
            if (this.configModified && !this.backingUp) {
                this.backup();
            }
        }, 1000 * 20);
        this.backupInterval = setInterval(async () => {
            if (this.worldsModified) {
                try {
                    await (0, Playfab_1.setTitleData)({ Key: 'Worlds', Value: JSON.stringify(this.worlds) });
                    this.worldsModified = false;
                }
                catch (e) {
                    console.log('error saving worlds', e);
                }
            }
        }, 1000 * 20);
    }
    async backup() {
        this.backingUp = true;
        await (0, Playfab_1.setTitleData)({ Key: 'Config', Value: JSON.stringify({ v: this.version, updates: this.versionUpdates, styles: this.styles }) });
        this.configModified = false;
        this.backingUp = false;
    }
    addRoom(room) {
        this.rooms.push(room);
    }
    removeRoom(room) {
        // this.rooms.delete(room.roomId)
        let index = this.rooms.findIndex((ro) => ro.roomId === room.roomId);
        if (index >= 0) {
            this.rooms.splice(index, 1);
        }
    }
    updateVersion(version) {
        console.log('update version request verified, updating iwb version to ', version);
    }
    incrementVersion(updates) {
        console.log('increment version request verified, updating iwb version from ' + this.version + " to " + (this.version + 1));
        this.version += 1;
        this.configModified = true;
        if (updates) {
            this.versionUpdates.length = 0;
            this.versionUpdates = updates;
            this.backup();
        }
    }
    async getServerConfigurations(init) {
        try {
            let response = await await (0, Playfab_1.getTitleData)({ Keys: ["Config", "Scenes", "Worlds"] });
            let config = JSON.parse(response.Data['Config']);
            this.version = config.v;
            this.versionUpdates = config.updates;
            this.styles = config.styles;
            let worlds = JSON.parse(response.Data['Worlds']);
            this.worlds = worlds;
            await app_config_1.itemManager.initServerItems();
        }
        catch (e) {
            console.log('error getting server items', e);
        }
    }
    attemptUserMessage(req, res) {
        if (req.body) {
            if (req.body.user) {
                this.sendUserMessage(req.body.user.toLowerCase(), types_1.SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, req.body.message);
                res.status(200).send({ valid: true });
            }
            else {
                res.status(200).send({ valid: false, msg: "invalid user" });
            }
        }
        else {
            res.status(200).send({ valid: false, msg: "Invalid information" });
        }
    }
    sendAllMessage(body) {
        console.log('body to send is', body);
        if (body && body.message) {
            this.rooms.forEach((room) => {
                room.broadcast(types_1.SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, body.message);
            });
        }
    }
    sendUserMessage(user, type, data) {
        this.rooms.forEach((room) => {
            let player = room.state.players.get(user.toLowerCase());
            if (player) {
                player.sendPlayerMessage(type, data);
            }
        });
    }
    findUser(user) {
        let player;
        this.rooms.forEach(async (room, key) => {
            player = room.state.players.get(user.toLowerCase());
        });
        return player;
    }
    async updateAllWorlds() {
        for (let i = 0; i < this.worlds.length; i++) {
            await this.deployWorld(this.worlds[i], false);
        }
    }
    async deployWorld(world, init) {
        let res = await fetch(process.env.DEPLOYMENT_WORLD_ENDPOINT, {
            headers: { "content-type": "application/json" },
            method: "POST",
            body: JSON.stringify({
                auth: process.env.DEPLOYMENT_AUTH,
                world: {
                    ens: world.ens,
                    worldName: world.name,
                    owner: world.owner,
                    init: init
                }
            })
        });
        let json = await res.json();
        console.log('world deployment api response is', json);
    }
    async initWorld(world) {
        let current = this.initQueue.find((w) => w.ens === world.ens);
        if (!current) {
            this.initQueue.push(world);
            await this.deployWorld(world, true);
        }
    }
    saveNewWorld(world) {
        console.log('saving new world', world);
        world.updated = Math.floor(Date.now() / 1000);
        world.builds = 0;
        world.v = this.version;
        this.rooms.forEach((room) => {
            room.broadcast(types_1.SERVER_MESSAGE_TYPES.NEW_WORLD_CREATED, world);
        });
        if (world.init) {
            delete world.init;
            this.createRealmLobby(world, true);
        }
        else {
            delete world.init;
            let cachedWorld = this.worlds.find((w) => w.ens === world.ens);
            if (cachedWorld) {
                cachedWorld.updated = world.updated;
                cachedWorld.v = this.version;
                cachedWorld.cv += 1;
                this.updateRealmPendingAssets(cachedWorld.owner);
            }
        }
        this.worldsModified = true;
        let index = this.initQueue.findIndex((w) => w.ens === world.ens);
        if (index >= 0) {
            this.initQueue.splice(index, 1);
        }
    }
    addWorldPendingSave(world) {
        this.pendingSaves.push(world);
    }
    removeWorldPendingSave(world) {
        let index = this.pendingSaves.findIndex((w) => w === world);
        if (index >= 0) {
            this.pendingSaves.splice(index, 1);
        }
    }
    async createRealmLobby(world, newWorld) {
        this.initiateRealm(world.owner)
            .then((realmData) => {
            let realmToken = realmData.EntityToken.EntityToken;
            let realmId = realmData.EntityToken.Entity.Id;
            let realmTokenType = realmData.EntityToken.Entity.Type;
            this.fetchRealmData(realmData)
                .then((realmScenes) => {
                console.log('realm scenes are ', realmScenes);
                this.fetchRealmScenes(realmScenes)
                    .then((sceneData) => {
                    let scenes = sceneData.filter((scene) => scene.w === world.ens);
                    if (!scenes.find((scene) => scene.n === "Realm Lobby")) {
                        scenes.push(this.createLobbyScene(world));
                        if (newWorld) {
                            world.builds = 1;
                            world.updated = Math.floor(Date.now() / 1000);
                        }
                        this.backupScene(world.ens, realmToken, realmTokenType, realmId, scenes)
                            .then(() => {
                            if (newWorld) {
                                this.worlds.push(world);
                            }
                        })
                            .catch((e) => {
                            console.log('error backing up lobby scene', world.ens, e);
                        });
                    }
                });
            });
        });
    }
    async initiateRealm(user) {
        try {
            const playfabInfo = await (0, Playfab_1.playerLogin)({
                CreateAccount: true,
                ServerCustomId: user,
                InfoRequestParameters: {
                    "UserDataKeys": [], "UserReadOnlyDataKeys": [],
                    "GetUserReadOnlyData": false,
                    "GetUserInventory": false,
                    "GetUserVirtualCurrency": true,
                    "GetPlayerStatistics": false,
                    "GetCharacterInventories": false,
                    "GetCharacterList": false,
                    "GetPlayerProfile": true,
                    "GetTitleData": false,
                    "GetUserAccountInfo": true,
                    "GetUserData": false,
                }
            });
            if (playfabInfo.error) {
                console.log('playfab login error => ', playfabInfo.error);
                return null;
            }
            else {
                console.log('playfab login success, initiate realm');
                return playfabInfo;
            }
        }
        catch (e) {
            console.log('playfab connection error', e);
            return null;
        }
    }
    async fetchRealmData(realmData) {
        let response = await axios_1.default.post("https://" + Playfab_1.PlayfabId + ".playfabapi.com/File/GetFiles", { Entity: { Id: realmData.EntityToken.Entity.Id, Type: realmData.EntityToken.Entity.Type } }, { headers: {
                'content-type': 'application/json',
                'X-EntityToken': realmData.EntityToken.EntityToken
            } });
        return response.data;
    }
    async fetchRealmScenes(realmScenes) {
        if (realmScenes.code === 200) {
            let version = realmScenes.data.ProfileVersion;
            if (version > 0) {
                let metadata = realmScenes.data.Metadata;
                let count = 0;
                for (const key in metadata) {
                    if (metadata.hasOwnProperty(key)) {
                        count++;
                    }
                }
                if (count > 0) {
                    let res = await fetch(metadata[this.realmFileKey].DownloadUrl);
                    let json = await res.json();
                    return json;
                }
                else {
                    return [];
                }
            }
            else {
                return [];
            }
        }
    }
    createLobbyScene(world) {
        let lobby = new Scene_1.Scene({
            w: world.ens,
            id: "" + (0, colyseus_1.generateId)(5),
            n: "Realm Lobby",
            d: "Realm Lobby Scene",
            o: world.owner,
            ona: world.worldName,
            cat: "",
            bps: [],
            bpcl: "0,0",
            cd: Math.floor(Date.now() / 1000),
            upd: Math.floor(Date.now() / 1000),
            si: 0,
            toc: 0,
            pc: 0,
            pcnt: 4,
            isdl: false,
            e: true,
            pcls: ["0,0", "1,0", "1,1", "0,1"],
            sp: ["16,16"],
            ass: [
                { "id": "e6991f31-4b1e-4c17-82c2-2e484f53a123",
                    "aid": "vBXS97",
                    "type": "2D",
                    "p": {
                        "x": 16,
                        "y": 0,
                        "z": 16
                    },
                    "r": {
                        "x": 90,
                        "y": 0,
                        "z": 0
                    },
                    "s": {
                        "x": 32,
                        "y": 32,
                        "z": 1
                    },
                    "comps": [
                        "Transform",
                        "Visibility",
                        "Image",
                        "Material",
                    ],
                    "visComp": {
                        "visible": true
                    },
                    "matComp": {
                        "shadows": true,
                        "metallic": 0,
                        "roughness": 1,
                        "intensity": 0,
                        "emissPath": "",
                        "emissInt": 0,
                        "textPath": "",
                        "color": [
                            "1",
                            "1",
                            "1",
                            "1"
                        ]
                    },
                    "imgComp": {
                        "url": "https://bafkreihxmbloqwqgjljwtq4wzhmo5pclxavyedugdafn2dhuzghgpszuim.ipfs.nftstorage.link/"
                    }
                }
            ]
        });
        return lobby;
    }
    async backupScene(world, token, type, realmId, scenes) {
        try {
            this.addWorldPendingSave(world);
            let initres = await (0, Playfab_1.initializeUploadPlayerFiles)(token, {
                Entity: { Id: realmId, Type: type },
                FileNames: [this.realmFileKey]
            });
            let uploadres = await (0, Playfab_1.uploadPlayerFiles)(initres.UploadDetails[0].UploadUrl, JSON.stringify(scenes));
            let finalres = await (0, Playfab_1.finalizeUploadFiles)(token, {
                Entity: { Id: realmId, Type: type },
                FileNames: [this.realmFileKey],
                ProfileVersion: initres.ProfileVersion,
            });
            this.removeWorldPendingSave(world);
        }
        catch (e) {
            console.log('error backing up realm scenes', world);
            this.abortSaveSceneUploads(world, token, type, realmId);
        }
    }
    async abortSaveSceneUploads(world, token, type, realmId) {
        await (0, Playfab_1.abortFileUploads)(token, {
            Entity: { Id: realmId, Type: type },
            FileNames: [this.realmFileKey]
        });
        this.removeWorldPendingSave(world);
    }
    async updateRealmPendingAssets(world) {
        console.log("updating realm assets for world", world);
        let found = false;
        let assets = [];
        if (this.rooms.length > 0) {
            this.rooms.forEach(async (room, key) => {
                if (room.state.world === world) {
                    room.state.realmAssets.forEach((asset, key) => {
                        asset.pending = false;
                        assets.push(asset);
                    });
                    found = true;
                    return;
                }
            });
        }
        if (found) {
            await app_config_1.itemManager.uploadFile(world, "catalogs.json", [...assets]);
            console.log('finished updating realm assets');
        }
        else {
            console.log('player not on, need to log in first and get catalog before saving');
            let metadata = await (0, Playfab_1.fetchPlayfabMetadata)(world);
            let catalog = await (0, Playfab_1.fetchPlayfabFile)(metadata, "catalogs.json");
            catalog.forEach((asset) => {
                asset.pending = false;
            });
            await app_config_1.itemManager.uploadFile(world, "catalogs.json", [...catalog]);
        }
    }
}
exports.IWBManager = IWBManager;

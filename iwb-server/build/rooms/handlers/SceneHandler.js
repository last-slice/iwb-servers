"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomSceneHandler = void 0;
const app_config_1 = require("../../app.config");
const types_1 = require("../../utils/types");
const config_1 = require("../../utils/config");
let deploymentServer = config_1.DEBUG ? process.env.DEPLOYMENT_SERVER_DEV : process.env.DEPLOYMENT_SERVER_PROD;
class RoomSceneHandler {
    constructor(room) {
        this.room = room;
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.SCENE_DOWNLOAD + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player) { //} && (player.mode === SCENE_MODES.BUILD_MODE)){
                let scene = this.room.state.scenes.get(info.sceneId);
                if (scene) {
                    for (let i = 0; i < scene.ass.length; i++) {
                        let asset = scene.ass[i];
                        if (asset.type === "2D") {
                            let itemConfig = app_config_1.itemManager.items.get(asset.id);
                            asset.n = itemConfig.n;
                        }
                    }
                    try {
                        let res = await fetch(deploymentServer + "scene/download", {
                            method: "POST",
                            headers: { "Content-type": "application/json" },
                            body: JSON.stringify({ scene: scene })
                        });
                        console.log('deployment ping', await res.json());
                    }
                    catch (e) {
                        console.log('error pinging download server for zip file', player.address, e);
                        player.sendPlayerMessage(types_1.SERVER_MESSAGE_TYPES.PLAYER_RECEIVED_MESSAGE, "There was an error initiating your download. Please try again.");
                    }
                }
            }
        });
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.FORCE_DEPLOYMENT, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.FORCE_DEPLOYMENT + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player) {
                let world = app_config_1.iwbManager.worlds.find((w) => w.ens === this.room.state.world);
                if (world && world.owner === client.userData.userId) {
                    app_config_1.iwbManager.deployWorld(world, false);
                }
            }
        });
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.SELECT_PARCEL, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.SELECT_PARCEL + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player && (player.mode === types_1.SCENE_MODES.CREATE_SCENE_MODE || info.current)) {
                if (info.current !== 0) {
                    let scene = this.room.state.scenes.get(info.current);
                    if (scene) {
                        if (this.isOccupied(info.parcel)) {
                            this.removeParcel(scene, info.parcel);
                        }
                        else {
                            scene.pcls.push(info.parcel);
                        }
                    }
                }
                else {
                    if (!this.isOccupied(info.parcel)) {
                        if (info.current) { }
                        if (this.hasTemporaryParcel(info.parcel)) {
                            console.log('player has temporary parcel', info.parcel);
                            this.removeTemporaryParcel(info.parcel);
                        }
                        else {
                            if (!this.hasTemporaryParcel(info.parcel)) {
                                console.log('scene doesnt have temp parcel');
                                this.addTempParcel(info.parcel);
                            }
                        }
                    }
                }
            }
        });
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.SCENE_SAVE_NEW + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player && player.mode === types_1.SCENE_MODES.CREATE_SCENE_MODE) {
                if (this.room.state.temporaryParcels.length > 0) {
                    let scene = player.createScene(this.room.state.world, info, [...this.room.state.temporaryParcels]);
                    this.room.state.scenes.set(scene.id, scene);
                    this.room.state.temporaryParcels.forEach((parcel) => {
                        this.room.state.occupiedParcels.push(parcel);
                    });
                    this.freeTemporaryParcels();
                    let world = app_config_1.iwbManager.worlds.find((w) => w.ens === this.room.state.world);
                    if (world) {
                        world.builds += 1;
                        world.updated = Math.floor(Date.now() / 1000);
                    }
                    player.updatePlayMode(types_1.SCENE_MODES.BUILD_MODE);
                    client.send(types_1.SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, { mode: player.mode });
                }
            }
            else {
                console.log('player is not in create scene mode');
            }
        });
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.SCENE_ADD_BP, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.SCENE_ADD_BP + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player) {
                let scene = this.room.state.scenes.get(info.sceneId);
                if (scene) {
                    if (!scene.bps.includes(info.user)) {
                        scene.bps.push(info.user);
                        client.send(types_1.SERVER_MESSAGE_TYPES.SCENE_ADD_BP, info);
                        let otherPlayer = this.room.state.players.get(info.user);
                        if (otherPlayer) {
                            otherPlayer.sendPlayerMessage(types_1.SERVER_MESSAGE_TYPES.SCENE_ADD_BP, info);
                        }
                    }
                }
            }
        });
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.SCENE_DELETE_BP + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player) {
                let scene = this.room.state.scenes.get(info.sceneId);
                if (scene) {
                    if (scene.bps.includes(info.user)) {
                        let userIndex = scene.bps.findIndex((us) => us === info.user);
                        if (userIndex >= 0) {
                            scene.bps.splice(userIndex, 1);
                            client.send(types_1.SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, info);
                            let otherPlayer = this.room.state.players.get(info.user);
                            if (otherPlayer) {
                                otherPlayer.sendPlayerMessage(types_1.SERVER_MESSAGE_TYPES.SCENE_DELETE_BP, info);
                            }
                        }
                    }
                }
            }
        });
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.SCENE_DELETE, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.SCENE_DELETE + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player) {
                let scene = this.room.state.scenes.get(info.sceneId);
                if (scene) {
                    if (scene.o === client.userData.userId) {
                        let worldConfig = app_config_1.iwbManager.worlds.find((w) => w.ens === this.room.state.world);
                        if (worldConfig) {
                            worldConfig.builds -= 1;
                            worldConfig.updated = Math.floor(Date.now() / 1000);
                        }
                        this.room.state.scenes.delete(info.sceneId);
                        scene.bps.forEach((user) => {
                            let player = room.state.players.get(user);
                            if (player) {
                                player.sendPlayerMessage(types_1.SERVER_MESSAGE_TYPES.SCENE_DELETE, info);
                            }
                        });
                    }
                }
            }
        });
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.SCENE_SAVE_EDITS, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.SCENE_SAVE_EDITS + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player) {
                let scene = this.room.state.scenes.get(info.sceneId);
                if (scene) {
                    if (scene.o === client.userData.userId) {
                        scene.n = info.name;
                        scene.d = info.desc;
                        scene.e = info.enabled;
                        scene.priv = info.priv;
                        let worldConfig = app_config_1.iwbManager.worlds.find((w) => w.ens === this.room.state.world);
                        if (worldConfig) {
                            worldConfig.updated = Math.floor(Date.now() / 1000);
                        }
                        room.broadcast(types_1.SERVER_MESSAGE_TYPES.SCENE_SAVE_EDITS, info);
                    }
                }
            }
        });
    }
    removeParcel(scene, parcel) {
        let parcelIndex = scene.pcls.findIndex((p) => p === parcel);
        if (parcelIndex >= 0) {
            //to do
            //remove parcel asssets
            scene.pcls.splice(parcelIndex, 1);
        }
    }
    freeTemporaryParcels() {
        this.room.state.temporaryParcels.clear();
    }
    removeTemporaryParcel(parcel) {
        let index = this.room.state.temporaryParcels.findIndex((p) => p === parcel);
        if (index >= 0) {
            this.room.state.temporaryParcels.splice(index, 1);
        }
    }
    addTempParcel(parcel) {
        this.room.state.temporaryParcels.push(parcel);
    }
    isOccupied(parcel) {
        let parcels = [];
        this.room.state.scenes.forEach((scene, key) => {
            scene.pcls.forEach((parcel) => {
                parcels.push(parcel);
            });
        });
        return parcels
            .find((p) => p === parcel);
    }
    hasTemporaryParcel(parcel) {
        return [...this.room.state.temporaryParcels]
            .find((p) => p === parcel) || this.isOccupied(parcel);
    }
    checkAssetsForEditByPlayer(user) {
        this.room.state.scenes.forEach((scene, key) => {
            scene.ass.forEach((asset, assetKey) => {
                if (asset.editing && asset.editor === user) {
                    asset.editing = false;
                    asset.editor = "";
                }
            });
        });
    }
}
exports.RoomSceneHandler = RoomSceneHandler;

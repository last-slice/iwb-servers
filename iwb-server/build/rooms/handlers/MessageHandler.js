"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomMessageHandler = void 0;
const PlayerHandlers_1 = require("./PlayerHandlers");
const SceneHandler_1 = require("./SceneHandler");
const SceneItemHandler_1 = require("./SceneItemHandler");
class RoomMessageHandler {
    constructor(room) {
        this.room = room;
        this.playerHandler = new PlayerHandlers_1.RoomPlayerHandler(room);
        this.sceneHandler = new SceneHandler_1.RoomSceneHandler(room);
        this.sceneItemHandler = new SceneItemHandler_1.RoomSceneItemHandler(room);
    }
    broadcast(type, data) {
        this.room.broadcast(type, data);
    }
}
exports.RoomMessageHandler = RoomMessageHandler;

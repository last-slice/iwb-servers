"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomPlayerHandler = void 0;
const types_1 = require("../../utils/types");
const app_config_1 = require("../../app.config");
class RoomPlayerHandler {
    constructor(room) {
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player) {
                player.updatePlayMode(info.mode);
                // room.broadcast(SERVER_MESSAGE_TYPES.PLAY_MODE_CHANGED, info)       
            }
        });
        room.onMessage(types_1.SERVER_MESSAGE_TYPES.INIT_WORLD, async (client, info) => {
            console.log(types_1.SERVER_MESSAGE_TYPES.INIT_WORLD + " message", info);
            let player = room.state.players.get(client.userData.userId);
            if (player) {
                console.log('need to initiate deployment to world');
                app_config_1.iwbManager.initWorld(info.world);
            }
        });
    }
}
exports.RoomPlayerHandler = RoomPlayerHandler;

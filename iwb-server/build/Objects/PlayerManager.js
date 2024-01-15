"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerManager = void 0;
const types_1 = require("../utils/types");
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMintcontract = exports.updateMintsEnabled = exports.updateAirdropServer = exports.updateDiscordEnabled = exports.updateAirdropsEnabled = exports.mintContract = exports.discordEnabled = exports.mintsEnabled = exports.airdropsEnabled = exports.giveawayAuth = exports.giveawayServer = exports.airdropAuth = exports.airdropServer = exports.DEBUG = void 0;
exports.DEBUG = false;
exports.airdropServer = "";
exports.airdropAuth = "";
exports.giveawayServer = "";
exports.giveawayAuth = "";
exports.airdropsEnabled = false;
exports.mintsEnabled = false;
exports.discordEnabled = false;
exports.mintContract = "";
function updateAirdropsEnabled(enabled) {
    exports.airdropsEnabled = enabled;
}
exports.updateAirdropsEnabled = updateAirdropsEnabled;
function updateDiscordEnabled(enabled) {
    exports.discordEnabled = enabled;
}
exports.updateDiscordEnabled = updateDiscordEnabled;
function updateAirdropServer(link) {
    exports.airdropServer = link;
}
exports.updateAirdropServer = updateAirdropServer;
function updateMintsEnabled(enabled) {
    exports.mintsEnabled = enabled;
}
exports.updateMintsEnabled = updateMintsEnabled;
function updateMintcontract(c) {
    exports.mintContract = c;
}
exports.updateMintcontract = updateMintcontract;

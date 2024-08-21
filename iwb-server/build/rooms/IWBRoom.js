"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IWBRoom = void 0;
const core_1 = require("@colyseus/core");
const IWBRoomState_1 = require("./IWBRoomState");
const Scene_1 = require("../Objects/Scene");
const Player_1 = require("../Objects/Player");
const types_1 = require("../utils/types");
const PlayerHandler_1 = require("./messaging/PlayerHandler");
const app_config_1 = require("../app.config");
const Playfab_1 = require("../utils/Playfab");
class IWBRoom extends core_1.Room {
    async onAuth(client, options, req) {
        try {
            return await this.doLogin(client, options, req);
        }
        catch (e) {
            console.log('authentication error', e);
            return false;
        }
    }
    onCreate(options) {
        // console.log('on create options are ', options)
        this.setState(new IWBRoomState_1.IWBRoomState());
        this.state.world = options.world;
        options.island !== "world" ? this.state.gcWorld = true : null;
        this.state.options = options;
        let worldConfig = app_config_1.iwbManager.worlds.find(($) => $.ens === options.world);
        if (worldConfig) {
            this.state.cv = worldConfig.cv;
            this.state.owner = worldConfig.owner;
        }
    }
    onJoin(client, options) {
        try {
            client.userData = options.userData;
            client.userData.ip = client.auth.ip;
            delete client.userData.avatar;
            client.userData.roomId = this.roomId;
            this.getPlayerInfo(client, options);
        }
        catch (e) {
            console.log('on join error', e);
        }
    }
    async onLeave(client, consented) {
        let player = this.state.players.get(client.userData.userId);
        if (player) {
            console.log('we have player to remove');
            this.state.players.delete(client.userData.userId);
            player.endGames(this);
            //     checkAssetsForEditByPlayer(this, client.userData.userid)
            //     if(!player.pendingDeployment){}
            //     else{
            //         player.cancelPendingDeployment()
            //     }
            setTimeout(() => {
                (0, PlayerHandler_1.removePlayer)(player.dclData.userId);
                (0, PlayerHandler_1.savePlayerCache)(player);
                this.broadcast(types_1.SERVER_MESSAGE_TYPES.PLAYER_LEAVE, { player: client.userData.userId });
            }, 1000 * 5);
        }
    }
    async onDispose() {
        console.log("room", this.roomId, "disposing...");
        if (app_config_1.iwbManager.rooms.find(($) => $.roomId === this.roomId)) {
            console.log('room is online, clean up', this.state.world);
            if (!this.state.gcWorld) {
                await (0, Scene_1.saveRealm)(this);
            }
            app_config_1.iwbManager.removeRoom(this);
            app_config_1.iwbManager.garbageCollectRoom(this);
        }
    }
    async getPlayerInfo(client, options) {
        let player = new Player_1.Player(this, client);
        this.state.players.set(options.userData.userId, player);
        (0, PlayerHandler_1.addPlayerToWorld)(player);
        await app_config_1.iwbManager.processPendingRoom(this, player);
        console.log('process pending room completed');
        (0, Playfab_1.pushPlayfabEvent)(types_1.SERVER_MESSAGE_TYPES.PLAYER_JOINED, player, [{ world: options.world, island: options.island }]);
    }
    async doLogin(client, options, request) {
        // console.log('login options', options)
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                // console.log('Timeout finished!');
                const ipAddress = request.headers['x-forwarded-for'] || request.socket.address().address;
                if (!await optionsValidated(options)) {
                    console.log('rejected validation', options);
                    reject(options);
                    (0, Playfab_1.pushPlayfabEvent)(types_1.SERVER_MESSAGE_TYPES.PLAYER_JOINED, Playfab_1.PLAYFAB_DATA_ACCOUNT, [{ world: options.world, ip: ipAddress, island: options.island, potentialBot: true }]);
                    return false;
                }
                console.log('we are logged in');
                let info = false;
                try {
                    // console.log(`Client IP address: ${ipAddress}`);
                    const playfabInfo = await (0, Playfab_1.playerLogin)({
                        CreateAccount: true,
                        ServerCustomId: options.userData.userId,
                        InfoRequestParameters: {
                            "UserDataKeys": [], "UserReadOnlyDataKeys": [],
                            "GetUserReadOnlyData": true,
                            "GetUserInventory": false,
                            "GetUserVirtualCurrency": false,
                            "GetPlayerStatistics": true,
                            "GetCharacterInventories": false,
                            "GetCharacterList": false,
                            "GetPlayerProfile": true,
                            "GetTitleData": false,
                            "GetUserAccountInfo": true,
                            "GetUserData": true,
                        },
                        CustomTags: {
                            ipAddress: ipAddress
                        }
                    });
                    if (playfabInfo.error) {
                        console.log('playfab login error => ', playfabInfo.error);
                        reject(options);
                        return false;
                    }
                    else {
                        //  console.log('playfab login success')
                        client.auth = {};
                        client.auth.playfab = playfabInfo;
                        client.auth.ip = ipAddress;
                        // console.log('playfab info', playfabInfo)
                        if (playfabInfo.NewlyCreated || !playfabInfo.InfoResultPayload.AccountInfo.TitleInfo.DisplayName) {
                            let [data, stats] = await this.initializeServerPlayerData(options, client.auth);
                            client.auth.playfab.InfoResultPayload.PlayerStatistics = stats;
                            client.auth.playfab.InfoResultPayload.UserData = data;
                            info = client.auth;
                        }
                        else {
                            //to do
                            // we have no stats yet
                            //   let stats = await this.checkInitStats(client.auth)
                            //   client.auth.InfoResultPayload.PlayerStatistics = stats
                            info = client.auth;
                        }
                    }
                    resolve(info); // Resolve the Promise with the data
                }
                catch (e) {
                    console.log('playfab connection error', e);
                    reject(info);
                }
            }, 2000); // Adjust the timeout duration as needed
        });
    }
    async initializeServerPlayerData(options, auth) {
        options.userData.name.replace(" ", "_").trim();
        options.userData.name === "Guest" ?
            options.userData.name = "Guest" :
            options.userData.name;
        //set new user display name
        try {
            const result = await (0, Playfab_1.updatePlayerDisplayName)({
                DisplayName: options.userData.name === "Guest" ?
                    options.userData.name + options.userData.userId.substring(options.userData.userId.length - 5) :
                    options.userData.name,
                PlayFabId: auth.playfab.PlayFabId
            });
            console.log('result for new player', result);
        }
        catch (e) {
            console.log('error updating display name', e);
        }
        let def = {};
        def.address = options.userData.userId;
        def.web3 = !options.userData.isGuest;
        //set initial player data
        const initPlayerDataRes = await (0, Playfab_1.updatePlayerInternalData)({
            Data: def,
            PlayFabId: auth.playfab.PlayFabId
        });
        // console.log('setting eth address result', initPlayerDataRes)
        let stats = [];
        //we have no stats for now
        // initManager.pDefaultStats.forEach((stat,key)=>{
        //   stats.push({StatisticName:stat.StatisticName, Value:stat.Value})
        // })
        let data = {
            Settings: {
                Value: JSON.stringify(app_config_1.iwbManager.defaultPlayerSettings)
            },
            Assets: {
                Value: JSON.stringify([])
            },
            Scenes: {
                Value: JSON.stringify([])
            }
        };
        return [data, stats];
    }
}
exports.IWBRoom = IWBRoom;
function optionsValidated(options) {
    // console.log("validation options", options)
    if (!options ||
        !options.world ||
        !options.userData ||
        !options.userData.userId ||
        !options.userData.name //|| 
    // options.userData.name === ""
    ) {
        return false;
    }
    return true;
}

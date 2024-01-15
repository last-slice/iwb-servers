"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IWBRoom = void 0;
const core_1 = require("@colyseus/core");
const IWBRoomState_1 = require("./schema/IWBRoomState");
const Player_1 = require("../Objects/Player");
const MessageHandler_1 = require("./handlers/MessageHandler");
const app_config_1 = require("../app.config");
const types_1 = require("../utils/types");
const Playfab_1 = require("../utils/Playfab");
const SceneManager_1 = require("./handlers/SceneManager");
class IWBRoom extends core_1.Room {
    async onAuth(client, options, req) {
        // console.log("onAuth", options)
        // const token = options.token
        // if (!token) return false;
        // //Decode token
        // const decodedToken = <JWTPayloadUserId>jwt.verify(token, process.env.SERVER_SECRET);
        // console.log("auth", decodedToken)
        // if (this.state.players.has(decodedToken.userId)) {
        //     console.log('user already signed in')
        //     return false
        // }
        // // return auth data so we can read in onJoin
        // return {...decodedToken, ...await this.doLogin(client, options, req)}
        return await this.doLogin(client, options, req); //        
    }
    onCreate(options) {
        this.setState(new IWBRoomState_1.IWBRoomState());
        this.state.world = options.world;
        console.log('room realm is', options.world);
        this.state.messageHandler = new MessageHandler_1.RoomMessageHandler(this);
        this.state.sceneManager = new SceneManager_1.RoomSceneManager(this, options.world);
        app_config_1.iwbManager.addRoom(this);
    }
    onJoin(client, options, auth) {
        try {
            // console.log(auth.userId, "joined! -", options.userData.displayName, "Realm -", auth.realm);
            client.userData = options.userData;
            // client.userData.userId = auth.userId;
            // client.userData.realm = auth.realm;
            delete client.userData.avatar;
            client.userData.roomId = this.roomId;
            this.getPlayerInfo(client, options);
        }
        catch (e) {
            console.log('on join error', e);
        }
    }
    async onLeave(client, consented) {
        console.log(client.userData.userId, "left!", consented);
        let player = this.state.players.get(client.userData.userId);
        if (player) {
            this.state.players.delete(client.userData.userId);
            this.state.messageHandler.sceneHandler.checkAssetsForEditByPlayer(client.userData.userid);
            setTimeout(() => {
                console.log('player is not in another world, need to remove them from server');
                app_config_1.playerManager.removePlayer(player.dclData.userId);
                app_config_1.playerManager.savePlayerCache(player);
                this.broadcast(types_1.SERVER_MESSAGE_TYPES.PLAYER_LEAVE, { player: client.userData.userId });
            }, 1000 * 5);
        }
    }
    onDispose() {
        console.log("room", this.roomId, "disposing...");
        app_config_1.iwbManager.removeRoom(this);
        this.state.sceneManager.saveRealmScenes();
    }
    async getPlayerInfo(client, options) {
        client.send(types_1.SERVER_MESSAGE_TYPES.INIT, {
            catalog: app_config_1.itemManager.items,
            realmAssets: this.state.realmAssets,
            styles: app_config_1.iwbManager.styles,
            worlds: app_config_1.iwbManager.worlds,
            iwb: { v: app_config_1.iwbManager.version, updates: app_config_1.iwbManager.versionUpdates },
        });
        let player = new Player_1.Player(this, client);
        this.state.players.set(options.userData.userId, player);
        app_config_1.playerManager.addPlayerToWorld(player);
        //todo
        // pushPlayfabEvent({
        //   EventName: 'JOINED',
        //   PlayFabId: client.auth.PlayFabId,
        //   Body:{
        //     'player':options.userData.displayName,
        //     'ethaddress':options.userData.userId,
        //     'ip': client.auth.ip
        //   }
        // })
    }
    async doLogin(client, options, request) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                console.log('Timeout finished!');
                let info = false;
                try {
                    const ipAddress = request.headers['x-forwarded-for'] || request.socket.address().address;
                    console.log(`Client IP address: ${ipAddress}`);
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
                    }
                    else {
                        console.log('playfab login success');
                        client.auth = {};
                        client.auth.playfab = playfabInfo;
                        client.auth.ip = ipAddress;
                        // console.log('playfab info', playfabInfo)
                        if (playfabInfo.NewlyCreated) {
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
                }
                catch (e) {
                    console.log('playfab connection error', e);
                }
                resolve(info); // Resolve the Promise with the data
            }, 2000); // Adjust the timeout duration as needed
        });
    }
    async initializeServerPlayerData(options, auth) {
        //set new user display name
        const result = await (0, Playfab_1.updatePlayerDisplayName)({
            DisplayName: options.userData.displayName,
            PlayFabId: auth.playfab.PlayFabId
        });
        console.log('setting player name res is', result);
        let def = {};
        def.address = options.userData.userId;
        def.web3 = options.userData.hasConnectedWeb3;
        //set initial player data
        const initPlayerDataRes = await (0, Playfab_1.updatePlayerInternalData)({
            Data: def,
            PlayFabId: auth.playfab.PlayFabId
        });
        console.log('setting eth address result', initPlayerDataRes);
        let stats = [];
        //we have no stats for now
        // initManager.pDefaultStats.forEach((stat,key)=>{
        //   stats.push({StatisticName:stat.StatisticName, Value:stat.Value})
        // })
        let data = {
            Settings: {
                Value: JSON.stringify([])
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

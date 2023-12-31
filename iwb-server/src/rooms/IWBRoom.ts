import {Client, Room} from "@colyseus/core";
import {IWBRoomState} from "./schema/IWBRoomState";
import {Player} from "../Objects/Player";
import {RoomMessageHandler} from "./handlers/MessageHandler";
import {itemManager, iwbManager, playerManager} from "../app.config";
import {SERVER_MESSAGE_TYPES} from "../utils/types";
import {playerLogin, updatePlayerDisplayName, updatePlayerInternalData} from "../utils/Playfab";
import * as jwt from "jsonwebtoken";
import { RoomSceneManager } from "./handlers/SceneManager";

export interface JWTPayloadUserId extends jwt.JwtPayload {
    userId: string
    realm: string
    origin: string
}

export class IWBRoom extends Room<IWBRoomState> {

    async onAuth(client: Client, options: any, req: any) {

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
        return await this.doLogin(client, options, req)//
    }

    onCreate(options: any) {
        this.setState(new IWBRoomState());
        this.state.world = options.world
        console.log('room realm is', options.world)

        this.state.messageHandler = new RoomMessageHandler(this)
        this.state.sceneManager = new RoomSceneManager(this, options.world)

        iwbManager.addRoom(this)
    }

    onJoin(client: Client, options: any, auth: JWTPayloadUserId) {
        try {
            // console.log(auth.userId, "joined! -", options.userData.displayName, "Realm -", auth.realm);

            client.userData = options.userData;
            // client.userData.userId = auth.userId;
            // client.userData.realm = auth.realm;

            delete client.userData.avatar
            client.userData.roomId = this.roomId

            this.getPlayerInfo(client, options)
        } catch (e) {
            console.log('on join error', e)
        }
    }

    async onLeave(client: Client, consented: boolean) {
        console.log(client.userData.userId, "left!", consented);

        let player:Player = this.state.players.get(client.userData.userId)
        if(player){
            this.state.players.delete(client.userData.userId)

            this.state.messageHandler.sceneHandler.checkAssetsForEditByPlayer(client.userData.userid)

          setTimeout(()=>{
            console.log('player is not in another world, need to remove them from server')
            playerManager.removePlayer(player.dclData.userId)
            playerManager.savePlayerCache(player)
            this.broadcast(SERVER_MESSAGE_TYPES.PLAYER_LEAVE, {player: client.userData.userId})
          }, 1000 * 5)

        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
        iwbManager.removeRoom(this)
        this.state.sceneManager.saveRealmScenes()
    }

    async getPlayerInfo(client: Client, options: any) {
        client.send(SERVER_MESSAGE_TYPES.INIT, {
            catalog: itemManager.items,
            styles: iwbManager.styles,
            scenes: iwbManager.getScenes(),
            worlds: iwbManager.worlds,
            iwb: {v: iwbManager.version, updates:iwbManager.versionUpdates},
        })

        let player = new Player(this, client)
        this.state.players.set(options.userData.userId, player)
        playerManager.addPlayerToWorld(player)

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

    async doLogin(client: any, options: any, request: any) {

        const ipAddress = request.headers['x-forwarded-for'] || request.socket.address().address;
        console.log(`Client IP address: ${ipAddress}`);

        try {
            const playfabInfo = await playerLogin(
                {
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
                })

            if (playfabInfo.error) {
                console.log('playfab login error => ', playfabInfo.error)
                return false
            } else {
                console.log('playfab login success')
                client.auth = {}
                client.auth.playfab = playfabInfo
                client.auth.ip = ipAddress
                // console.log('playfab info', playfabInfo)

                if (playfabInfo.NewlyCreated) {
                    let [data, stats] = await this.initializeServerPlayerData(options, client.auth)
                    client.auth.playfab.InfoResultPayload.PlayerStatistics = stats
                    client.auth.playfab.InfoResultPayload.UserData = data
                    return client.auth
                } else {
                    //to do
                    // we have no stats yet
                    //   let stats = await this.checkInitStats(client.auth)
                    //   client.auth.InfoResultPayload.PlayerStatistics = stats
                    return client.auth
                }
            }
        } catch (e) {
            console.log('playfab connection error', e)
        }

    }

    async initializeServerPlayerData(options: any, auth: any) {

        //set new user display name
        const result = await updatePlayerDisplayName({
            DisplayName: options.userData.displayName,
            PlayFabId: auth.playfab.PlayFabId
        })
        console.log('setting player name res is', result)

        let def: any = {}
        def.address = options.userData.userId
        def.web3 = options.userData.hasConnectedWeb3

        //set initial player data
        const initPlayerDataRes = await updatePlayerInternalData({
            Data: def,
            PlayFabId: auth.playfab.PlayFabId
        })
        console.log('setting eth address result', initPlayerDataRes)

        let stats: any[] = []
        //we have no stats for now
        // initManager.pDefaultStats.forEach((stat,key)=>{
        //   stats.push({StatisticName:stat.StatisticName, Value:stat.Value})
        // })

        let data:any = {
          Settings:{
            Value:JSON.stringify([])
          },
          Assets:{
            Value:JSON.stringify([])
          },
          Scenes:{
            Value:JSON.stringify([])
          }
        }

        return [data, stats]
    }

}

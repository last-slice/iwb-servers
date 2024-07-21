import {Client, Room} from "@colyseus/core";
import {IWBRoomState} from "./IWBRoomState";
import { Scene, initServerAssets, initServerScenes, loadRealmScenes, saveRealm, saveRealmScenes } from "../Objects/Scene";
import { testData } from "../tests/data";
import { iwbSceneActionHandler } from "./messaging/ActionHandler";
import { Player } from "../Objects/Player";
import { SERVER_MESSAGE_TYPES } from "../utils/types";
import { iwbRewardHandler } from "./messaging/RewardHandler";
import { addPlayerToWorld, iwbPlayerHandler, removePlayer, savePlayerCache } from "./messaging/PlayerHandler";
import { itemManager, iwbManager } from "../app.config";
import { playerLogin, pushPlayfabEvent, updatePlayerDisplayName, updatePlayerInternalData } from "../utils/Playfab";
import { checkAssetsForEditByPlayer, iwbSceneHandler } from "./messaging/SceneHandler";
import { iwbItemHandler } from "./messaging/ItemHandler";
import { iwbSceneGameHandler } from "./messaging/GameHandler";

import data from '../tests/data.json'
import { garbageCollectRealmGames } from "../Objects/Game";

export class IWBRoom extends Room<IWBRoomState> {

    async onAuth(client: Client, options: any, req: any) {
        return await this.doLogin(client, options, req)   
    }

    onCreate(options: any) {
        console.log('on create options are ', options)
        this.setState(new IWBRoomState());
        this.state.world = options.world
        options.island !== "world" ? this.state.gcWorld = true : null
        
        iwbItemHandler(this)
        iwbSceneActionHandler(this)
        // iwbRewardHandler(this)
        iwbSceneGameHandler(this)
        iwbPlayerHandler(this)
        iwbSceneHandler(this)

        initServerScenes(this, options.island !== "world" ? options : undefined)
        // loadRealmScenes(this, data)
        initServerAssets(this)

        // createCustomObjects(this)

        iwbManager.addRoom(this)
    }
 
    onJoin(client: Client, options: any) {
        try {
            client.userData = options.userData;
            client.userData.ip = client.auth.ip

            delete client.userData.avatar
            client.userData.roomId = this.roomId

            this.getPlayerInfo(client, options)
        } catch (e) {
            console.log('on join error', e)
        }
    }

    async onLeave(client: Client, consented: boolean) {
        let player:Player = this.state.players.get(client.userData.userId)
        if(player){
            console.log('we have player to remove')
            this.state.players.delete(client.userData.userId)
            player.endGames(this)

        //     checkAssetsForEditByPlayer(this, client.userData.userid)
            
        //     if(!player.pendingDeployment){}
        //     else{
        //         player.cancelPendingDeployment()
        //     }

        //   setTimeout(()=>{
        //     removePlayer(player.dclData.userId)
        //     savePlayerCache(player)
        //     this.broadcast(SERVER_MESSAGE_TYPES.PLAYER_LEAVE, {player: client.userData.userId})
        //   }, 1000 * 5)
        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
        iwbManager.removeRoom(this)
        if(!this.state.gcWorld){
            saveRealm(this)
        }
        // destroyCustomObjects(this)
        garbageCollectRealmGames(this)
    }

    async getPlayerInfo(client: Client, options: any) {
        let player = new Player(this, client)
        this.state.players.set(options.userData.userId, player)
        addPlayerToWorld(player)

        client.send(SERVER_MESSAGE_TYPES.INIT, {
            realmAssets: this.state.realmAssets,
            styles: iwbManager.styles,
            worlds: iwbManager.worlds,
            iwb: {v: iwbManager.version, updates:iwbManager.versionUpdates},
            tutorials: {
                videos: iwbManager.tutorials,
                cid: iwbManager.tutorialsCID
            }
        })

        pushPlayfabEvent(
            SERVER_MESSAGE_TYPES.PLAYER_JOINED, 
            player, 
            [{world:options.world}]
        )
    }

    async doLogin(client: any, options: any, request: any) {
        // console.log('login options', options)
        return new Promise((resolve) => {
            setTimeout(async() => {
                // console.log('Timeout finished!');
                let info:any = false
                try {

                    const ipAddress = request.headers['x-forwarded-for'] || request.socket.address().address;
                    // console.log(`Client IP address: ${ipAddress}`);
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
                     //    console.log('playfab login error => ', playfabInfo.error)
                    } else {
                       //  console.log('playfab login success')
                        client.auth = {}
                        client.auth.playfab = playfabInfo
                        client.auth.ip = ipAddress
                        // console.log('playfab info', playfabInfo)
        
                        if (playfabInfo.NewlyCreated || !playfabInfo.InfoResultPayload.AccountInfo.TitleInfo.DisplayName) {
                            let [data, stats] = await this.initializeServerPlayerData(options, client.auth)

                            client.auth.playfab.InfoResultPayload.PlayerStatistics = stats
                            client.auth.playfab.InfoResultPayload.UserData = data

                            info = client.auth
                        } else {
                            //to do
                            // we have no stats yet
                            //   let stats = await this.checkInitStats(client.auth)
                            //   client.auth.InfoResultPayload.PlayerStatistics = stats
                            info = client.auth
                        }
                    }
                } catch (e) {
                    console.log('playfab connection error', e)
                }
                resolve(info); // Resolve the Promise with the data
              }, 2000); // Adjust the timeout duration as needed
            });
    }

    async initializeServerPlayerData(options: any, auth: any) {

        options.userData.name.replace(" ", "_").trim()
        options.userData.name === "Guest" ? 
            options.userData.name = "Guest" : 
                options.userData.name

        //set new user display name
        try{
            const result = await updatePlayerDisplayName({
                DisplayName: options.userData.name === "Guest" ? 
                options.userData.name + options.userData.userId.substring(options.userData.userId.length - 5) : 
                options.userData.name,
                
                PlayFabId: auth.playfab.PlayFabId
            })
            console.log('result for new player', result)
        }
        catch(e){
            console.log('error updating display name', e)
        }

        let def: any = {}
        def.address = options.userData.userId
        def.web3 = !options.userData.isGuest

        //set initial player data
        const initPlayerDataRes = await updatePlayerInternalData({
            Data: def,
            PlayFabId: auth.playfab.PlayFabId
        })
        // console.log('setting eth address result', initPlayerDataRes)

        let stats: any[] = []
        //we have no stats for now
        // initManager.pDefaultStats.forEach((stat,key)=>{
        //   stats.push({StatisticName:stat.StatisticName, Value:stat.Value})
        // })

        let data:any = {
          Settings:{
            Value:JSON.stringify(iwbManager.defaultPlayerSettings)
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
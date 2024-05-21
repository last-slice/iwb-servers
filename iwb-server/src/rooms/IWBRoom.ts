import {Client, Room} from "@colyseus/core";
import {IWBRoomState} from "./IWBRoomState";
import { Scene } from "../Objects/Components";
import { iwbItemHandler } from "./messaging/ItemHandler";
import { testData } from "../tests/data";
import { iwbSceneActionHandler } from "./messaging/ActionHandler";
import { Player } from "../Objects/Player";
import { SERVER_MESSAGE_TYPES } from "../utils/types";

export class IWBRoom extends Room<IWBRoomState> {

    async onAuth(client: Client, options: any, req: any) {
        return true
        // return await this.doLogin(client, options, req)   
    }

    onCreate(options: any) {
        this.setState(new IWBRoomState());
        this.state.world = options.world

        iwbItemHandler(this)
        iwbSceneActionHandler(this)

        // this.state.messageHandler = new RoomMessageHandler(this)
        // this.state.sceneManager = new RoomSceneManager(this, options.world)

        // createCustomObjects(this)
    }

    onJoin(client: Client, options: any) {
        try {
            client.userData = options.userData;
            client.userData.ip = client.auth.ip

            delete client.userData.avatar
            client.userData.roomId = this.roomId

            this.getPlayerInfo(client, options)




            createTestScene(this)
        } catch (e) {
            console.log('on join error', e)
        }
    }

    async onLeave(client: Client, consented: boolean) {
        let player:Player = this.state.players.get(client.userData.userId)
        if(player){
            this.state.players.delete(client.userData.userId)

        //     this.state.messageHandler.sceneHandler.checkAssetsForEditByPlayer(client.userData.userid)
            
        //     if(!player.pendingDeployment){}
        //     else{
        //         player.cancelPendingDeployment()
        //     }

        //   setTimeout(()=>{
            // playerManager.removePlayer(player.dclData.userId)
            // playerManager.savePlayerCache(player)
        //     this.broadcast(SERVER_MESSAGE_TYPES.PLAYER_LEAVE, {player: client.userData.userId})
        //   }, 1000 * 5)
        }
    }

    onDispose() {
        console.log("room", this.roomId, "disposing...");
        // iwbManager.removeRoom(this)
        // this.state.sceneManager.saveRealmScenes()
        // destroyCustomObjects(this)
    }

    async getPlayerInfo(client: Client, options: any) {
        client.send(SERVER_MESSAGE_TYPES.INIT, {
            catalog: [],//itemManager.items,
            realmAssets: [],//this.state.realmAssets,
            styles: [],//iwbManager.styles,
            worlds: [],//iwbManager.worlds,
            iwb: {v:0, updates:[]},// {v: iwbManager.version, updates:iwbManager.versionUpdates},
            tutorials: {
                videos: [], //iwbManager.tutorials,
                cid: "" //iwbManager.tutorialsCID
            }
        })

        let player = new Player(this, client)
        this.state.players.set(options.userData.userId, player)
        // playerManager.addPlayerToWorld(player)

        // pushPlayfabEvent(
        //     SERVER_MESSAGE_TYPES.PLAYER_JOINED, 
        //     player, 
        //     [{world:options.world}]
        // )
    }

    // async doLogin(client: any, options: any, request: any) {
    //     // console.log('login options', options)
    //     return new Promise((resolve) => {
    //         setTimeout(async() => {
    //             // console.log('Timeout finished!');
    //             let info:any = false
    //             try {

    //                 const ipAddress = request.headers['x-forwarded-for'] || request.socket.address().address;
    //                 // console.log(`Client IP address: ${ipAddress}`);
    //                 const playfabInfo = await playerLogin(
    //                     {
    //                         CreateAccount: true,
    //                         ServerCustomId: options.userData.userId,
    //                         InfoRequestParameters: {
    //                             "UserDataKeys": [], "UserReadOnlyDataKeys": [],
    //                             "GetUserReadOnlyData": true,
    //                             "GetUserInventory": false,
    //                             "GetUserVirtualCurrency": false,
    //                             "GetPlayerStatistics": true,
    //                             "GetCharacterInventories": false,
    //                             "GetCharacterList": false,
    //                             "GetPlayerProfile": true,
    //                             "GetTitleData": false,
    //                             "GetUserAccountInfo": true,
    //                             "GetUserData": true,
    //                         },
    //                         CustomTags: {
    //                             ipAddress: ipAddress
    //                         }
    //                     })
        
    //                 if (playfabInfo.error) {
    //                  //    console.log('playfab login error => ', playfabInfo.error)
    //                 } else {
    //                    //  console.log('playfab login success')
    //                     client.auth = {}
    //                     client.auth.playfab = playfabInfo
    //                     client.auth.ip = ipAddress
    //                     // console.log('playfab info', playfabInfo)
        
    //                     if (playfabInfo.NewlyCreated) {
    //                         let [data, stats] = await this.initializeServerPlayerData(options, client.auth)
    //                         client.auth.playfab.InfoResultPayload.PlayerStatistics = stats
    //                         client.auth.playfab.InfoResultPayload.UserData = data
    //                         info = client.auth
    //                     } else {
    //                         //to do
    //                         // we have no stats yet
    //                         //   let stats = await this.checkInitStats(client.auth)
    //                         //   client.auth.InfoResultPayload.PlayerStatistics = stats
    //                         info = client.auth
    //                     }
    //                 }
    //             } catch (e) {
    //                 console.log('playfab connection error', e)
    //             }
    //             resolve(info); // Resolve the Promise with the data
    //           }, 2000); // Adjust the timeout duration as needed
    //         });
    // }

    // async initializeServerPlayerData(options: any, auth: any) {

    //     // console.log('options are', options)
    //     options.userData.name.replace(" ", "_").trim()

    //     //set new user display name
    //     const result = await updatePlayerDisplayName({
    //         DisplayName: options.userData.name === "Guest" ? 
    //         options.userData.name + options.userData.userId.substring(options.userData.userId.length - 5) : 
    //         options.userData.name,
            
    //         PlayFabId: auth.playfab.PlayFabId
    //     })
    //    //  console.log('setting player name res is', result)

    //     let def: any = {}
    //     def.address = options.userData.userId
    //     def.web3 = !options.userData.isGuest

    //     //set initial player data
    //     const initPlayerDataRes = await updatePlayerInternalData({
    //         Data: def,
    //         PlayFabId: auth.playfab.PlayFabId
    //     })
    //     // console.log('setting eth address result', initPlayerDataRes)

    //     let stats: any[] = []
    //     //we have no stats for now
    //     // initManager.pDefaultStats.forEach((stat,key)=>{
    //     //   stats.push({StatisticName:stat.StatisticName, Value:stat.Value})
    //     // })

    //     let data:any = {
    //       Settings:{
    //         Value:JSON.stringify(iwbManager.defaultPlayerSettings)
    //       },
    //       Assets:{
    //         Value:JSON.stringify([])
    //       },
    //       Scenes:{
    //         Value:JSON.stringify([])
    //       }
    //     }

    //     return [data, stats]
    // }
}

function createTestScene(room:IWBRoom){
    let scene = new Scene(testData[0])
    room.state.scenes.set(testData[0].id, scene)
}
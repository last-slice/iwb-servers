import {Client, Room, ServerError} from "@colyseus/core";
import {IWBRoomState} from "./IWBRoomState";
import { Scene, initServerAssets, initServerScenes, loadRealmScenes, saveRealm } from "../Objects/Scene";
import { testData } from "../tests/data";
import { iwbSceneActionHandler } from "./messaging/ActionHandler";
import { Player } from "../Objects/Player";
import { SERVER_MESSAGE_TYPES } from "../utils/types";
import { iwbRewardHandler } from "./messaging/RewardHandler";
import { addPlayerToWorld, iwbPlayerHandler, removePlayer, savePlayerCache } from "./messaging/PlayerHandler";
import { itemManager, iwbManager } from "../app.config";
import { playerLogin, PLAYFAB_DATA_ACCOUNT, pushPlayfabEvent, updatePlayerDisplayName, updatePlayerInternalData } from "../utils/Playfab";
import { refreshLeaderboards } from "../Objects/Leaderboard";

export class IWBRoom extends Room<IWBRoomState> {

    public leaderboardRefreshInterval:any
    public leaderboardRefreshTime:number = 25

    async onAuth(client: Client, options: any, req: any) {
        if(this.isBanned(options.userData.userId)){
            console.log('user is banned')
            throw new ServerError(400, "user is banned");
        }

        try{
            return await this.doLogin(client, options, req) 
        }
        catch(e){
            console.log('authentication error', e)
            return false
        }
    }

    onCreate(options: any) {
        // console.log('on create options are ', options)
        this.setState(new IWBRoomState());
        this.state.world = options.world

        if(options.island === "client"){
            if(!options.world){
                this.state.gcWorld = true
            }
        }else{
            if(options.island !== "world"){
                this.state.gcWorld = true
            }
        }

        // options.island !== "world" ? this.state.gcWorld = true : null
        this.state.options = options

        let worldConfig = iwbManager.worlds.find(($:any) => $.ens === options.world)
        if(worldConfig){
            this.state.cv = worldConfig.cv
            this.state.owner = worldConfig.owner
        }

        this.clock.start()
        this.leaderboardRefreshInterval = this.clock.setInterval(() => {
            console.log('checking world leaderboards')
            refreshLeaderboards(this)
        }, 1000 * this.leaderboardRefreshTime);
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

        removePlayer(player.dclData.userId)
        savePlayerCache(player)
        
          setTimeout(()=>{
           
            this.broadcast(SERVER_MESSAGE_TYPES.PLAYER_LEAVE, {player: client.userData.userId})
          }, 1000 * 5)
        }
    }

    async onDispose() {
        console.log("room", this.roomId, "disposing...");
        this.clock.clear()

       if(iwbManager.rooms.find(($:any)=> $.roomId === this.roomId)){
        console.log('room is online, clean up', this.state.world)
        if(!this.state.gcWorld){
            await saveRealm(this)
        }

        iwbManager.removeRoom(this)

        iwbManager.garbageCollectRoom(this)
       }
    }

    isBanned(user:string){
        return iwbManager.worlds.find($=> $.ens === this.state.world && $.bans.includes(user.toLowerCase()))
    }

    async getPlayerInfo(client: Client, options: any) {
        let player = new Player(this, client)
        this.state.players.set(options.userData.userId, player)
        addPlayerToWorld(player)

        await iwbManager.processPendingRoom(this, player)
        console.log('process pending room completed')

        pushPlayfabEvent(
            SERVER_MESSAGE_TYPES.PLAYER_JOINED, 
            player, 
            [{world:options.world, island:options.island}]
        )
    }

    async doLogin(client: any, options: any, request: any) {
        // console.log('login options', options)
        return new Promise((resolve, reject) => {
            setTimeout(async() => {
                // console.log('Timeout finished!');

                const ipAddress = request.headers['x-forwarded-for'] || request.socket.address().address;

                if(!await optionsValidated(options)){
                    console.log('rejected validation', options)
                    reject(options)

                    pushPlayfabEvent(
                        SERVER_MESSAGE_TYPES.PLAYER_JOINED, 
                        PLAYFAB_DATA_ACCOUNT, 
                        [{world:options.world, ip:ipAddress, island:options.island, potentialBot:true}]
                    )

                    return false
                }

                console.log('we are logged in')

                let info:any = false
                try {

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
                        console.log('playfab login error => ', playfabInfo.error)
                        reject(options)
                        return false
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
                    resolve(info); // Resolve the Promise with the data
                } catch (e) {
                    console.log('playfab connection error', e)
                    reject(info)
                }
                
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
                DisplayName: options.userData.name === "Guest" || options.userData.name === "" ? 
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

function optionsValidated(options:any){
    console.log("validation options", options)
    if(!options || 
        !options.world ||
        !options.userData || 
        !options.userData.userId //|| 
        // !options.userData.name //|| 
        // options.userData.name === ""
    ){
        return false
    }
    return true
}
import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { COMPONENT_TYPES, PLAYER_GAME_STATUSES, SCENE_MODES, SERVER_MESSAGE_TYPES, VIEW_MODES } from "../utils/types";
import { IWBRoom } from "../rooms/IWBRoom";
import { Client } from "colyseus";
import { abortFileUploads, fetchPlayfabFile, fetchPlayfabMetadata, fetchUserMetaData, finalizeUploadFiles, initializeUploadPlayerFiles, pushPlayfabEvent, updatePlayerData, uploadPlayerFiles } from "../utils/Playfab";
import { itemManager, iwbManager } from "../app.config";
import axios from "axios";
import { Scene } from "./Scene";
import { IWBComponent } from "./IWB";
import { removeStalePlayer } from "./Game";
import { Vector3 } from "./Transform";
import { garbageCollectPlaylist } from "./Playlist";

export class PlayerManager {
    
  players:Map<string,Player> = new Map()

  addPlayerToWorld(player:Player){
      if(!this.players.has(player.dclData.userId)){
          this.players.set(player.dclData.userId, player)
      }
  }

  addPlayerToPrivateWorld(player:Player, client:Client, world:any){
      player.client = client
      player.world = world
      player.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_JOINED_USER_WORLD, world)
  }   

  removePlayer(user:string){
      this.players.delete(user)
  }

  savePlayerCache(player:Player){
      player.saveCache()
  }

  isInPrivateWorld(player:Player){
      return this.players.has(player.dclData.userId) && this.players.get(player.dclData.userId).world !== "main"
  }
}

export class SelectedAsset extends Schema {
  @type("string") sceneId: string
  @type("string") catalogId: string
  @type("string") assetId: string
  @type("boolean") catalogAsset:boolean = false
  @type("string") type:string
  @type(IWBComponent) iwbData:IWBComponent
  @type("boolean") grabbed:boolean
  @type("boolean") ugc:boolean
  @type({map:Vector3}) childTransform:MapSchema

  constructor(info:any){
    super()
    this.iwbData = new IWBComponent(info.componentData)
    this.catalogId = info.catalogId
    this.assetId = info.assetId
    this.catalogAsset = info.isCatalogSelect
    this.grabbed = info.grabbed ? info.grabbed : undefined
    this.ugc = this.iwbData.ugc

    if(info.childTransform){
      this.childTransform = new MapSchema()
      for(let aid in info.childTransform){
        this.childTransform.set(aid, info.childTransform[aid])
      }
    }
  }
}



export class Player extends Schema {
    @type("string") userId:string;
    @type("string") address:string
    @type("string") name:string 
    @type("string") gameId:string = ""
    @type("string") gameStatus:string = PLAYER_GAME_STATUSES.NONE

    @type(SelectedAsset) selectedAsset: SelectedAsset
    

    gameData:any

    playFabData:any
    ip:string

    room:IWBRoom
    roomId:string
    client:Client
    world:string = "main"

    playtime:number = 0
    updateTimer:any
    modified = false

    settings:any

    stats = new MapSchema<number>()
    catalog:Map<string,any> = new Map()
    pendingAssets:any[] = []
    pendingDeployment:any = false
    startTime:any

    claimingReward = false

    dclData:any
    mode:SCENE_MODES
    viewMode:VIEW_MODES = VIEW_MODES.AVATAR
    scenes:Scene[] = []
    worlds:any[] = []
    buildingAllowed:boolean = false
    previousParcel:string
    currentParcel:string
    uploadToken:string
    version:number
    activeScene: Scene | null
    activeSceneId:string = ""
    canBuild:boolean = false
    homeWorld:boolean = false
    worldPermissions:boolean = false
    objects:any[]
    selectedEntity:any
    cameraParent:any
    uploads:any[] = []
    landsAvailable:any[] = []
    worldsAvailable:any[] = []
    deploymentLink:string
    rotation:number
    parent:any
    parentEntity:any
    canTeleport:any


    //game objects
    canAttack:boolean
    hasWeaponEquipped:boolean
    inCooldown:boolean
    weapon:any
    hitBox:any
    gameVariables:Map<string, any> = new Map()


    //quest objects
    questClients:any

    constructor(room:IWBRoom, client:Client){
        super()
        this.room = room
        this.client = client

        this.userId = client.userData.userId
    
        this.playFabData = client.auth.playfab
        this.dclData = client.userData
        this.address = client.userData.userId
        this.name = client.userData.name
        this.ip = client.userData.ip
    
        this.mode = SCENE_MODES.PLAYMODE
    
        this.startTime = Math.floor(Date.now()/1000)

        this.setSettings(this.playFabData.InfoResultPayload.UserData)
        this.loadGameVariables()
      }

      addSelectedAsset(info:any){
        console.log('player selected asset', info)
        this.selectedAsset = new SelectedAsset(info)
        this.selectedAsset.sceneId = info.sceneId
      }
    
      removeSelectedAsset(){
        this.selectedAsset = null
      }

      getPlayerData(){
        return this.canBuild
      }

      sendPlayerMessage(type:SERVER_MESSAGE_TYPES, data:any){
        this.client.send(type, data)
      }

      async uploadAsset(asset:any, notify?:boolean){
        //  console.log('asset to save is', asset)
     
         //to do
         //check if already upload and wait before uploading another to the file
     
         let filename = "catalogs.json"
         let catalog:any[] = []
     
         asset.on = this.dclData.name
         asset.pending = true
         asset.ugc = true
     
         try{
           let metadata = await fetchUserMetaData(this.playFabData)
           if(metadata !== null){
             catalog = await fetchPlayfabFile(metadata, filename)
           }
     
           catalog.push(asset)
     
           await itemManager.uploadFile(this.address, "catalogs.json", catalog)
     
           if(notify){
             this.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, asset)
           }
         }
         catch(e){
           console.log('there was an error saving the uploaded asset', e) 
         }
       }

       async saveCache(){
        await this.recordPlayerTime()
        await this.saveToDB()
        await this.saveGameData()
      }

      async saveGameData(){
        let gameData:any[] = []

        try{
          this.gameVariables.forEach((gameInfo:any)=>{
            gameData.push(gameInfo)
          })

          console.log("game data is", gameData)

          if(gameData.length > 0){
            let initres = await initializeUploadPlayerFiles(this.playFabData.EntityToken.EntityToken,{
                        Entity: {Id: this.playFabData.EntityToken.Entity.Id, Type: this.playFabData.EntityToken.Entity.Type},
                        FileNames:['gamedata.json']
                      })

            await uploadPlayerFiles(initres.UploadDetails[0].UploadUrl, JSON.stringify(gameData))
            await finalizeUploadFiles(this.playFabData.EntityToken.EntityToken,
                {
                    Entity: {Id: this.playFabData.EntityToken.Entity.Id, Type: this.playFabData.EntityToken.Entity.Type},
                    FileNames:['gamedata.json'],
                    ProfileVersion:initres.ProfileVersion,
            })
          }
        }
        catch(e:any){
            console.log('backup file error', e.message)
            if(gameData.length > 0){
              await abortFileUploads(this.playFabData.EntityToken.EntityToken,{
                Entity: {Id: this.playFabData.EntityToken.Entity.Id, Type: this.playFabData.EntityToken.Entity.Type},
                FileNames:['gamedata.json'],
              })
            }
        }
      }

      async recordPlayerTime(){
        let now = Math.floor(Date.now()/1000)
        let time = now - this.startTime
    
        pushPlayfabEvent(
          SERVER_MESSAGE_TYPES.PLAYTIME, 
          this, 
          [{playtime: time}]
      )
    
        // this.increaseValueInMap(this.stats, 'pt', now-this.playtime)
    
        //to do
        //log player play time to playfab
    
        // initManager.pushEvent({
        //   EventName: 'PLAYTIME',
        //   PlayFabId: this.playFabData.PlayFabId,
        //   Body:{
        //     'type': 'PLAYTIME',
        //     'time': now - this.playtime,
        //     'player':this.dclData.name,
        //     'ethaddress':this.dclData.userId
        //   }
        // })
      }

      async saveToDB(){
        // console.log('saving player updates to db', this.dclData.userId)

        await this.saveSetttingsDB()

        
        // let stats:any = []
        // this.stats.forEach((stat,key)=>{
        //   stats.push({StatisticName:initManager.pDefaultStats.filter((stat)=> stat.pKey === key)[0].StatisticName, Value:stat})
        // })
    
        // try{
        //   // const chunkSize = 10;
        //   // const chunks = [];
        //   // for (let i = 0; i < stats.length; i += chunkSize) {
        //   //   chunks.push(stats.slice(i, i + chunkSize));
        //   // }
      
        //   // chunks.forEach(async (chunk) => {
        //   //   await updatePlayerStatistic({
        //   //     PlayFabId: this.playFabData.PlayFabId,
        //   //     Statistics: chunk
        //   //   })
        //   // });
    
        //   let assets:any[] = []
        //   this.assets.forEach((value,key)=>{
        //     assets.push(value)
        //   })
    
        //   const playerData:any = {
        //     "Settings":JSON.stringify(this.settings),
        //     "Scenes":JSON.stringify(assets)
        //   }
    
        //   console.log('player data to save is' ,playerData)
      
        //   await updatePlayerData({
        //     PlayFabId: this.playFabData.PlayFabId,
        //     Data: playerData
        //   })
        // }
        // catch(e){
        //   console.log('saving player info to db error ->', e)
        // }
      }

      async saveSetttingsDB(){
        //  console.log('saving player settings to db', this.dclData.userId)
         console.log('server settings are ', this.settings)
         
         this.settings.firstTime = false
         let res = await updatePlayerData({
           PlayFabId: this.playFabData.PlayFabId,
           Data:{
             'Settings':JSON.stringify(this.settings)
           }
         })
         // console.log('update data res is', res)
       }
       
       updatePlayMode(mode:SCENE_MODES){
        this.mode = mode
        if(this.mode === SCENE_MODES.BUILD_MODE){
          garbageCollectPlaylist(this.room)
        }
      }

      async cancelPendingDeployment(){
        try{
            const result = await axios.post("https://deployment.dcl-iwb.co/scene/deployment/cancel", { user:this.address, auth: this.pendingDeployment},
            // {headers: {
            //   'Authorization': `Bearer ${value2}`,
            // }},
            );
            // console.log('validation data', result.data)
          }
          catch(e){
            console.log('error validating deployment')
          }
      }

      async setSettings(server:any){
        // console.log('setting player settings')
        if(!server.hasOwnProperty("Settings")){
         //  console.log('player doesnt have settings, need to initiliaze')
          this.settings = iwbManager.defaultPlayerSettings
          await this.saveSetttingsDB()
        }
        else{
            let settings = JSON.parse(server.Settings.Value)
            this.settings = settings
    
            if(this.settings.length === 0){
              console.log('settings are empty, add some')
              this.settings = iwbManager.defaultPlayerSettings
            }
    
           //  console.log('player settings are ', this.settings)
        }
      }

      startGame(sceneId:any, game:any, status:PLAYER_GAME_STATUSES, level?:any){
        this.gameStatus = status
        // this.playingGame = true
        this.gameData = {...game, ...{level:level}, ...{sceneId:sceneId}}
        this.gameId = sceneId

        let gameVariables:any
        gameVariables = this.gameVariables.get(game.aid)
        if(!gameVariables){
          gameVariables = [{lastPlayed: Math.floor(Date.now()/1000)}]
          this.gameVariables.set(game.aid, gameVariables)
        }
         gameVariables = [{lastPlayed: Math.floor(Date.now()/1000)}]
        
      }

      endGame(room?:IWBRoom){
        this.gameStatus = PLAYER_GAME_STATUSES.NONE
        // this.playingGame = false
        // console.log('player game data', this.gameData)

        if(this.gameData.type === "MULTIPLAYER"){
          removeStalePlayer(room, this)
        }
      }

      endGames(room?:IWBRoom){
        // if(this.playingGame){
        //   this.endGame(room)
        // }
        if(this.gameStatus !== PLAYER_GAME_STATUSES.NONE){
          this.endGame(room)
        }
      }

      inHomeWorld(roomWorld:string){
        let world = iwbManager.worlds.find((w) => w.ens === roomWorld)
        if(!world){
            return false
        }

        if(world.owner === this.address){
          return true
        }
        return false
      }

      async loadGameVariables(){
        try{
          let metadata = await fetchUserMetaData(this.playFabData)
          let gamedata = await fetchPlayfabFile(metadata, "gamedata.json")
          if(gamedata && gamedata.length > 0){
            gamedata.forEach((game:any)=>{
              this.gameData.set(game.id, game)
            })
          }
        }
        catch(e){
          console.log('error getting load game variables', e)
        }
      }
}
import {MapSchema, Schema, type} from "@colyseus/schema";
import {IWBRoom} from "../rooms/IWBRoom";
import {Client} from "@colyseus/core";
import {SCENE_MODES, SERVER_MESSAGE_TYPES} from "../utils/types";
import {abortFileUploads, fetchPlayfabFile, fetchPlayfabMetadata, fetchUserMetaData, finalizeUploadFiles, initializeUploadPlayerFiles, playfabLogin, updatePlayerData, uploadPlayerFiles} from "../utils/Playfab";
import {Scene, SceneItem} from "./Scene";
import { generateId } from "colyseus";
import { ImageComponent, MaterialComponent, NFTComponent } from "./Components";
import { itemManager, iwbManager } from "../app.config";
import axios from "axios";

export class SelectedAsset extends Schema {
  @type("string") catalogId: string
  @type("string") assetId: string
  @type("boolean") catalogAsset:boolean = false
  @type(SceneItem) componentData:SceneItem

  constructor(info:any){
    super()
    this.componentData = info.componentData
    this.catalogId = info.catalogId
    this.assetId = info.assetId
    this.catalogAsset = info.catalogAsset
  }
}

export class Player extends Schema {
  @type("string") id:string;
  @type("string") address:string
  @type("string") name:string 
  @type(SelectedAsset) selectedAsset: SelectedAsset

  playFabData:any
  dclData:any

  room:IWBRoom
  roomId:string
  client:Client
  world:string = "main"

  playtime:number = 0
  updateTimer:any
  modified = false

  mode:SCENE_MODES


  stats = new MapSchema<number>()
  settings: Map<string,any> = new Map()
  // assets: Map<string,SceneItem> = new Map()
  catalog:Map<string,any> = new Map()
  pendingAssets:any[] = []
  pendingDeployment:any = false

  constructor(room:IWBRoom, client:Client){
    super()
    this.room = room
    this.client = client

    this.playFabData = client.auth.playfab
    this.dclData = client.userData
    this.address = client.userData.userId
    this.name = client.userData.displayName

    this.mode = SCENE_MODES.PLAYMODE
  }

  // setScenes(){
  //   let data = this.playFabData.InfoResultPayload.UserData
  //   console.log('player setting scenes', data)

  //   //hard coded test data
  //   let sceneIds = ["2831","2832","2833"]
  //   ////

    
  //   if(data.hasOwnProperty("Scenes")){
  //     sceneIds = JSON.parse(data.Scenes.Value)
  //   }

  //   let scenes = sceneManager.scenes.filter((element) => sceneIds.includes(element.id))
  //   console.log('any scenes are a', scenes)
  //   scenes.forEach((scene)=>{
  //     // this.scenes.set(scene.id, scene)
  //   })

  //   if(scenes.length > 0){
  //     console.log('player scenes greater than 0')
  //     this.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_SCENES_CATALOG, {scenes:scenes, user:this.dclData.userId})
  //   }
  // }

  updatePlayMode(mode:SCENE_MODES){
    this.mode = mode
  }

  sendPlayerMessage(type:string, data:any){
    // console.log('sending playing message', type,data)
    this.client.send(type,data)
  }

  addSelectedAsset(info:any){
    this.selectedAsset = new SelectedAsset(info)
  }

  removeSelectedAsset(){
    this.selectedAsset = null
  }

  setStats(stats:any[]){
    console.log('player stats are ', stats)
    try{
     if(stats.length == 0){
       console.log('need to initialize stats')
       // updatePlayerStatistic({
       //   PlayFabId: this.playFabData.PlayFabId,
       //   Statistics:initManager.pDefaultStats
       // })
 
      //  stats = initManager.pDefaultStats
      //  this.playFabData.InfoResultPayload.PlayerStatistics = initManager.pDefaultStats
     }
 
    //  initManager.pDefaultStats.forEach((d:any)=>{
    //   // if(stats.filter((stat)=> stat.StatisticName === d.StatisticName).length > 0){
    //      this.stats.set(d.pKey, stats.filter((stat)=> stat.StatisticName === d.StatisticName)[0].Value)
    //   // }
    //  })
    }
    catch(e){
     console.log('error setting player stats', this.dclData.displayName)
    }
     
   }

  increaseValueInMap(map:any, key:any, incrementAmount:number) {
    if (map.has(key)) {
      const currentValue = map.get(key);
      const newValue = currentValue + incrementAmount;
      map.set(key, newValue);
    } else {
    }
  }

  async uploadAsset(asset:any, notify?:boolean){
    console.log('asset to save is', asset)

    //to do
    //check if already upload and wait before uploading another to the file

    let filename = "catalogs.json"
    let catalog:any[] = []

    asset.on = this.dclData.displayName
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
    // await this.recordPlayerTime()
    // await this.saveToDB()
  }

  async recordPlayerTime(){
    let now = Math.floor(Date.now()/1000)

    // this.increaseValueInMap(this.stats, 'pt', now-this.playtime)

    //to do
    //log player play time to playfab

    // initManager.pushEvent({
    //   EventName: 'PLAYTIME',
    //   PlayFabId: this.playFabData.PlayFabId,
    //   Body:{
    //     'type': 'PLAYTIME',
    //     'time': now - this.playtime,
    //     'player':this.dclData.displayName,
    //     'ethaddress':this.dclData.userId
    //   }
    // })
  }

  async saveToDB(){
    console.log('saving player updates to db', this.dclData.userId)
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

  async cancelPendingDeployment(){
    try{
        const result = await axios.post("http://localhost:3525/scene/deployment/cancel", { user:this.address, auth: this.pendingDeployment},
        // {headers: {
        //   'Authorization': `Bearer ${value2}`,
        // }},
        );
        console.log('validation data', result.data)
      }
      catch(e){
        console.log('error validating deployment')
      }
}

}
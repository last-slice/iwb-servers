import {MapSchema, Schema, type} from "@colyseus/schema";
import {IWBRoom} from "../rooms/IWBRoom";
import {Client} from "@colyseus/core";
import {SCENE_MODES, SERVER_MESSAGE_TYPES} from "../utils/types";
import {abortFileUploads, fetchPlayfabFile, fetchPlayfabMetadata, fetchUserMetaData, finalizeUploadFiles, initializeUploadPlayerFiles, playfabLogin, setTitleData, updatePlayerData, uploadPlayerFiles} from "../utils/Playfab";
import {Scene, SceneItem} from "./Scene";
import { generateId } from "colyseus";
import { ImageComponent, MaterialComponent, NFTComponent } from "./Components";
import { itemManager, iwbManager } from "../app.config";
import axios from "axios";
import { pushPlayfabEvent } from "./PlayfabEvents";

export class SelectedAsset extends Schema {
  @type("string") catalogId: string
  @type("string") assetId: string
  @type("boolean") catalogAsset:boolean = false
  @type(SceneItem) componentData:SceneItem
  @type("boolean") grabbed:boolean

  constructor(info:any){
    super()
    this.componentData = info.componentData
    this.catalogId = info.catalogId
    this.assetId = info.assetId
    this.catalogAsset = info.catalogAsset
    this.grabbed = info.grabbed ? info.grabbed : undefined
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

  settings:any

  stats = new MapSchema<number>()
  catalog:Map<string,any> = new Map()
  pendingAssets:any[] = []
  pendingDeployment:any = false
  startTime:any

  constructor(room:IWBRoom, client:Client){
    super()
    this.room = room
    this.client = client

    this.playFabData = client.auth.playfab
    this.dclData = client.userData
    this.address = client.userData.userId
    this.name = client.userData.name

    this.mode = SCENE_MODES.PLAYMODE

    this.startTime = Math.floor(Date.now()/1000)

 //    console.log('playfab settings', this.playFabData)
    this.setSettings(this.playFabData.InfoResultPayload.UserData)
  }

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
    // console.log('player stats are ', stats)
    try{
     if(stats.length == 0){
      //  console.log('need to initialize stats')
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
     console.log('error setting player stats', this.dclData.name)
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
    // console.log('server settings are ', this.settings)
    let res = await updatePlayerData({
      PlayFabId: this.playFabData.PlayFabId,
      Data:{
        'Settings':JSON.stringify(this.settings)
      }
    })
    // console.log('update data res is', res)
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

    this.client.send(SERVER_MESSAGE_TYPES.PLAYER_SETTINGS, {action:"load", value:this.settings})
  }

}
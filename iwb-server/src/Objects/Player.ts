import {MapSchema, Schema, type} from "@colyseus/schema";
import {IWBRoom} from "../rooms/IWBRoom";
import {Client} from "@colyseus/core";
import {SCENE_MODES, SERVER_MESSAGE_TYPES, SceneData} from "../utils/types";
import {updatePlayerData} from "../utils/Playfab";
import {Scene} from "./Scene";
import { sceneManager } from "../app.config";
import { generateId } from "colyseus";
import { UserRoom } from "../rooms/UserRoom";

export class Player extends Schema {
  @type("string") id:string;
  @type("string") address:string
  @type("string") name:string

  @type({ map: Scene })
  scenes: Map<string,Scene> = new Map()

  playFabData:any
  dclData:any

  room:IWBRoom | UserRoom
  roomId:string
  client:Client
  world:string = "main"

  playtime:number = 0
  updateTimer:any
  modified = false

  mode:SCENE_MODES


  stats = new MapSchema<number>()
  settings: Map<string,any> = new Map()
  assets: Map<string,any> = new Map()

  constructor(room:IWBRoom, client:Client){
    super()
    // this.room = room
    this.client = client

    this.playFabData = client.auth.playfab
    // console.log('playfab data is', this.playFabData)
    this.dclData = client.userData

    this.mode = SCENE_MODES.PLAYMODE

    this.setAssets(this.playFabData.InfoResultPayload.UserData)
    // this.setScenes(this.playFabData.InfoResultPayload.UserData)
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

  setAssets(data:any){
    if(data.hasOwnProperty("Assets")){
      let assets = JSON.parse(data.Assets.Value)
      assets.forEach((asset:any)=>{
        this.assets.set(asset.id, asset)
      })
      if(assets.length > 0){
        this.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_ASSET_CATALOG, assets)
      }
    }
  }

  updatePlayMode(mode:SCENE_MODES){
    this.mode = mode
  }

  sendPlayerMessage(type:string, data:any){
    // console.log('sending playing message', type,data)
    this.client.send(type,data)
  }

  createScene(info:any, parcels:string[]){
    let sceneData:SceneData = {
      id: "" + generateId(5),
      n: info.name,
      d: info.desc,
      o: this.dclData.userId,
      ona: this.dclData.displayName,
      bps:[],
      cat:"",
      rat:[],
      rev:[],
      ass:[],
      pcls:parcels,
      bpcl: parcels[0],
      cd: Math.floor(Date.now()/1000),
      upd: Math.floor(Date.now()/1000),
      si: parcels.length > 20 ? 300 : parcels.length * 15,
      toc:0,
      pc: 0,
      pcnt: parcels.length,
      sp:["0,0"],
      isdl: false,
      e:true
    }
    console.log('creating new scene with data', sceneData)
    let scene = new Scene(sceneData)
    this.scenes.set(scene.id, scene)
    return scene
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

  uploadAsset(asset:any, notify?:boolean){
    this.assets.set(asset.id, asset)

    console.log('asset to save is', asset)
    this.saveToDB()

    if(notify){
      this.sendPlayerMessage(SERVER_MESSAGE_TYPES.PLAYER_ASSET_UPLOADED, asset)
    }
  }

  async saveCache(){
    await this.recordPlayerTime()
    await this.saveToDB()
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

    try{
      // const chunkSize = 10;
      // const chunks = [];
      // for (let i = 0; i < stats.length; i += chunkSize) {
      //   chunks.push(stats.slice(i, i + chunkSize));
      // }
  
      // chunks.forEach(async (chunk) => {
      //   await updatePlayerStatistic({
      //     PlayFabId: this.playFabData.PlayFabId,
      //     Statistics: chunk
      //   })
      // });

      let assets:any[] = []
      this.assets.forEach((value,key)=>{
        assets.push(value)
      })

      const playerData:any = {
        "Settings":JSON.stringify(this.settings),
        "Assets":JSON.stringify(assets),
        "Scenes":JSON.stringify(this.scenes),
      }

      console.log('player data to save is' ,playerData)
  
      await updatePlayerData({
        PlayFabId: this.playFabData.PlayFabId,
        Data: playerData
      })
    }
    catch(e){
      console.log('saving player info to db error ->', e)
    }
  }

}
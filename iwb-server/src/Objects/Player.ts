import { Schema, Context,MapSchema,ArraySchema, type } from "@colyseus/schema";
import { IWBRoom } from "../rooms/IWBRoom";
import { Room, Client } from "@colyseus/core";
import { SCENE_MODES, SERVER_MESSAGE_TYPES } from "../utils/types";
import { updatePlayerData, updatePlayerStatistic } from "../utils/Playfab";

export class Player extends Schema {
  @type("string") id:string;
  @type("string") address:string
  @type("string") name:string 

  playFabData:any
  dclData:any

  room:IWBRoom
  roomId:string
  client:Client

  playtime:number = 0
  updateTimer:any
  modified = false

  mode:SCENE_MODES

  temporaryParcels:any[] = []

  stats = new MapSchema<number>()
  settings: Map<string,any> = new Map()
  scenes: Map<string,any> = new Map()
  assets: Map<string,any> = new Map()

  constructor(room:IWBRoom, client:Client){
    super()
    this.room = room
    this.client = client

    this.playFabData = client.auth.playfab
    console.log('playfab data is', this.playFabData)
    this.dclData = client.userData

    this.mode = SCENE_MODES.PLAYMODE

    this.setAssets(this.playFabData.InfoResultPayload.UserData)
  }

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

  removeTemporaryParcel(parcel:any){
    let index = this.temporaryParcels.findIndex((p)=> p === parcel)
    console.log('temp parcel index is', index)
    if(index >= 0){
      this.temporaryParcels.splice(index,1)
    }
    console.log('player tmep parcels', this.temporaryParcels)
  }

  addParcelToScene(parcel:any){
    this.temporaryParcels.push(parcel)
  }

  hasTemporaryParcel(parcel:any){
    return this.temporaryParcels.find((p)=> p === parcel)
  }

  sendPlayerMessage(type:string, data:any){
    console.log('sending playing message', type,data)
    this.client.send(type,data)
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

    this.increaseValueInMap(this.stats, 'pt', now-this.playtime)

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
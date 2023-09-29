import { Schema, Context,MapSchema,ArraySchema, type } from "@colyseus/schema";
import { IWBRoom } from "../rooms/IWBRoom";
import { Room, Client } from "@colyseus/core";
import { SCENE_MODES } from "../utils/types";

export class Player extends Schema {
  @type("string") id:string;
  @type("string") address:string
  @type("string") name:string 

  playFabData:any

  room:IWBRoom
  roomId:string
  client:Client

  playtime:number = 0
  updateTimer:any
  modified = false

  mode:SCENE_MODES

  temporaryParcels:any[] = []

  constructor(room:IWBRoom, client:Client){
    super()
    this.room = room
    this.client = client

    this.mode = SCENE_MODES.PLAYMODE
  }

  updatePlayMode(mode:SCENE_MODES){
    this.mode = mode
  }

  addParcelToScene(parcel:any){
    this.temporaryParcels.push(parcel)
  }
}
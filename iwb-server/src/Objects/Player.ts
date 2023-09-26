import { Schema, Context,MapSchema,ArraySchema, type } from "@colyseus/schema";
import { IWBRoom } from "../rooms/IWBRoom";
import { Room, Client } from "@colyseus/core";

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

  temporaryParcels:any[] = []

  constructor(room:IWBRoom, client:Client){
    super()
    this.room = room
    this.client = client
  }
}
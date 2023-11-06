import { Schema, Context,MapSchema,ArraySchema, type } from "@colyseus/schema";
import { IWBRoom } from "../rooms/IWBRoom"
import { UserRoom } from "../rooms/UserRoom"

export class Scene extends Schema {
  @type("string") id:string;
  @type("string") n:string
  @type("string") d:string 
  @type("number") pcnt: number
  @type("number") cd: number

  constructor(room:IWBRoom | UserRoom, data:any){
    super()
    this.id = data.id
    this.n = data.n
    this.d = data.d
    this.pcnt = data.pcnt
    this.cd = data.cd
    room.state.scenes.set(this.id, this)
  }

}
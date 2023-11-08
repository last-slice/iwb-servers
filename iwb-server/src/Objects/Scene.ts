import { Schema, Context,MapSchema,ArraySchema, type } from "@colyseus/schema";
import { IWBRoom } from "../rooms/IWBRoom"
import { UserRoom } from "../rooms/UserRoom"

export class Vector3 extends Schema {
  @type("number") x: number
  @type("number") y: number
  @type("number") z: number
}

export class Quaternion extends Schema {
  @type("number") x: number
  @type("number") y: number
  @type("number") z: number
  @type("number") w: number
}

export class SceneItem extends Schema {
  @type("string") id: string
  @type("string") name: string
  @type(Vector3) position: Vector3 = new Vector3()
  @type(Quaternion) rotation: Vector3 = new Vector3()
  @type(Vector3) scale: Vector3 = new Vector3()
}

export class Scene extends Schema {
  @type("string") id:string;
  @type("string") n:string
  @type("string") ona:string
  @type("string") d:string 
  @type("string") o:string
  @type("string") cat:string
  @type("string") bpcl:string

  @type(["string"]) bps:string[]
  @type(["string"]) rat:string[]
  @type(["string"]) rev:string[]
  @type(["string"]) pcls:string[]
  @type(["string"]) sp:string[]
  
  @type("number") si:number
  @type("number") toc:number
  @type("number") pc:number
  @type("number") pcnt: number
  @type("number") cd: number
  @type("number") upd: number

  @type("boolean") isdl:boolean
  @type("boolean") e:boolean

  @type([SceneItem]) ass: SceneItem[] = []

  constructor(data:any){
    super()
    this.id = data.id
    this.n = data.n
    this.d = data.d
    this.pcnt = data.pcnt
    this.cd = data.cd
    this.upd = data.upd
    this.o = data.o
    this.ona = data.ona
    this.cat = data.cat
    this.bpcl = data.bpcl
    this.bps = data.bps
    this.rat = data.rat
    this.rev = data.rev
    this.pcls = data.pcls
    this.sp = data.sp
    this.si = data.si
    this.toc = data.toc
    this.pc = data.pc
    this.isdl = data.isdl
    this.e = data.e
    this.ass = data.ass
  }

}

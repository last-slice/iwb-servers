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
  @type("number") ent: number
  @type('string') aid: string
  @type("string") n: string
  @type(Vector3) p: Vector3 = new Vector3()
  @type(Quaternion) r: Vector3 = new Vector3()
  @type(Vector3) s: Vector3 = new Vector3()
}

export class Scene {

  id:string
  n:string
  d:string
  o:string
  ona:string
  cat:string
  bpcl:string
  bps:string[]
  rat:string[]
  rev:string[]
  pcls:string[]
  sp:string[]
  cd:number
  upd:number
  si:number
  toc:number
  pc:number
  pcnt:number
  isdl:boolean
  e:boolean
  ass:SceneItem[] = []

  constructor(data:any){
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

    data.ass.forEach((asset:any)=>{
      console.log('asset is ', asset)
      let item = new SceneItem()
      item.id = asset.id 
      item.ent = asset.ent
      item.p = new Vector3(asset.p)
      item.r = new Quaternion(asset.r)
      item.s = new Vector3(asset.s)
      item.aid = asset.aid
      this.ass.push(asset)
    })
  }
}

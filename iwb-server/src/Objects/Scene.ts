import { Schema, Context,MapSchema,ArraySchema, type } from "@colyseus/schema";

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

export class TempScene extends Schema{
  @type("string") id:string
  @type("string") n:string
  @type("string") d:string
  @type("string") bpcl:string
  @type([ 'string' ]) pcls = new ArraySchema<string>();
}

export class Scene extends Schema{

  @type("string") id:string
  @type("string") n:string
  @type("string") d:string
  @type("string") o:string
  @type("string") ona:string
  @type("string") cat:string
  @type("string") bpcl:string

  @type([ 'string' ]) bps = new ArraySchema<string>();
  @type([ 'string' ]) rat = new ArraySchema<string>();
  @type([ 'string' ]) rev = new ArraySchema<string>();
  @type([ 'string' ]) pcls = new ArraySchema<string>();
  @type([ 'string' ]) sp = new ArraySchema<string>();
  @type([ SceneItem ]) ass = new ArraySchema<SceneItem>();

  @type("number") cd:number
  @type("number") upd:number
  @type("number") si:number
  @type("number") toc:number
  @type("number") pc:number
  @type("number") pcnt:number

  @type("boolean") isdl:boolean
  @type("boolean") e:boolean


  constructor(data?:any){
    super()
    if(data){
      // console.log('creating new scene', data)
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

      if(data.ass){
        data.ass.forEach((asset:any)=>{
          try{
            // console.log('asset is ', asset)
            let item = new SceneItem()
            item.id = asset.id 
            item.ent = asset.ent
            item.p = new Vector3(asset.p)
            item.r = new Quaternion(asset.r)
            item.s = new Vector3(asset.s)
            item.aid = asset.aid
            this.ass.push(item)
          }catch(e){
            console.log('error loading asset for scene', this.id)
          }
        })
      }
    }
    
  }
}

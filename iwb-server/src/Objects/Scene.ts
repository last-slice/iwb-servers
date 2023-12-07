import { Schema, Context,MapSchema,ArraySchema, type } from "@colyseus/schema";
import { COMPONENT_TYPES } from "../utils/types";

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

export class CollisionComponent extends Schema {
  @type("number") vMask:number = 1
  @type("number") iMask:number = 2
}

export class MaterialComponent extends Schema {
  @type("boolean") shadows:boolean = true
  @type("number") metallic:number = 0
  @type("number") roughness:number = 1
  @type("number") intensity:number = 0
  @type("string") emissPath:string = ""
  @type('number') emissInt:number = 0
  @type("string") textPath:string = ""
  @type(['string']) color:ArraySchema = new ArraySchema<string>()
}

export class VisibilityComponent extends Schema {
  @type("boolean") visible:boolean = true
}

export class ImageComponent extends Schema {
  @type("string") url:string = ""
}

export class VideoComponent extends Schema {
  @type("string") url:string = ""
  @type("number") volume:number = .5
  @type("boolean") autostart:boolean = true  
  @type("boolean") loop:boolean = false
}

export class SceneItem extends Schema {
  @type("string") id: string
  @type("number") ent: number
  @type('string') aid: string
  @type("string") n: string
  @type("string") type:string
  @type(Vector3) p: Vector3 = new Vector3()
  @type(Quaternion) r: Vector3 = new Vector3()
  @type(Vector3) s: Vector3 = new Vector3()
  @type(["string"]) comps:ArraySchema = new ArraySchema<string>()
  @type(VisibilityComponent) visComp:VisibilityComponent
  @type(MaterialComponent) matComp:MaterialComponent
  @type(CollisionComponent) colComp:CollisionComponent
  @type(ImageComponent) imgComp:ImageComponent
  @type(VideoComponent) vidComp:VideoComponent
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
  @type("string") w:string

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
      this.w = data.w

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
            item.type = asset.type


            //add components
            this.addItemComponents(item, asset)

            this.ass.push(item)
          }catch(e){
            console.log('error loading asset for scene', this.id)
          }
        })
      }
    }
  }

  addItemComponents(item:SceneItem, asset:any){
    item.comps = asset.comps

    item.comps.forEach((component:string)=>{
      switch(component){
        case COMPONENT_TYPES.MATERIAL_COMPONENT:
          item.matComp = new MaterialComponent()
          item.matComp.shadows = asset.matComp.shadows
          item.matComp.metallic = asset.matComp.metallic
          item.matComp.roughness = asset.matComp.roughness
          item.matComp.intensity = asset.matComp.intensity
          item.matComp.emissPath = asset.matComp.emissPath
          item.matComp.emissInt = asset.matComp.emissInt
          item.matComp.textPath = asset.matComp.textPath
          item.matComp.color = asset.matComp.color

        break;

        case COMPONENT_TYPES.IMAGE_COMPONENT:
          item.imgComp = new ImageComponent()
          item.imgComp.url = asset.imgComp.url
        break;

        case COMPONENT_TYPES.VISBILITY_COMPONENT:
        item.visComp = new VisibilityComponent()
        item.visComp.visible = asset.visComp.visible
        break;
      }
    })
    // item.colComp = asset.colComp
    // item.vidComp = asset.vidComp
  }
}

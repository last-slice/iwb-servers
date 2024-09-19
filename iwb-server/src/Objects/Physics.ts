import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";
import { Vector3 } from "./Transform";

export class PhysicsContactMaterialsComponent extends Schema{
    @type("number") friction:number = 1
    @type("number") bounce:number = 1
    @type("string") from:string
    @type("string") to:string

    constructor(data?:any){
        super(data)
        if(data){
            this.friction = data.friction
            this.bounce = data.bounce
            this.from = data.from
            this.to = data.to
        }
    }
}

export class PhysicsComponent extends Schema{
    @type("number") type:number = -1 // 0 - config, 1 - body
    @type(["string"]) materials:ArraySchema<string> = new ArraySchema()
    @type({map:PhysicsContactMaterialsComponent}) contactMaterials:MapSchema<PhysicsContactMaterialsComponent> = new MapSchema()

    @type("string") material:string
    @type("number") shape:number = -1 //0 - box, 1 - plane, 2 - sphere
    @type("number") mass:number
    @type("number") linearDamping:number
    @type("number") angularDamping:number
    @type(Vector3) offset:Vector3
    @type(Vector3) size:Vector3
    @type("boolean") fixedRotation:boolean

    cannonBody:any
    cannonMaterials:any
    cannonContactMaterials:any
}

export function createPhysicsComponent(scene:Scene, aid:string, data?:any){
    let component:any = new PhysicsComponent()
    if(data){
        for(let key in data){
            if(key === "materials"){
                component[key] = data[key]
            }else if(key === "contactMaterials"){
                console.log("contact material", key, data[key])
                let contactMaterials = data[key]
                for(let cm in contactMaterials){
                    component.contactMaterials.set(cm, new PhysicsContactMaterialsComponent(contactMaterials[cm]))
                }
            }
            else if(key === "offset" || key === "size"){
                component[key] = new Vector3(data[key])
            }
            else{
                component[key] = data[key]
            }
        }
    }
    scene[COMPONENT_TYPES.PHYSICS_COMPONENT].set(aid, component)
}

export function editPhysicsComponent(info:any, scene:Scene){
    let physicsInfo:any = scene[COMPONENT_TYPES.PHYSICS_COMPONENT].get(info.aid)
    if(!physicsInfo){
        return
    }

    switch(info.action){
        case 'edit':
            for(let key in info){
                if(key === "materials"){
    
                }else if(key === "contactMaterials"){
    
                }else{
                    physicsInfo[key] = info[key]

                    if(key === "type" && info[key] === 1){
                        physicsInfo.mass = 1
                        physicsInfo.linearDamping = 1
                        physicsInfo.angularDamping = 1
                        physicsInfo.offset = new Vector3({x:0, y:0, z:0})
                        physicsInfo.size = new Vector3({x:0.5, y:0.5, z:0.5})
                    }
                }
            }
            break;

        case 'add-material':
            if(!physicsInfo.materials){
                physicsInfo.materials = new ArraySchema()
            }
            physicsInfo.materials.push(info['material'])
            break;

         case 'add-contact-material':
            if(!physicsInfo.contactMaterials){
                physicsInfo.contactMaterials = new MapSchema()
            }
            physicsInfo.contactMaterials.set(info.contactMaterial.name, new PhysicsContactMaterialsComponent(info.contactMaterial))
            break;

        case 'delete-contact-material':
            physicsInfo.contactMaterials.delete(info.contactMaterial)
            break;

        case 'delete-material':
            let materialIndex = physicsInfo.materials.findIndex(($:any)=> $ === info.material)
            if(materialIndex >= 0){
                physicsInfo.materials.splice(materialIndex,1)
            }
            break;

        case 'size-offset':
            let transform = info['size-offset'].transform
            console.log('transform is', transform)

            physicsInfo.offset = new Vector3({x:transform.position.x, y:transform.position.y, z:transform.position.z})
            physicsInfo.size = new Vector3({x:transform.scale.x, y:transform.scale.y, z:transform.scale.z})
            break;

        default:
            break;
    }
}
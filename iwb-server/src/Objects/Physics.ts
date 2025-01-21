import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";
import { Vector3 } from "./Transform";
import { IWBRoom } from "../rooms/IWBRoom";
import { CANNON } from "../utils/libraries";

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
    @type("boolean") fixedRotation:boolean
    @type("boolean") playerReactGravity:boolean
    @type("number") gravity:number

    cannonBody:any
    cannonMaterials:any
    // cannonContactMaterials:any
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

                    if(key === "type" && info[key] === 0){
                        physicsInfo.gravity = -9.82
                        physicsInfo.playerReactGravity = false
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

export async function CheckPhysicsCache(scene:Scene, aid:string, jsonScene:any){
    let itemInfo = scene[COMPONENT_TYPES.PHYSICS_COMPONENT].get(aid)
    if(itemInfo){
        let itemJSON:any = itemInfo.toJSON()
        if(itemInfo.type === 1){
            itemJSON.contactMaterials = {}
        }
        jsonScene[COMPONENT_TYPES.PHYSICS_COMPONENT][aid] = itemJSON
    }
    return jsonScene
}

export function initRoomPhysics(room:IWBRoom){
    room.state.physicsWorld = new CANNON.World()
    room.state.physicsWorld.gravity.set(0,-9.82, 0)

    let groundMaterial = addCannonMaterial(room, "ground")
    let vehicleMaterial = addCannonMaterial(room, "vehicle")
    addCannonMaterial(room, "player")
  
    const groundBody: CANNON.Body = new CANNON.Body({
      mass: 0, // mass === 0 makes the body static,
      material: groundMaterial,
      shape:new CANNON.Plane()
    })
    groundBody.position.set(0, 0, 0); // X = 0, Y = -1 (down by 1), Z = 0//
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2) // Reorient ground plane to be in the y-axis
  
    groundBody.collisionFilterGroup = 1; // We'll use 1 for terrain, 2 for vehicles, 3 for balls
    groundBody.collisionFilterMask = 1 //| 2 | 3 | 4 | 5
  
    vehicleMaterial.friction    = 1
    vehicleMaterial.restitution = 0
  
    // Set restitution to 0 to avoid bouncing
    const carGroundContactMaterial = new CANNON.ContactMaterial(vehicleMaterial, groundMaterial, {
      friction: 0.8,    // Adjust friction as needed for grip
      restitution: 0.0  // No bounce
    });
    world.addContactMaterial(carGroundContactMaterial);
    world.addBody(groundBody)



    room.state.physicsInterval = room.clock.setInterval(()=>{
        physicsTick(room)
    }, 1000 / 60)
}

export function disableRoomPhysics(room:IWBRoom){
    room.state.scenes.forEach((scene:Scene, sceneId:string)=>{
        scene[COMPONENT_TYPES.PHYSICS_COMPONENT].forEach((physics:PhysicsComponent, aid:string)=>{
            if(physics.type === 1){
                room.state.physicsWorld.removeBody(physics.cannonBody)
            }
        })
    })
    room.state.physicsWorld.bodies.length = 0
    room.state.physicsWorld = null
}

export function physicsTick(room:IWBRoom){
    const fixedTimeStep = 1.0 / 60.0;
    const maxSubSteps = 3;
    room.state.physicsWorld.step(fixedTimeStep, room.clock.currentTime, maxSubSteps);
}

export function addCannonMaterial(room:IWBRoom, material:string){
    let cannonMaterial = new CANNON.Material(material)
    room.state.cann.set(material, cannonMaterial)
    retryPendingContactMaterials();
    return cannonMaterial
}

import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Vector3 } from "./Transform";
import { COMPONENT_TYPES } from "../utils/types";
import { Scene } from "./Scene";

export class PhysicsMaterialsComponent extends Schema{
    cannonMaterial:any
}

export class PhysicsContactMaterialsComponent extends Schema{
    @type("number") friction:number = 0
    @type("number") restitution:number = 0
    @type("string") from:string
    @type("string") to:string
}

export class PhysicsBodiesComponent extends Schema{
    @type("string") material:string
    @type("number") shape:number = 0 //0 - box, 1 - plane
    @type("number") linearDamping:number = 0.5
    @type("number") angularDamping:number = 0.5
    entity:any
    cannonBody:any
}

export class VehicleComponent extends Schema{
    @type("number") acceleration:number = 800
    @type("number") angularVelocity:number = 0
    @type("number") currentSpeed:number = 0
    @type("string") driver:string
    @type(Vector3) entityOffset:Vector3 = new Vector3({x:0, y:-0.5, z:0})
    @type("number") heading:number = 0
    @type(Vector3) holderPos:Vector3 = new Vector3({x:0, y:0, z:0})
    @type(Vector3) holderScl:Vector3 = new Vector3({x:2, y:2, z:2})
    @type("number") maxSpeed:number = 100
    @type("number") maxTurn:number = 200
    @type("number") maxVelocity:number = 50
    @type("string") model:string
    @type("number") targetHeading:number = 0
    @type("number") timeSinceLastTweenPos:number = 0
    @type("number") timeSinceLastTweenRot:number = 0
    @type("number") timeToNextTweenPos:number = 0
    @type("number") timeToNextTweenRot:number = 0
    @type("number") turning:number = 0
    @type("number") tweenPosDuration:number = 250
    @type("number") tweenRotDuration:number = 250
    @type("number") velocity:number = 0
    @type("boolean") forward:boolean = true
    @type("boolean") accelerating:boolean = true
    @type("boolean") active:boolean = false
    @type("boolean") occupied:boolean = false
    @type("boolean") locked:boolean = false

    holder:any
    entityPos:any
    entityRot:any
    cannonBody:any
}

export function createVehicleComponent(scene:Scene, aid:string, data?:any){
    let component:any = new VehicleComponent()
    if(data){
        for(let key in data){
            if(["entityOffset", "holderPos", "holderScl"].includes(key)){
                component[key] = new Vector3(data[key])
            }else{
                component[key] = data[key]
            }
           
        }
    }
    scene[COMPONENT_TYPES.VEHICLE_COMPONENT].set(aid, component)
}

export function editVehicleComponent(){

}
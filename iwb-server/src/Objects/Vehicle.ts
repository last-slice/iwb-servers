import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Vector3 } from "./Transform";
import { COMPONENT_TYPES } from "../utils/types";
import { Scene } from "./Scene";
import { createPointerComponent } from "./Pointers";
import { IWBRoom } from "../rooms/IWBRoom";
import { Player } from "./Player";

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
    @type("string") driver:string = ""
    @type("string") model:string

    @type("number") type:number = -1 // 0 - ground vehicle, 1 - flying vehicle
    @type("number") acceleration:number = 500
    @type("number") angularVelocity:number = 0
    @type("number") currentSpeed:number = 0
    @type("number") heading:number = 0
    @type("number") mass:number = 500
    @type("number") maxSpeed:number = 80
    @type("number") maxTurn:number = 200
    @type("number") maxVelocity:number = 50
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
    @type("boolean") accelerating:boolean = false
    @type("boolean") active:boolean = false
    @type("boolean") occupied:boolean = false
    @type("boolean") locked:boolean = false
    @type("boolean") forceFPV:boolean = false

    @type(Vector3) entityOffset:Vector3 = new Vector3({x:0, y:-1, z:0})
    @type(Vector3) holderPos:Vector3 = new Vector3({x:0, y:0, z:0})

    holder:any
    holderL:any
    holderR:any
    holderF:any
    holderB:any
    holderG:any
    entityPos:any
    entityRot:any
    cannonBody:any
    forceFPVEntity:any
    prevCamMode:any
}

export function createVehicleComponent(scene:Scene, aid:string, data?:any){
    let component:any = new VehicleComponent()
    if(data){
        for(let key in data){
            if(["entityOffset", "holderPos"].includes(key)){
                component[key] = new Vector3(data[key])
            }else{
                component[key] = data[key]
            }
        }
    }
    component.driver = ""
    component.active = false
    scene[COMPONENT_TYPES.VEHICLE_COMPONENT].set(aid, component)
}

export function editVehicleComponent(room:IWBRoom, info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.VEHICLE_COMPONENT].get(info.aid)
    if(!itemInfo){
        return
    }

    switch(info.action){
        case 'type':
            itemInfo.type = info.type
            break;

        case 'edit':
            for(let key in info){
                if(["entityOffset", "holderPos"].includes(key)){
                    itemInfo[key] = new Vector3(info[key])
                }else{
                    itemInfo[key] = info[key]
                }
            }
            break;

        case 'driver':
            if(info['occupied'] !== ""){
                itemInfo.active = true
                itemInfo.driver = info["occupied"]

                let player:Player = room.state.players.get(info['occupied'])
                if(player){
                    player.vehicle = info.aid
                }
            }else{
                itemInfo.active = false
                

                let player:Player = room.state.players.get(itemInfo.driver)
                if(player){
                    player.vehicle = ""
                }
                itemInfo.driver = ""
            }
            break;
    }
}
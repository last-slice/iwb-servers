import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Vector3 } from "./Transform";
import { COMPONENT_TYPES } from "../utils/types";
import { Scene } from "./Scene";
import { createPointerComponent } from "./Pointers";
import { IWBRoom } from "../rooms/IWBRoom";
import { Player } from "./Player";

export class WeaponComponent extends Schema{
    @type("string") aid:string
    @type("number") type:number = -1 // 0 - gun, 1 - projectile
    @type("number") anchorPointId:number
    @type("boolean") synced:boolean = false

    @type(Vector3) pOffsetFPV:Vector3 = new Vector3({x:0, y:0, z:0})
    @type(Vector3) rOffsetFPV:Vector3 = new Vector3({x:0, y:0, z:0})
    @type(Vector3) sizeFPV:Vector3 = new Vector3({x:1, y:1, z:1})
    @type(Vector3) muzzleOffsetFPV:Vector3 = new Vector3({x:0, y:0, z:0})

    @type("string") audioActionId:string
    @type("string") audioActionAid:string

    //gun weapon
    @type("number") magSize:number
    @type("number") ammo:number
    @type("number") maxAmmo:number
    @type("number") range:number
    @type("number") velocity:number
    @type("number") fireRate:number
    @type("number") reloadTime:number
    @type("number") recoilSpeed:number
    @type("string") projectile:string
    @type("boolean") fireAuto:boolean
    @type("boolean") forceFPV:boolean

    weaponFPVParentEntity:any
    weaponFPVEntity:any
    weaponEntity:any
    weaponMuzzleEntity:any
}

export function createWeaponComponent(room:IWBRoom, scene:Scene, aid:string, data?:any){
    console.log('creating weapon component')
    let component:any = new WeaponComponent()
    if(data){
        for(let key in data){
            if(["pOffsetFPV", "rOffsetFPV", "sizeFPV", "muzzleOffsetFPV"].includes(key)){
                component[key] = new Vector3(data[key])
            }else{
                component[key] = data[key]
            }
        }
    }
    scene[COMPONENT_TYPES.WEAPON_COMPONENT].set(aid, component)
}

export function editWeaponComponent(room:IWBRoom, info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.WEAPON_COMPONENT].get(info.aid)
    if(!itemInfo){
        return
    }

    switch(info.action){
        case 'type':
            itemInfo.type = info.type
            if(itemInfo.type === 0){
                itemInfo.anchorPointId = 1
                itemInfo.forceFPV = true
                itemInfo.range = 30
                itemInfo.recoilSpeed = 3
                itemInfo.ammo = 10
                itemInfo.magSize = 10
                itemInfo.maxAmmo = 100
                itemInfo.fireRate = 3
                itemInfo.velocity = 5
                itemInfo.fireAuto = false
                itemInfo.aid = info.aid
            }
            break;

        case 'edit':
            let data = info.data
            for(let key in data){
                if(["pOffsetFPV", "rOffsetFPV", "sizeFPV", "muzzleOffsetFPV"].includes(key)){
                    itemInfo[key] = new Vector3(data[key])
                }else{
                    itemInfo[key] = data[key]
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
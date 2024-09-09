import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class GameItemComponent extends Schema{
    @type("number") type:number //0 - gun, 1 - variable, 2 - 
    @type("number") magSize:number
    @type("number") ammo:number
    @type("number") maxAmmo:number
    @type("number") range:number
    @type("number") fireRate:number
    @type("number") relaodTime:number
    @type("string") projectile:string
    @type({map:"number"}) variables:MapSchema<number> = new MapSchema()
}

export function createGameItemComponent(scene:Scene, aid:string, data?:any){
    let component = new GameItemComponent()
    if(data){
        for(let key in data.variables){
            component.variables.set(key, data.variables[key])
        }
    }else{
        let gameInfo = scene[COMPONENT_TYPES.GAME_COMPONENT].get(scene.id)
        if(gameInfo){
            gameInfo.variables.forEach((variable:string)=>{
                component.variables.set(variable, 0)
            })
        }
    }
    scene[COMPONENT_TYPES.GAME_ITEM_COMPONENT].set(aid, component)
}

export function editGameItemComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.GAME_ITEM_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}
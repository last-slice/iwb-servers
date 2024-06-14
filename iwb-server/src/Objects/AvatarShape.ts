import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES, Color4 } from "../utils/types";

export class AvatarShapeComponent extends Schema{
    @type("string") name:string = "NPC"
    @type("number") bodyShape:number = 0
    @type("number") type:number = 0
    @type("number") change:number = 0
    @type("boolean") displayName: boolean = true
    @type(['string']) wearables = new ArraySchema<string>()
    @type(Color4) eyeColor = new Color4({r:0,g:0,b:0,a:1})
    @type(Color4) skinColor = new Color4({r:215,g:170,b:105,a:1})
    @type(Color4) hairColor = new Color4({r:0,g:0,b:0,a:1})
}

export function createAvatarShapeComponent(scene:Scene, aid:string, data:any){
    let component = new AvatarShapeComponent()
    component.name = data.name
    component.displayName = data.displayName
    component.bodyShape = data.bodyShape
    component.wearables = data.wearables
    component.eyeColor = new Color4(data.eyeColor)
    component.skinColor = new Color4(data.skinColor)
    component.hairColor = new Color4(data.hairColor)
    
    scene[COMPONENT_TYPES.AVATAR_SHAPE_COMPONENT].set(aid, component)
}

export function editAvatarShapeComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.IWB_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}
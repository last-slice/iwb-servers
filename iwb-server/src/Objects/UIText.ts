import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class UITextComponent extends Schema{
    @type("string") src:string
    @type("string") label:string
    @type("string") data:string
    @type("number") style:number // 0 for sdk text, 1 for asset pack text
    @type("number") type:number // 0 for nothing, 1 for state, 2 for counter
    @type("string") aid:string
    @type("string") state:string
    @type("number") counter:number
    @type("number") tAlign:number
    @type("number") size:number
    @type("number") pt:number
    @type("number") pl:number
    @type("number") pr:number
    @type("number") pb:number
}

export function createUITextComponent(scene:Scene, aid:string, data:any){
    // console.log('creating ui component', data)
    let component:any = new UITextComponent()
    for(let key in data){
        component[key] = data[key]
    }
    scene[COMPONENT_TYPES.UI_TEXT_COMPONENT].set(aid, component)
}

export function editUIComponent(info:any, scene:any){
    let uiComponent = scene[COMPONENT_TYPES.UI_TEXT_COMPONENT].get(info.aid)
    if(!uiComponent){
        scene[COMPONENT_TYPES.UI_TEXT_COMPONENT].set(info.aid, new UITextComponent())
    }

    uiComponent = scene[COMPONENT_TYPES.UI_TEXT_COMPONENT].get(info.aid)
    for(let key in info.data){
        uiComponent[key] = info.data[key]
    }
}
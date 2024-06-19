import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Client } from "colyseus";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

export class UIImageComponent extends Schema{
    @type("string") src:string
    @type("string") aid:string
    @type("number") width:number
    @type("number") height:number
    @type("number") pt:number
    @type("number") pl:number
    @type("number") pr:number
    @type("number") pb:number
}

export function createUIImageComponent(scene:Scene, aid:string, data:any){
    let component:any = new UIImageComponent()
    for(let key in data){
        component[key] = data[key]
    }
    scene[COMPONENT_TYPES.UI_IMAGE_COMPONENT].set(aid, component)
}

export function editUIImageComponent(info:any, scene:any){
    let uiComponent = scene[COMPONENT_TYPES.UI_IMAGE_COMPONENT].get(info.aid)
    if(!uiComponent){
        scene[COMPONENT_TYPES.UI_IMAGE_COMPONENT].set(info.aid, new UIImageComponent())
    }

    uiComponent = scene[COMPONENT_TYPES.UI_IMAGE_COMPONENT].get(info.aid)
    for(let key in info.data){
        uiComponent[key] = info.data[key]
    }
}
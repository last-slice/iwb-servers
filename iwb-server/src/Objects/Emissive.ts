import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { Color4 } from "../utils/types";

export class EmissiveComponent extends Schema{
    @type("number") type:number //0 - texture, 1 - video
    @type("string") path:string
    @type(Color4) color:Color4 = new Color4({r:1, g:1, b:1, a:1})
    @type("number") intensity:number = .1
}

export function createEmissiveComponent(scene:Scene, aid:string, data:any){
    let component = new EmissiveComponent()
    component.type = 0
    component.path = data.path ? data.path : undefined
    data.color ? component.color = new Color4(data.color) : null
    component.intensity = data.intensity ? data.intensity : 0
    scene.emissives.set(aid, component)
}

export function editEmissiveComponent(info:any, scene:Scene){
    let itemInfo:any = scene.emissives.get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]

                if(itemInfo.type === 1){
                    itemInfo.path = undefined
                }
            }
        }
    }
}
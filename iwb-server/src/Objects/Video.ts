import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";

//https://player.vimeo.com/external/917240498.m3u8?s=50ca7a3e589f79fb4feafefd94e393986e534907&logging=false

export class VideoComponent extends Schema {
    @type("string") url:string
    @type("number") volume:number
    @type("boolean") autostart:boolean = false
    @type("boolean") loop:boolean = false
}

export function createVideoComponent(scene:Scene, aid:string, data?:any){
    let component:any = new VideoComponent()
    if(data){
        for(let key in data){
            if(component[key]){
                if(key === "volume" && data[key] > 1){
                    component[key] = 1
                }else{
                    component[key] = data[key]
                }
            }
        }
    }else{
        component.volume = 1
        component.autostart = false
        component.loop = false
    }

    scene[COMPONENT_TYPES.VIDEO_COMPONENT].set(aid, component)
}

export function editVideoComponent(info:any, scene:Scene){
    let itemInfo:any = scene[COMPONENT_TYPES.VIDEO_COMPONENT].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}
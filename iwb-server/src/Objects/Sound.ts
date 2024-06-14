import {ArraySchema, Schema, type, filter, MapSchema} from "@colyseus/schema";
import { Scene } from "./Scene";
import { COMPONENT_TYPES } from "../utils/types";


export class SoundComponent extends Schema {
    @type("string") url:string = ""
    @type("number") volume:number = 1
    @type("boolean") autostart:boolean = false
    @type("boolean") loop:boolean = false
    @type("boolean") attach:boolean = false
}

export function createAudioSourceComponent(scene:Scene, aid:string, data:any){
    let component:any = new SoundComponent()
    if(data){
        for(let key in data){
            if(data.hasOwnProperty(key)){
                component[key] = data[key]
            }
        }
    }
    scene[COMPONENT_TYPES.AUDIO_SOURCE_COMPONENT].set(aid, component)
}

export function createAudioStreamComponent(scene:Scene, aid:string, data:any){
    let component:any = new SoundComponent()
    if(data){
        for(let key in data){
            if(data.hasOwnProperty(key)){
                component[key] = data[key]
            }
        }
    }
    scene[COMPONENT_TYPES.AUDIO_STREAM_COMPONENT].set(aid, component)
}

export function editAudioComponent(info:any, scene:any, component:COMPONENT_TYPES){
    let itemInfo:any = scene[component].get(info.aid)
    if(itemInfo){
        for(let key in info){
            if(itemInfo.hasOwnProperty(key)){
                itemInfo[key] = info[key]
            }
        }
    }
}